import React, { forwardRef, useImperativeHandle, useState, useEffect, useContext } from "react";
import AppPatientSearch from "./AppPatientSearch";
import {
  Grid,
  Button,
  TextField,
  Autocomplete
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useConfirm } from "../../components/ConfirmContext";
import axiosInstance from "../../api/axiosInstance.ts";
import dayjs from "dayjs";
import { AuthContext } from "../../context/usercontext.tsx";
import { useLanguage } from "../../context/LanguageContext.js";

const VaccinationPlanForm = forwardRef(({ materialsList = [], initialDate }, ref) => {
  const { t } = useLanguage();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [plannedDate, setPlannedDate] = useState(dayjs(initialDate));
  const [notes, setNotes] = useState("");
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatIntervalMonths, setRepeatIntervalMonths] = useState(6);
  const { userid } = useContext(AuthContext);

  const { confirm } = useConfirm();

  const today = dayjs().startOf('day');

  useEffect(() => {
    if (initialDate) {
      setPlannedDate(dayjs(initialDate));
    }
  }, [initialDate]);

  useImperativeHandle(ref, () => ({
    handleSave,
    setAnimal: (animal) => setSelectedAnimal(animal),
    setVaccine: (vaccine) => setSelectedVaccine(vaccine),
  }));

  const handleAnimalSelect = (animal) => {
    setSelectedAnimal(animal);
    setShowPatientSearch(false);
  };

  const handleSave = async () => {
    if (!selectedAnimal) {
      confirm(t('PleaseSelectAnimal'), t('Ok'), "", t('Warning'));
      return false;
    }
    if (!selectedVaccine) {
      confirm(t('PleaseSelectVaccine'), t('Ok'), "", t('Warning'));
      return false;
    }
    if (!plannedDate) {
      confirm(t('PleaseSelectPlannedDate'), t('Ok'), "", t('Warning'));
      return false;
    }
    if (dayjs(plannedDate).isBefore(today)) {
      confirm(t('CannotPlanPastDay'), t('Ok'), "", t('Warning'));
      return false;
    }
    if (repeatCount < 1) {
      confirm(t('RepeatCountMin'), t('Ok'), "", t('Warning'));
      return false;
    }
    if (repeatIntervalMonths < 1) {
      confirm(t('IntervalMonthsMin'), t('Ok'), "", t('Warning'));
      return false;
    }

    const payload = {
      animal_id: selectedAnimal.id,
      m_id: selectedVaccine.id,
      planned_date: dayjs(plannedDate).format("YYYY-MM-DD"),
      notes: notes || null,
      repeat_count: repeatCount,
      repeat_interval_months: repeatIntervalMonths,
      created_by: userid, // Örnek kullanıcı ID
    };

    try {
      const response = await axiosInstance.post("/vaccine/plan-multiple", payload);

      if (response.data.inserted_ids?.length > 0) {
        //confirm("Kayıt başarılı.", "Tamam", "", "Bilgi");
        return { success: true }; // Burada 'success' olarak döndür
      } else {
        confirm(`${t('RecordFailed')} ${response.data.message || t('UnknownError')}`, t('Ok'), "", t('Error'));
        return { success: false };
      }
    } catch (error) {
      if (error.__demo_blocked) return;
      console.error("Kayıt hatası:", error);
      confirm(t('ServerErrorRegistration'), t('Ok'), "", t('Error'));
      return { success: false };
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ p: 2, maxWidth: 600, width: "100%" }}>
        {/* Hayvan Seçimi */}
        <Grid item xs={12} sm={8}>
          <TextField
            variant="outlined"
            size="small"
            value={selectedAnimal ? selectedAnimal.name : ""}
            placeholder={t('AnimalSelectPlaceholder')}
            onClick={() => setShowPatientSearch(true)}
            fullWidth
            InputProps={{ readOnly: true, sx: { cursor: "pointer" } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowPatientSearch(true)}
            sx={{ height: "40px" }}
          >
            {t('Search')}
          </Button>
        </Grid>

        {/* Aşı Seçimi */}
        <Grid item xs={12}>
          <Autocomplete
            options={materialsList}
            getOptionLabel={(option) => option.name}
            value={selectedVaccine}
            onChange={(e, newVal) => setSelectedVaccine(newVal)}
            renderInput={(params) => <TextField {...params} label={t('VaccinationSelection')} size="small" />}
            fullWidth
          />
        </Grid>

        {/* Planlanan Tarih */}
        <Grid item xs={12}>
          <DatePicker
            label={t('PlannedDate')}
            value={plannedDate}
            onChange={setPlannedDate}
            format="DD.MM.YYYY"
            disablePast
            minDate={today}
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" />
            )}
          />
        </Grid>

        {/* Tekrar Sayısı */}
        <Grid item xs={6}>
          <TextField
            label={t('RepeatCount')}
            type="number"
            inputProps={{ min: 1 }}
            value={repeatCount}
            onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Aralık Ay */}
        <Grid item xs={6}>
          <TextField
            label={t('IntervalMonths')}
            type="number"
            inputProps={{ min: 1 }}
            value={repeatIntervalMonths}
            onChange={(e) => setRepeatIntervalMonths(Math.max(1, Number(e.target.value)))}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Notlar */}
        <Grid item xs={12}>
          <TextField
            multiline
            rows={3}
            label={t('NotesOptional')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Hasta Arama Modal */}
        {showPatientSearch && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div style={{ backgroundColor: "white", borderRadius: 16, width: 400 }}>
              <AppPatientSearch
                onSelect={handleAnimalSelect}
                onClose={() => setShowPatientSearch(false)}
              />
            </div>
          </div>
        )}
      </Grid>
    </>
  );
});

export default VaccinationPlanForm;
