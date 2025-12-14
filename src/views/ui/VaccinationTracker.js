import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../../api/axiosInstance.ts";
import trLocale from "@fullcalendar/core/locales/tr";
import VaccinationPlanForm from "../popup/VaccinationPlanForm.js";
import MainModal from "../../components/MainModal.js";
import { useConfirm } from "../../components/ConfirmContext";
import VaccinePlanEdit from "../popup/VaccinePlanEdit.js";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Plus, Syringe } from "lucide-react";
import "./VaccinationTracker.css";
import { useLanguage } from "../../context/LanguageContext.js";

const VaccinationTracker = () => {
  const calendarRef = useRef(null);
  const formRef = useRef(null);
  const { t, lang } = useLanguage();

  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [currentRange, setCurrentRange] = useState({ start: null, end: null });
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentTitle, setCurrentTitle] = useState("");
  const [miniCalendarDate, setMiniCalendarDate] = useState(dayjs());

  const [materialsList, setMaterialsList] = useState([]);

  const { confirm } = useConfirm();

  const stats = useMemo(() => {
    const applied = events.filter(e => e.status === 'applied').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const overdue = events.filter(e => e.status === 'overdue').length;
    return { applied, pending, overdue };
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

  useEffect(() => {
    axiosInstance.get("/vaccine/materials").then((res) => {
      if (res.data.status === "success") {
        setMaterialsList(res.data.data);
      }
    });
  }, []);

  const fetchEvents = async (startStr, endStr) => {
    try {
      const response = await axiosInstance.get("/vaccine/calendarEvents", {
        params: { startDate: startStr, endDate: endStr },
      });

      const formatted = response.data.map((event) => {
        const isApplied = event.is_applied === 1;
        const isOverdue = event.is_applied === 2;
        const backgroundColor = isApplied ? "#4caf50" : isOverdue ? "#f44336" : "#26a69a";
        const status = isApplied ? 'applied' : (isOverdue ? 'overdue' : 'pending');

        // prefer planned_date/applied_on, fall back to generic date
        const start = event.planned_date || event.applied_on || event.date;

        return {
          id: `${event.id}`,
          title: `💉 ${event.vaccine_name}-${event.animal_name}`,
          start,
          allDay: true,
          backgroundColor,
          borderColor: backgroundColor,
          textColor: "#fff",
          status,
        };
      });

      setEvents(formatted);
    } catch (error) {
      console.error("Aşı takvimi verileri alınamadı:", error);
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentRange({ start: dateInfo.start, end: dateInfo.end });
    setCurrentView(dateInfo.view.type);
    setCurrentTitle(dateInfo.view.title);
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

  const handleEventClick = async ({ event }) => {
    const realId = event.id;
    const planData = await fetchVaccinationPlan(realId);
    if (planData) {
      setSelectedPlan(planData);
      setShowEditModal(true);
    } else {
      confirm(t('VaccinePlanLoadError'), t('Ok'), "", t('Error'));
    }
  };

  const handleDateClick = (info) => {
    const clickedDate = new Date(info.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      confirm(t('CannotPlanPastDay'), t('Ok'), "", t('Warning'));
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

  const handleSave = async () => {
    setShowVaccineModal(false);
    if (!currentRange.start || !currentRange.end) return;

    const startDate = new Date(currentRange.start);
    const endDate = new Date(currentRange.end);

    startDate.setMonth(startDate.getMonth() - 1);
    endDate.setMonth(endDate.getMonth() + 1);

    fetchEvents(startDate.toISOString(), endDate.toISOString());
  };

  const handleUpdateSuccess = () => {
    if (!currentRange.start || !currentRange.end) return;
    fetchEvents(currentRange.start.toISOString(), currentRange.end.toISOString());
  };

  const handleEventDrop = async (info) => {
    const { event, revert } = info;
    const newDate = dayjs(event.start).format("YYYY-MM-DD");
    
    try {
      const response = await axiosInstance.put(`/vaccine/plan/${event.id}`, {
        planned_date: newDate,
      });
      
      if (response.data.message) {
        confirm(t('VaccinePlanDateUpdated'), t('Ok'), "", t('Info'));
        handleUpdateSuccess();
      } else {
        revert();
        confirm(t('DateUpdateFailed'), t('Ok'), "", t('Error'));
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Aşı planı tarihi güncellenirken hata:", error);
      revert();
      const errorMsg = error.response?.data?.error || t('DateUpdateError');
      confirm(errorMsg, t('Ok'), "", t('Error'));
    }
  };

  const handlePrev = () => calendarRef.current?.getApi()?.prev();
  const handleNext = () => calendarRef.current?.getApi()?.next();
  const handleToday = () => calendarRef.current?.getApi()?.today();
  const handleViewChange = (view) => calendarRef.current?.getApi()?.changeView(view);

  const openNewVaccineModal = () => {
    setStartDate(new Date());
    setShowVaccineModal(true);
  };

  return (
    <div className="vaccination-page">
      <aside className="vaccination-sidebar">
        <div className="vaccination-sidebar-header">
          <div className="vaccination-sidebar-logo">
            <div className="vaccination-logo-icon">
              <Syringe size={22} color="white" />
            </div>
            <div>
              <div className="vaccination-logo-text">VetCare</div>
              <div className="vaccination-logo-subtitle">{t('VaccinationTracking')}</div>
            </div>
          </div>
          
          <button className="new-vaccine-btn" onClick={openNewVaccineModal}>
            <Plus size={18} />
            {t('NewVaccinePlan')}
          </button>
        </div>

        <div className="vaccination-sidebar-stats">
          <div className="vaccination-stats-title">{t('VaccineStatuses')}</div>
          
          <div className="vaccination-stat-item">
            <div className="vaccination-stat-left">
              <div className="vaccination-stat-indicator applied" />
              <span className="vaccination-stat-name">{t('Applied')}</span>
            </div>
            <span className="vaccination-stat-count">{stats.applied}</span>
          </div>
          
          <div className="vaccination-stat-item">
            <div className="vaccination-stat-left">
              <div className="vaccination-stat-indicator pending" />
              <span className="vaccination-stat-name">{t('Planned')}</span>
            </div>
            <span className="vaccination-stat-count">{stats.pending}</span>
          </div>

          <div className="vaccination-stat-item">
            <div className="vaccination-stat-left">
              <div className="vaccination-stat-indicator overdue" />
              <span className="vaccination-stat-name">{t('Overdue')}</span>
            </div>
            <span className="vaccination-stat-count">{stats.overdue}</span>
          </div>
        </div>

        <div className="vaccination-sidebar-mini-calendar">
          <div className="vaccination-mini-calendar-header">
            <span className="vaccination-mini-calendar-title">
              {miniCalendarDate.format('MMMM YYYY')}
            </span>
            <div className="vaccination-mini-calendar-nav">
              <button 
                className="vaccination-mini-nav-btn" 
                onClick={() => setMiniCalendarDate(d => d.subtract(1, 'month'))}
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                className="vaccination-mini-nav-btn"
                onClick={() => setMiniCalendarDate(d => d.add(1, 'month'))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          <div className="vaccination-mini-calendar-grid">
            {(lang === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa']).map(d => (
              <div key={d} className="vaccination-mini-day-header">{d}</div>
            ))}
            {miniCalendarDays.map((d, i) => (
              <div 
                key={i} 
                className={`vaccination-mini-day ${d.isOtherMonth ? 'other-month' : ''} ${d.isToday ? 'today' : ''} ${d.hasEvent ? 'has-event' : ''}`}
                style={{ opacity: d.isOtherMonth ? 0.3 : 1 }}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="vaccination-main">
        <header className="vaccination-main-header">
          <div className="vaccination-header-left">
            <div className="vaccination-nav-buttons">
              <button className="vaccination-nav-btn" onClick={handlePrev}>
                <ChevronLeft size={20} />
              </button>
              <button className="vaccination-nav-btn" onClick={handleNext}>
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="vaccination-today-btn" onClick={handleToday}>
              {t('Today')}
            </button>
            <h1 className="vaccination-current-date">{currentTitle}</h1>
          </div>

          <div className="vaccination-header-right">
            <div className="vaccination-view-switcher">
              <button
                className={`vaccination-view-btn ${currentView === "dayGridMonth" ? "active" : ""}`}
                onClick={() => handleViewChange("dayGridMonth")}
              >
                {t('Month')}
              </button>
              <button
                className={`vaccination-view-btn ${currentView === "timeGridWeek" ? "active" : ""}`}
                onClick={() => handleViewChange("timeGridWeek")}
              >
                {t('Week')}
              </button>
              <button
                className={`vaccination-view-btn ${currentView === "timeGridDay" ? "active" : ""}`}
                onClick={() => handleViewChange("timeGridDay")}
              >
                {t('Day')}
              </button>
            </div>
          </div>
        </header>

        <div className="vaccination-calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            ref={calendarRef}
            locale={lang === 'en' ? undefined : trLocale}
            selectable={true}
            editable={true}
            eventDrop={handleEventDrop}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            eventDisplay="block"
            firstDay={1}
            height="auto"
            dayMaxEvents={3}
            headerToolbar={false}
          />
        </div>
      </main>

      <MainModal
        isOpen={showVaccineModal}
        toggle={handleModalClose}
        title={t('VaccinePlanning')}
        content={
          <VaccinationPlanForm
            ref={formRef}
            materialsList={materialsList}
            initialDate={startDate}
          />
        }
        onSave={handleSave}
        saveButtonLabel={t('Save')}
      />

      <MainModal
        isOpen={showEditModal}
        toggle={handleEditModalClose}
        title={t('EditVaccinePlan')}
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
  );
};

export default VaccinationTracker;
