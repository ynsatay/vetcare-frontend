import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tr from "date-fns/locale/tr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  PawPrint
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance.ts";
import MainModal from "../../components/MainModal";
import AppointmentForm from "../popup/AppointmentForm";
import AppointmentDetails from "../popup/AppDetail";
import { useConfirm } from "../../components/ConfirmContext";
import "./Appointment.css";
import { useLanguage } from "../../context/LanguageContext.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const statusColors = {
  0: "#7c3aed",
  1: "#d97706",
  2: "#059669",
  3: "#dc2626",
};

const Appointment = () => {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [initialName, setInitialName] = useState("");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [miniCalendarDate, setMiniCalendarDate] = useState(dayjs());

  const formRef = useRef();
  const calendarRef = useRef();

  const { confirm } = useConfirm();

  const stats = useMemo(() => {
    const pending = events.filter(e => e.extendedProps?.status === 0).length;
    const arrived = events.filter(e => e.extendedProps?.status === 1).length;
    const completed = events.filter(e => e.extendedProps?.status === 2).length;
    const cancelled = events.filter(e => e.extendedProps?.status === 3).length;
    return { pending, arrived, completed, cancelled };
  }, [events]);

  const miniCalendarDays = useMemo(() => {
    const startOfMonth = miniCalendarDate.startOf('month');
    const endOfMonth = miniCalendarDate.endOf('month');
    const startDay = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
    
    const days = [];
    const prevMonth = startOfMonth.subtract(1, 'day');
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonth.subtract(i, 'day').date(), isOtherMonth: true });
    }
    
    for (let i = 1; i <= endOfMonth.date(); i++) {
      const date = miniCalendarDate.date(i);
      const hasEvent = events.some(e => dayjs(e.start).isSame(date, 'day'));
      days.push({ 
        day: i, 
        isOtherMonth: false, 
        isToday: date.isSame(dayjs(), 'day'),
        hasEvent 
      });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isOtherMonth: true });
    }
    
    return days;
  }, [miniCalendarDate, events]);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/getappointment");
      if (res.data.status === "success") {
        const appts = res.data.data.map((item) => ({
          id: item.id.toString(),
          title: `${item.user_name} - ${item.animal_name || ""}`,
          start: dayjs(item.start_time).toDate(),
          end: dayjs(item.end_time).toDate(),
          backgroundColor: statusColors[item.status] || "#7c3aed",
          borderColor: statusColors[item.status] || "#7c3aed",
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
      }
    } catch (err) {
      setEvents([]);
      console.error("Randevu verisi alma hatası:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateAppointmentTimes = async (event) => {
    const startLocal = dayjs(event.start);
    const endLocal = dayjs(event.end || event.start);
    const payload = {
      id: event.id,
      start_time: startLocal.format("YYYY-MM-DD HH:mm:ss"),
      end_time: endLocal.format("YYYY-MM-DD HH:mm:ss"),
      status: event.extendedProps?.status ?? 0,
    };
    await axiosInstance.post("/updateappointment", payload);
  };

  const handleSelect = (selectInfo) => {
    const calendarApi = calendarRef.current?.getApi();
    const viewType = calendarApi?.view?.type;
    const now = dayjs();
    const selectedStart = dayjs(selectInfo.start);

    if (viewType === "dayGridMonth") {
      if (selectedStart.isBefore(now.startOf("day"))) {
        confirm(t('CannotSchedulePastDay'), t('Ok'), "", t('Warning'));
        return;
      }
    } else {
      if (selectedStart.isBefore(now)) {
        confirm(t('CannotSchedulePastTime'), t('Ok'), "", t('Warning'));
        return;
      }
    }

    let adjustedEnd;
    const isSameDay = selectedStart.isSame(dayjs(selectInfo.end).subtract(1, "ms"), "day");

    if (isSameDay) {
      adjustedEnd = selectedStart.add(30, "minute");
    } else {
      adjustedEnd = dayjs(selectInfo.end).subtract(1, "ms").endOf("day");
    }

    setStartDate(selectedStart.toDate());
    setEndDate(adjustedEnd.toDate());
    setInitialName("");
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowDetailModal(true);
  };

  const handleEventChange = async (changeInfo) => {
    const { event, revert } = changeInfo;
    try {
      setIsUpdating(true);
      await updateAppointmentTimes(event);
      await fetchAppointments();
      confirm(t('AppointmentDateUpdated'), t('Ok'), "", t('Info'));
    } catch (err) {
      if (err.__demo_blocked) return; 
      console.error("Randevu güncelleme hatası:", err);
      revert();
      confirm(t('UpdateFailedTryAgain'), t('Ok'), "", t('Warning'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (newEvent) => {
    if (newEvent) {
      let { user_animal_id, start_time, end_time, notes, app_type, appDay } = newEvent;

      if (currentView !== "dayGridMonth") {
        appDay = false;
      }

      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      const oneDay = 24 * 60 * 60 * 1000;

      try {
        const dayCount = Math.floor((endDate - startDate) / oneDay) + 1;
        if (appDay && dayCount > 1) {
          for (let i = 0; i < dayCount; i++) {
            const currentDate = new Date(startDate.getTime() + i * oneDay);
            const currentStart = new Date(currentDate);
            currentStart.setHours(9, 0, 0, 0);
            const currentEnd = new Date(currentDate);
            currentEnd.setHours(17, 0, 0, 0);

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

  const handleDatesSet = (arg) => {
    setCurrentView(arg.view.type);
    setCurrentTitle(arg.view.title);
  };

  const handlePrev = () => calendarRef.current?.getApi()?.prev();
  const handleNext = () => calendarRef.current?.getApi()?.next();
  const handleToday = () => calendarRef.current?.getApi()?.today();
  const handleViewChange = (view) => calendarRef.current?.getApi()?.changeView(view);

  const openNewAppointmentModal = () => {
    const now = dayjs();
    setStartDate(now.toDate());
    setEndDate(now.add(30, 'minute').toDate());
    setInitialName("");
    setShowModal(true);
  };

  return (
    <div className="appointment-page">
      <aside className="appointment-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <PawPrint />
            </div>
            <div>
              <div className="logo-text">VetCare</div>
              <div className="logo-subtitle">{t('AppointmentManagement')}</div>
            </div>
          </div>
          
          <button className="new-appointment-btn" onClick={openNewAppointmentModal}>
            <Plus size={20} />
            {t('NewAppointment')}
          </button>
        </div>

        <div className="sidebar-stats">
          <div className="stats-title">{t('AppointmentStatuses')}</div>
          
          <div className="stat-item">
            <div className="stat-left">
              <div className="stat-indicator pending" />
              <span className="stat-name">{t('Waiting')}</span>
            </div>
            <span className="stat-count">{stats.pending}</span>
          </div>
          
          <div className="stat-item">
            <div className="stat-left">
              <div className="stat-indicator arrived" />
              <span className="stat-name">{t('Arrived')}</span>
            </div>
            <span className="stat-count">{stats.arrived}</span>
          </div>
          
          <div className="stat-item">
            <div className="stat-left">
              <div className="stat-indicator completed" />
              <span className="stat-name">{t('Completed')}</span>
            </div>
            <span className="stat-count">{stats.completed}</span>
          </div>
          
          <div className="stat-item">
            <div className="stat-left">
              <div className="stat-indicator cancelled" />
              <span className="stat-name">{t('Cancelled')}</span>
            </div>
            <span className="stat-count">{stats.cancelled}</span>
          </div>
        </div>

        <div className="sidebar-mini-calendar">
          <div className="mini-calendar-header">
            <span className="mini-calendar-title">
              {miniCalendarDate.format('MMMM YYYY')}
            </span>
            <div className="mini-calendar-nav">
              <button 
                className="mini-nav-btn" 
                onClick={() => setMiniCalendarDate(d => d.subtract(1, 'month'))}
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                className="mini-nav-btn"
                onClick={() => setMiniCalendarDate(d => d.add(1, 'month'))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          <div className="mini-calendar-grid">
            {(lang === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa']).map(d => (
              <div key={d} className="mini-day-header">{d}</div>
            ))}
            {miniCalendarDays.map((d, i) => (
              <div 
                key={i} 
                className={`mini-day ${d.isOtherMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${d.hasEvent ? 'has-event' : ''}`}
                style={{ opacity: d.isOtherMonth ? 0.3 : 1 }}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="appointment-main">
        <header className="main-header">
          <div className="header-left">
            <div className="nav-buttons">
              <button className="nav-btn" onClick={handlePrev}>
                <ChevronLeft size={20} />
              </button>
              <button className="nav-btn" onClick={handleNext}>
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="today-btn" onClick={handleToday}>
              {t('Today')}
            </button>
            <h1 className="current-date">{currentTitle}</h1>
          </div>

          <div className="header-right">
            {isUpdating && (
              <div className="updating-badge">
                <div className="updating-dot" />
                {t('Saving')}
              </div>
            )}
            
            <div className="view-switcher">
              <button
                className={`view-btn ${currentView === "dayGridMonth" ? "active" : ""}`}
                onClick={() => handleViewChange("dayGridMonth")}
              >
                {t('Month')}
              </button>
              <button
                className={`view-btn ${currentView === "timeGridWeek" ? "active" : ""}`}
                onClick={() => handleViewChange("timeGridWeek")}
              >
                {t('Week')}
              </button>
              <button
                className={`view-btn ${currentView === "timeGridDay" ? "active" : ""}`}
                onClick={() => handleViewChange("timeGridDay")}
              >
                {t('Day')}
              </button>
            </div>
          </div>
        </header>

        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            ref={calendarRef}
            selectable={true}
            select={handleSelect}
            eventClick={handleEventClick}
            events={events}
            datesSet={handleDatesSet}
            editable={true}
            eventDurationEditable={true}
            eventDrop={handleEventChange}
            eventResize={handleEventChange}
            eventDisplay="block"
            locale={lang === 'en' ? undefined : tr}
            timeZone="local"
            firstDay={1}
            height="auto"
            dayMaxEvents={3}
            headerToolbar={false}
            nowIndicator={true}
          />
        </div>
      </main>

      <MainModal
        isOpen={showModal}
        toggle={() => setShowModal(false)}
        title={t('AppointmentCreate')}
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
        saveButtonLabel={t('Save')}
      />

      <MainModal
        isOpen={showDetailModal}
        toggle={() => setShowDetailModal(false)}
        title={t('AppointmentDetail')}
        content={
          <AppointmentDetails
            event={selectedEvent}
            onClose={() => setShowDetailModal(false)}
            onUpdateSuccess={fetchAppointments}
          />
        }
        saveButtonLabel={t('Ok')}
        onSave={() => setShowDetailModal(false)}
        ShowFooter={false}
      />
    </div>
  );
};

export default Appointment;
