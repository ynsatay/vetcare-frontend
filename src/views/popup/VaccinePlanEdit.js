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
import dayjs from 'dayjs';
import axiosInstance from "../../api/axiosInstance.ts";
import { useConfirm } from '../../components/ConfirmContext';

const VaccinePlanEdit = ({ plan, onClose, onUpdateSuccess }) => {
  const { confirm } = useConfirm();

  const [planDate, setPlanDate] = useState(null);
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (plan) {
      setApplied(!!plan.is_applied);  // Veritabanından gelen alan is_applied olduğunu varsayıyorum
      setPlanDate(plan.planned_date ? new Date(plan.planned_date) : null);  // planned_date doğru isim olmalı
      setNote(plan.notes || ""); // notes doğru isim olmalı
    }
  }, [plan]);

  const handleUpdate = async () => {
    if (!planDate) {
      confirm("Plan tarihi boş olamaz.", "Tamam", "", "Uyarı");
      return;
    }

    try {
      const response = await axiosInstance.put(`/vaccine/plan/${plan.id}`, {
        planned_date: dayjs(planDate).format("YYYY-MM-DD"), // sadece tarih formatı
        notes: note
      });

      if (response.data.message) {
        confirm("Aşı planı güncellendi.", "Tamam", "", "Bilgi");
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm("Güncelleme başarısız.", "Tamam", "", "Hata");
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Güncelleme hatası:", error);
      confirm(error.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin.", "Tamam", "", "Hata");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await confirm("Bu işlemi silmek istediğinize emin misiniz?", "Evet", "Hayır", "Silme Onayı");
      if (!result) return;

      const response = await axiosInstance.delete(`/vaccine/plan/${plan.id}`);

      if (response.data.message) {
        confirm("Aşı planı silindi.", "Tamam", "", "Bilgi");
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm("Silme işlemi başarısız.", "Tamam", "", "Hata");
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Silme hatası:", error);
      const errorMessage = error.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin.";
      confirm(errorMessage, "Tamam", "", "Hata");
    }
  };

  if (!plan) return <Typography>Plan verisi bulunamadı.</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
      <Grid container spacing={2}>
        <Grid item xs={5}><Typography variant="subtitle1">Sahip Adı:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.owner_name}</Typography></Grid>

        <Grid item xs={5}><Typography variant="subtitle1">Hayvan Adı:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.animal_name}</Typography></Grid>

        <Grid item xs={5}><Typography variant="subtitle1">Aşı Adı:</Typography></Grid>
        <Grid item xs={7}><Typography variant="body1">{plan.vaccine_name}</Typography></Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={applied} disabled />}
            label="Uygulandı"
          />
        </Grid>

        <Grid item xs={5}><Typography variant="subtitle1">Plan Tarihi:</Typography></Grid>
        <Grid item xs={7}>
          <DatePicker
            value={planDate}
            onChange={(newValue) => setPlanDate(newValue)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
          />
        </Grid>

        <Grid item xs={5}><Typography variant="subtitle1">Not:</Typography></Grid>
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
          <Button variant="contained" color="error" disabled={applied} onClick={handleDelete}>SİL</Button>
          <Button variant="contained" onClick={handleUpdate}>Güncelle</Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default VaccinePlanEdit;
