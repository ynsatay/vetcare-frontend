import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button
} from "@mui/material";

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import tr from "dayjs/locale/tr";

import axiosInstance from "../../api/axiosInstance.ts";
import ConfirmDialog from "../../components/ConfirmDialog.js";
import { useConfirm } from '../../components/ConfirmContext';
import { useLanguage } from '../../context/LanguageContext.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(tr);

const statusOptions = [0,1,2,3];

const AppointmentDetails = ({ event, onUpdateSuccess, onClose }) => {
  const [start, setStart] = useState(null); 
  const [end, setEnd] = useState(null);     
  const [status, setStatus] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const { confirm } = useConfirm();
  const { t } = useLanguage();

  useEffect(() => {
    if (event) {
      setStart(event.start ? dayjs(event.start).local() : null);
      setEnd(event.end ? dayjs(event.end).local() : null);
      setStatus(event.extendedProps?.status ?? 0);
    }
  }, [event]);

  const handleUpdate = async () => {
    if (!start || !end) {
      confirm("Başlangıç ve Bitiş tarihlerini doldurun.", "Tamam", "", "Uyarı");
      return;
    }
    if (start.isAfter(end)) {
      confirm("Başlangıç tarihi, bitiş tarihinden büyük olamaz.", "Tamam", "", "Uyarı");
      return;
    }

    try {
      const formattedStart = start.format("YYYY-MM-DD HH:mm:ss");
      const formattedEnd = end.format("YYYY-MM-DD HH:mm:ss");

      const response = await axiosInstance.post("/updateappointment", {
        id: event.id,
        start_time: formattedStart,
        end_time: formattedEnd,
        status: status,
      });

      if (response.data.status === "success") {
        confirm("Randevu başarıyla güncellendi.", "Tamam", "", "Uyarı");
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm("Güncelleme başarısız: " + response.data.message, "Tamam", "", "Uyarı");
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Güncelleme hatası:", error);
      confirm("Bir hata oluştu. Lütfen tekrar deneyin.", "Tamam", "", "Uyarı");
    }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      const response = await axiosInstance.delete(`/deleteappointment/${event.id}`);
      if (response.data.status === "success") {
        confirm("Randevu başarıyla silindi.", "Tamam", "", "Uyarı");
        onUpdateSuccess?.();
        onClose?.();
      } else {
        confirm("Silme başarısız: " + response.data.message, "Tamam", "", "Uyarı");
      }
    } catch (error) {
      if (error.__demo_blocked) return; 
      console.error("Silme hatası:", error);
      confirm("Silme işleminde hata oluştu.", "Tamam", "", "Uyarı");
    }
  };

  if (!event) return <Typography>Etkinlik seçilmedi.</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={tr}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography variant="subtitle1">{t('Animals')}:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body1">{event.title || "Yok"}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">Start Date:</Typography>
        </Grid>
        <Grid item xs={7}>
          <DateTimePicker
            value={start}
            onChange={(newVal) => setStart(newVal ? dayjs(newVal).local() : null)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            maxDateTime={end || undefined}
            ampm={false}
          />
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">End Date:</Typography>
        </Grid>
        <Grid item xs={7}>
          <DateTimePicker
            value={end}
            onChange={(newVal) => setEnd(newVal ? dayjs(newVal).local() : null)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            minDateTime={start || undefined}
            ampm={false}
          />
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">{t('AppointmentStatuses')}:</Typography>
        </Grid>
        <Grid item xs={7}>
          <TextField
            select
            fullWidth
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            size="small"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option === 0 ? t('Waiting') : option === 1 ? t('Arrived') : option === 2 ? t('Completed') : t('Cancelled')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" color="error" onClick={() => setShowConfirm(true)}>
            Randevu SİL
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate} disabled={!start || !end}>
            Güncelle
          </Button>
        </Grid>

        <ConfirmDialog
          isOpen={showConfirm}
          toggle={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          message="Randevuyu silmek istediğinize emin misiniz?"
          answerTrue="Evet"
          answerFalse="Hayır"
          toggleMessage={"Randevu Silme Onayı"}
        />
      </Grid>
    </LocalizationProvider>
  );
};

export default AppointmentDetails;
