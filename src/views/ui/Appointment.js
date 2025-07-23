import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tr from "date-fns/locale/tr";
import "../scss/_appointment.scss";
import MainModal from "../../components/MainModal";
import AppointmentForm from "../popup/AppointmentForm";
import AppointmentDetails from "../popup/AppDetail";
import axiosInstance from "../../api/axiosInstance.ts";
import { useConfirm } from '../../components/ConfirmContext';

const statusColors = {
  0: "#4e73df",   // Beklemede → Mavi
  1: "#f6c23e",   // Geldi → Sarı
  2: "#1cc88a",   // Tamamlandı → Yeşil
  3: "#e74a3b",   // İptal Edildi → Kırmızı
};

const Appointment = () => {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [initialName, setInitialName] = useState("");

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [currentView, setCurrentView] = useState("dayGridMonth");

  const formRef = useRef();
  const calendarRef = useRef();

  const { confirm } = useConfirm();

  const handleSelect = (selectInfo) => {
    const calendarApi = calendarRef.current?.getApi();
    const viewType = calendarApi?.view?.type;

    const now = new Date();
    const selectedStart = selectInfo.start;

    if (viewType === 'dayGridMonth') {
      // Ay görünümünde sadece tarih kontrolü yap
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDate = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), selectedStart.getDate());

      if (selectedDate < today) {
        confirm("Geçmiş bir güne randevu veremezsiniz.", "Tamam", "", "Uyarı");
        return;
      }
    } else {
      // Saatli görünümde tam zaman kontrolü
      if (selectedStart.getTime() < now.getTime()) {
        confirm("Geçmiş bir saate randevu veremezsiniz.", "Tamam", "", "Uyarı");
        return;
      }
    }

    let end = selectInfo.end;
    const isSameDay =
      selectedStart.toDateString() === new Date(end.getTime() - 1).toDateString();

    let adjustedEnd;
    if (isSameDay) {
      adjustedEnd = new Date(selectedStart.getTime() + 30 * 60 * 1000);
    } else {
      adjustedEnd = new Date(end.getTime() - 1); // end - 1 ms
      adjustedEnd.setHours(23, 59, 59, 999);
    }

    setStartDate(selectedStart);
    setEndDate(adjustedEnd);
    setInitialName("");
    setShowModal(true);
  };


  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/getappointment");
      if (response.data.status === "success") {
        const rawData = response.data.data;

        if (!rawData || rawData.length === 0) {
          setEvents([]);
          return;
        }

        const events = response.data.data.map((item) => {
          const color = statusColors[item.status] || "#4e73df";
          return {
            id: item.id.toString(),
            title: `${item.user_name} - ${item.animal_name || ""}`,
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            backgroundColor: color,
            borderColor: color,
            textColor: "#fff",
            extendedProps: {
              notes: item.notes,
              app_type: item.app_type,
              user_id: item.user_id,
              status: item.status,
            },
          };
        });
        setEvents(events);
      } else {
        setEvents([]);
        console.error("Randevu verisi alınamadı:", response.data);
      }
    } catch (error) {
      setEvents([]);
      console.error("Randevu verisi alma hatası:", error);
    }
  }, []);

  const handleDatesSet = (arg) => {
    setCurrentView(arg.view.type);
  };

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

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div style={{ backgroundColor: "#f7f9fc" }}>
      <div style={{


        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 25px rgba(0,0,0,0.1)"
      }}>
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
          dateClick={(info) => {
            const now = new Date();
            const clickedDate = info.date;

            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const selected = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate());

            if (selected < today) {
              confirm("Geçmiş bir güne randevu veremezsiniz.", "Tamam", "", "Uyarı");
              return;
            }

            const start = clickedDate;
            const end = new Date(clickedDate);
            end.setHours(start.getHours() + 0, start.getMinutes() + 30); // 30 dakika

            setStartDate(start);
            setEndDate(end);
            setInitialName("");
            setShowModal(true);
          }}
        />

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
          content={<AppointmentDetails event={selectedEvent} onClose={() => setShowDetailModal(false)} onUpdateSuccess={fetchAppointments} />}
          saveButtonLabel="Tamam"
          onSave={() => setShowDetailModal(false)}
          ShowFooter={false}
        />
      </div>
    </div>
  );
};

export default Appointment;