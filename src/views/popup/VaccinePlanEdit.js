import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import dayjs from 'dayjs';
import axiosInstance from "../../api/axiosInstance.ts";
import { useConfirm } from '../../components/ConfirmContext';

const VaccinePlanEdit = ({ plan, onClose, onUpdateSuccess }) => {
  const { confirm } = useConfirm();

  const [applied, setApplied] = useState(false);
  const [planDate, setPlanDate] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (plan) {
      setApplied(!!plan.applied);
      setPlanDate(plan.plan_date ? new Date(plan.plan_date) : null);
      setNote(plan.note || "");
    }
  }, [plan]);

  const handleUpdate = async () => {
    if (!planDate) {
      confirm("Plan tarihi boş olamaz.", "Tamam", "", "Uyarı");
      return;
    }

    try {
      const response = await axiosInstance.post("/update-vaccine-plan", {
        id: plan.id,
        applied,
        plan_date: dayjs(planDate).format("YYYY-MM-DD HH:mm:ss"),
        note
      });

      if (response.data.status === "success") {
        confirm("Aşı planı güncellendi.", "Tamam", "", "Bilgi");
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm("Güncelleme başarısız: " + response.data.message, "Tamam", "", "Hata");
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      confirm("Bir hata oluştu. Lütfen tekrar deneyin.", "Tamam", "", "Hata");
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
            control={<Checkbox checked={applied} onChange={(e) => setApplied(e.target.checked)} />}
            label="Uygulandı"
          />
        </Grid>

        <Grid item xs={5}><Typography variant="subtitle1">Plan Tarihi:</Typography></Grid>
        <Grid item xs={7}>
          <DateTimePicker
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
          <Button variant="contained" onClick={handleUpdate}>Güncelle</Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default VaccinePlanEdit;
