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

const VaccinationTracker = () => {
  const calendarRef = useRef(null);
  const formRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [currentRange, setCurrentRange] = useState({ start: null, end: null });
  const [showVaccineModal, setShowVaccineModal] = useState(false);

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
        params: {
          startDate: startStr,
          endDate: endStr,
          includeUnplanned: true,
        },
      });

      const formatted = response.data.map((event) => ({
        id: `${event.type}-${event.id}`,
        title: `💉 ${event.vaccine_name}-${event.animal_name}`,
        date: event.date,
        backgroundColor: event.type === "plan" ? "#26a69a" : "#4caf50",
        borderColor: "#ccc",
        textColor: "#fff",
      }));

      setEvents(formatted);
    } catch (error) {
      console.error("Aşı takvimi verileri alınamadı:", error);
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentRange({ start: dateInfo.start, end: dateInfo.end });
    fetchEvents(dateInfo.startStr, dateInfo.endStr);
  };

  // Etkinlik tıklanınca (isteğe bağlı detay işlemleri)
  const handleEventClick = ({ event }) => {
    const [type, realId] = event.id.split("-");
    if (type === "plan") {
      console.log("Plan detay düzenleme:", realId);
      // İstersen buraya plan düzenleme modal açma kodu ekleyebilirsin
    } else {
      console.log("Uygulanan aşı detay:", realId);
      // Sadece görüntüleme vs.
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

  // Kaydet butonuna basılınca çağrılır
  const handleSave = async () => {
    setShowVaccineModal(false);
    if (!currentRange.start || !currentRange.end) return;

    // Burada currentRange tarihlerini biraz genişletebilirsin
    const startDate = new Date(currentRange.start);
    const endDate = new Date(currentRange.end);

    // Örneğin 1 ay öncesi
    startDate.setMonth(startDate.getMonth() - 1);
    // 1 ay sonrası
    endDate.setMonth(endDate.getMonth() + 1);

    fetchEvents(startDate.toISOString(), endDate.toISOString());
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
      </div>
    </div>
  );
};

export default VaccinationTracker;
