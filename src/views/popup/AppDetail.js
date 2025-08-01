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
import tr from "dayjs/locale/tr";

import axiosInstance from "../../api/axiosInstance.ts";
import ConfirmDialog from "../../components/ConfirmDialog.js";
import { useConfirm } from '../../components/ConfirmContext';

dayjs.extend(utc);
dayjs.locale(tr);

const statusOptions = [
  { value: 0, label: "Beklemede" },
  { value: 1, label: "Geldi" },
  { value: 2, label: "Tamamlandı" },
  { value: 3, label: "İptal Edildi" },
];

const AppointmentDetails = ({ event, onUpdateSuccess, onClose }) => {
  const [start, setStart] = useState(null); 
  const [end, setEnd] = useState(null);     
  const [status, setStatus] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    if (event) {
      setStart(event.start ? dayjs.utc(event.start) : null);
      setEnd(event.end ? dayjs.utc(event.end) : null);
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
      // Backend UTC string formatını kabul ediyor
      const formattedStart = start.utc().format("YYYY-MM-DD HH:mm:ss");
      const formattedEnd = end.utc().format("YYYY-MM-DD HH:mm:ss");

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
      console.error("Silme hatası:", error);
      confirm("Silme işleminde hata oluştu.", "Tamam", "", "Uyarı");
    }
  };

  if (!event) return <Typography>Etkinlik seçilmedi.</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={tr}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography variant="subtitle1">Hasta - Hayvan Adı:</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body1">{event.title || "Yok"}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">Başlangıç Tarihi:</Typography>
        </Grid>
        <Grid item xs={7}>
          <DateTimePicker
            value={start}
            onChange={(newVal) => setStart(newVal ? dayjs.utc(newVal) : null)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            maxDateTime={end || undefined}
            ampm={false}
          />
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">Bitiş Tarihi:</Typography>
        </Grid>
        <Grid item xs={7}>
          <DateTimePicker
            value={end}
            onChange={(newVal) => setEnd(newVal ? dayjs.utc(newVal) : null)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            minDateTime={start || undefined}
            ampm={false}
          />
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">Durum:</Typography>
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
              <MenuItem key={option.value} value={option.value}>
                {option.label}
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
