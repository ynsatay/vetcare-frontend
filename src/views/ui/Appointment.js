import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tr from "date-fns/locale/tr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import axiosInstance from "../../api/axiosInstance.ts";
import MainModal from "../../components/MainModal";
import AppointmentForm from "../popup/AppointmentForm";
import AppointmentDetails from "../popup/AppDetail";
import { useConfirm } from "../../components/ConfirmContext";

dayjs.extend(utc);
dayjs.extend(timezone);

const statusColors = {
  0: "#4e73df", // Beklemede → Mavi
  1: "#f6c23e", // Geldi → Sarı
  2: "#1cc88a", // Tamamlandı → Yeşil
  3: "#e74a3b", // İptal Edildi → Kırmızı
};

const Appointment = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [startDate, setStartDate] = useState(null); // UTC Date objesi
  const [endDate, setEndDate] = useState(null);
  const [initialName, setInitialName] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");

  const formRef = useRef();
  const calendarRef = useRef();

  const { confirm } = useConfirm();

  // Fetch appointments from backend and map dates as UTC Date objects
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/getappointment");
      if (res.data.status === "success") {
        const appts = res.data.data.map((item) => ({
          id: item.id.toString(),
          title: `${item.user_name} - ${item.animal_name || ""}`,
          start: dayjs.utc(item.start_time).toDate(), // UTC Date object
          end: dayjs.utc(item.end_time).toDate(), // UTC Date object
          backgroundColor: statusColors[item.status] || "#4e73df",
          borderColor: statusColors[item.status] || "#4e73df",
          textColor: "#fff",
          extendedProps: {
            notes: item.notes,
            app_type: item.app_type,
            user_id: item.user_id,
            status: item.status,
          },
        }));
        setEvents(appts);
      } else {
        setEvents([]);
        console.error("Randevu verisi alınamadı:", res.data);
      }
    } catch (err) {
      setEvents([]);
      console.error("Randevu verisi alma hatası:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Calendar event select (create new)
  const handleSelect = (selectInfo) => {
    const calendarApi = calendarRef.current?.getApi();
    const viewType = calendarApi?.view?.type;
    const now = dayjs.utc();
    const selectedStart = dayjs.utc(selectInfo.start);

    if (viewType === "dayGridMonth") {
      // Ay görünümü sadece tarih kontrolü UTC olarak
      if (selectedStart.isBefore(now.startOf("day"))) {
        confirm("Geçmiş bir güne randevu veremezsiniz.", "Tamam", "", "Uyarı");
        return;
      }
    } else {
      if (selectedStart.isBefore(now)) {
        confirm("Geçmiş bir saate randevu veremezsiniz.", "Tamam", "", "Uyarı");
        return;
      }
    }

    let adjustedEnd;
    const isSameDay = selectedStart.isSame(dayjs.utc(selectInfo.end).subtract(1, "ms"), "day");

    if (isSameDay) {
      adjustedEnd = selectedStart.add(30, "minute");
    } else {
      adjustedEnd = dayjs.utc(selectInfo.end).subtract(1, "ms").endOf("day");
    }

    setStartDate(selectedStart.toDate());
    setEndDate(adjustedEnd.toDate());
    setInitialName("");
    setShowModal(true);
  };

  // Calendar event click (show detail)
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowDetailModal(true);
  };

  // Save new appointment
  const handleSave = async (newEvent) => {

    if (newEvent) {
      let {
        user_animal_id,
        start_time,
        end_time,
        notes,
        app_type,
        appDay
      } = newEvent;

      if (currentView !== "dayGridMonth") {
        appDay = false;
      }

      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      const oneDay = 24 * 60 * 60 * 1000;

      // const setTimeToDate = (date, timeRef) => {
      //   const newDate = new Date(date);
      //   newDate.setHours(timeRef.getHours(), timeRef.getMinutes(), 0, 0);
      //   return newDate;
      // };

      try {
        const dayCount = Math.floor((endDate - startDate) / oneDay) + 1;
        if (appDay && (dayCount > 1)) {
          // Çok günlük randevu ise günlere böl
          for (let i = 0; i < dayCount; i++) {
            const currentDate = new Date(startDate.getTime() + i * oneDay);

            // Her güne özel sabit saat verelim örnek: 09:00 - 17:00
            const currentStart = new Date(currentDate);
            currentStart.setHours(9, 0, 0, 0); // 09:00

            const currentEnd = new Date(currentDate);
            currentEnd.setHours(17, 0, 0, 0); // 17:00

            const response = await axiosInstance.post("/addappointment", {
              user_animal_id,
              process_date: new Date(),
              start_time: currentStart,
              end_time: currentEnd,
              notes: notes || null,
              status: 0,
              app_type: app_type || 0,
            });

            if (response.data.status !== "success") {
              console.error("Error saving appointment:", response.data.message);
              confirm("Randevu kaydı başarısız: " + response.data.message, "Tamam", "", "Uyarı");
              break;
            }
          }
        } else {
          const response = await axiosInstance.post("/addappointment", {
            user_animal_id,
            process_date: new Date(),
            start_time,
            end_time,
            notes: notes || null,
            status: 0,
            app_type: app_type || 0,
          });

          if (response.data.status !== "success") {
            console.error("Error saving appointment:", response.data.message);
            confirm("Randevu kaydı başarısız: " + response.data.message, "Tamam", "", "Uyarı");
          }
        }

        await fetchAppointments();
        setShowModal(false);
      } catch (error) {
        console.error("Error saving appointment:", error);
      }
      setShowModal(false);
    }
  };

  // Calendar view change
  const handleDatesSet = (arg) => {
    setCurrentView(arg.view.type);
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
        <h4 className="mb-4">📅 Randevu Takibi Ekranı</h4>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          ref={calendarRef}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          events={events}
          datesSet={handleDatesSet}
          eventDisplay="block"
          locale={tr}
          timeZone="UTC" // Burada UTC ayarlı
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
            <div style={{ width: 20, height: 20, backgroundColor: '#4e73df', borderRadius: 4 }}></div>
            <span>Beklemede</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#f6c23e', borderRadius: 4 }}></div>
            <span>Geldi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#1cc88a', borderRadius: 4 }}></div>
            <span>Tamamlandı</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, backgroundColor: '#e74a3b', borderRadius: 4 }}></div>
            <span>İptal Edildi</span>
          </div>
        </div>

        <MainModal
          isOpen={showModal}
          toggle={() => setShowModal(false)}
          title="Randevu Oluştur"
          content={
            <AppointmentForm
              ref={formRef}
              startDateProp={startDate}
              endDateProp={endDate}
              initialName={initialName}
              currentView={currentView}
            />
          }
          onSave={handleSave}
          saveButtonLabel="Kaydet"
        />

        <MainModal
          isOpen={showDetailModal}
          toggle={() => setShowDetailModal(false)}
          title="Randevu Detayı"
          content={
            <AppointmentDetails
              event={selectedEvent}
              onClose={() => setShowDetailModal(false)}
              onUpdateSuccess={fetchAppointments}
            />
          }
          saveButtonLabel="Tamam"
          onSave={() => setShowDetailModal(false)}
          ShowFooter={false}
        />
      </div>
    </div>
  );
};

export default Appointment;
