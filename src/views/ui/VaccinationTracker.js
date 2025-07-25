import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../../api/axiosInstance.ts";
import trLocale from "@fullcalendar/core/locales/tr";
import VaccinationPlanForm from "../popup/VaccinationPlanForm.js";
import MainModal from "../../components/MainModal.js";
import { useConfirm } from "../../components/ConfirmContext";
import "../scss/_appointment.scss";
import VaccinePlanEdit from "../popup/VaccinePlanEdit.js";

const VaccinationTracker = () => {
  const calendarRef = useRef(null);
  const formRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [currentRange, setCurrentRange] = useState({ start: null, end: null });
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [materialsList, setMaterialsList] = useState([]);

  const { confirm } = useConfirm();

  useEffect(() => {
    // Malzeme listesini çek
    axiosInstance.get("/vaccine/materials").then((res) => {
      if (res.data.status === "success") {
        setMaterialsList(res.data.data);
      }
    });
  }, []);

  // Takvimde tarih aralığına göre etkinlikleri çek
  const fetchEvents = async (startStr, endStr) => {
    try {
      const response = await axiosInstance.get("/vaccine/calendarEvents", {
        params: { startDate: startStr, endDate: endStr },
      });

      const formatted = response.data.map((event) => {
        const isApplied = event.is_applied === 1;
        const backgroundColor = isApplied ? "#4caf50" : "#26a69a"; // uygulandı ise yeşil, plan ise turkuaz

        return {
          id: `${event.id}`,
          title: `💉 ${event.vaccine_name}-${event.animal_name}`,
          date: event.date,
          allDay: true,
          backgroundColor,
          borderColor: "#ccc",
          textColor: "#fff",
        };
      });

      setEvents(formatted);
    } catch (error) {
      console.error("Aşı takvimi verileri alınamadı:", error);
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentRange({ start: dateInfo.start, end: dateInfo.end });
    fetchEvents(dateInfo.startStr, dateInfo.endStr);
  };

  const fetchVaccinationPlan = async (id) => {
    try {
      const response = await axiosInstance.get(`/vaccine/plan/${id}`);
      return response.data;
    } catch (error) {
      console.error("Aşı planı alınırken hata:", error);
      return null;
    }
  };

  // Etkinlik tıklanınca plan detaylarını çekip modal aç
  const handleEventClick = async ({ event }) => {
    const realId = event.id; // artık id tek parça
    const planData = await fetchVaccinationPlan(realId);
    if (planData) {
      setSelectedPlan(planData);
      setShowEditModal(true);
    } else {
      confirm("Aşı planı yüklenirken hata oluştu.", "Tamam", "", "Hata");
    }
  };


  // Tarih seçilince modal açılır, geçmişe planlama engellenir
  const handleDateClick = (info) => {
    const clickedDate = new Date(info.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      confirm("Geçmiş bir güne aşı planı yapılamaz.", "Tamam", "", "Uyarı");
      return;
    }

    setStartDate(clickedDate);
    setShowVaccineModal(true);
  };

  const handleModalClose = () => {
    setShowVaccineModal(false);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedPlan(null);
  };

  // Kaydet butonuna basılınca çağrılır
  const handleSave = async () => {
    setShowVaccineModal(false);
    if (!currentRange.start || !currentRange.end) return;

    const startDate = new Date(currentRange.start);
    const endDate = new Date(currentRange.end);

    startDate.setMonth(startDate.getMonth() - 1);
    endDate.setMonth(endDate.getMonth() + 1);

    fetchEvents(startDate.toISOString(), endDate.toISOString());
  };

  // Güncelleme başarılı olunca takvimi yenile
  const handleUpdateSuccess = () => {
    if (!currentRange.start || !currentRange.end) return;
    fetchEvents(currentRange.start.toISOString(), currentRange.end.toISOString());
  };

  return (
    <div style={{ backgroundColor: "#f7f9fc" }}>
      <div
        style={{
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h4 className="mb-4">💉 Aşı Takibi Ekranı</h4>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          ref={calendarRef}
          locale={trLocale}
          selectable={true}
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          eventDisplay="block"
          firstDay={1}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Bugün",
            month: "Ay",
            week: "Hafta",
            day: "Gün",
          }}
        />

        <div style={{ marginTop: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: 4 }}></div>
            <span>Uygulandı</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#26a69a', borderRadius: 4 }}></div>
            <span>Uygulanmadı (Plan)</span>
          </div>
        </div>

        <MainModal
          isOpen={showVaccineModal}
          toggle={handleModalClose}
          title="Aşı Planlama"
          content={
            <VaccinationPlanForm
              ref={formRef}
              materialsList={materialsList}
              initialDate={startDate}
            />
          }
          onSave={handleSave}
          saveButtonLabel="Kaydet"
        />

        <MainModal
          isOpen={showEditModal}
          toggle={handleEditModalClose}
          title="Aşı Planı Düzenle"
          content={
            <VaccinePlanEdit
              plan={selectedPlan}
              onClose={handleEditModalClose}
              onUpdateSuccess={handleUpdateSuccess}
            />
          }
          ShowFooter={false}
        />
      </div>
    </div>
  );
};

export default VaccinationTracker;
