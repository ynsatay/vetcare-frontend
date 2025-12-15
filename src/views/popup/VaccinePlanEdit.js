import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import enUS from 'date-fns/locale/en-US';
import dayjs from 'dayjs';
import axiosInstance from "../../api/axiosInstance.ts";
import { useConfirm } from '../../components/ConfirmContext';
import { useLanguage } from '../../context/LanguageContext.js';

const VaccinePlanEdit = ({ plan, onClose, onUpdateSuccess }) => {
  const { confirm } = useConfirm();
  const { t, lang } = useLanguage();

  const today = dayjs().startOf('day');

  const [planDate, setPlanDate] = useState(null);
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (plan) {
      setApplied(plan.is_applied == 1);  
      setPlanDate(plan.planned_date ? new Date(plan.planned_date) : null);  // planned_date doğru isim olmalı
      setNote(plan.notes || ""); // notes doğru isim olmalı
    }
  }, [plan]);

  const handleUpdate = async () => {
    if (!planDate) {
      confirm(t('PleaseSelectPlannedDate'), t('Ok'), "", t('Warning'));
      return;
    }
    if (dayjs(planDate).isBefore(today)) {
      confirm(t('CannotPlanPastDay'), t('Ok'), "", t('Warning'));
      return;
    }

    try {
      const response = await axiosInstance.put(`/vaccine/plan/${plan.id}`, {
        planned_date: dayjs(planDate).format("YYYY-MM-DD"), // sadece tarih formatı
        notes: note
      });

      if (response.data.message) {
        confirm(t('VaccinePlanDateUpdated'), t('Ok'), "", t('Info'));
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm(t('UpdateFailed'), t('Ok'), "", t('Error'));
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Güncelleme hatası:", error);
      confirm(error.response?.data?.error || t('ErrorTryAgain'), t('Ok'), "", t('Error'));
    }
  };

  const handleDelete = async () => {
    try {
      const result = await confirm(t('DeleteConfirmQuestion'), t('Yes'), t('No'), t('Warning'));
      if (!result) return;

      const response = await axiosInstance.delete(`/vaccine/plan/${plan.id}`);

      if (response.data.message) {
        confirm(t('VaccinePlanDeleted'), t('Ok'), "", t('Info'));
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm(t('DeleteFailed'), t('Ok'), "", t('Error'));
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Silme hatası:", error);
      const errorMessage = error.response?.data?.error || t('ErrorTryAgain');
      confirm(errorMessage, t('Ok'), "", t('Error'));
    }
  };

  if (!plan) return <Typography>{t('PlanDataNotFound')}</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={lang === 'en' ? enUS : trLocale}>
      <Grid container spacing={2}>
        <Grid item xs={5}><Typography variant="subtitle1">{t('OwnerName')}:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.owner_name}</Typography></Grid>

        <Grid item xs={5}><Typography variant="subtitle1">{t('AnimalNameLabel')}:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.animal_name}</Typography></Grid>

        <Grid item xs={5}><Typography variant="subtitle1">{t('VaccineNameLabel')}:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.vaccine_name}</Typography></Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={applied} disabled />}
            label={t('Applied')}
          />
        </Grid>

        <Grid item xs={5}><Typography variant="subtitle1">{t('PlanDateLabel')}:</Typography></Grid>
        <Grid item xs={7}>
          <DatePicker
            value={planDate}
            onChange={(newValue) => setPlanDate(newValue)}
            disablePast
            minDate={today.toDate()}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
          />
        </Grid>

        <Grid item xs={5}><Typography variant="subtitle1">{t('NoteLabel')}:</Typography></Grid>
        <Grid item xs={7}>
          <TextField
            fullWidth
            multiline
            size="small"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="contained" color="error" disabled={applied} onClick={handleDelete}>{t('Delete')}</Button>
          <Button variant="contained" onClick={handleUpdate}>{t('Update')}</Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default VaccinePlanEdit;
