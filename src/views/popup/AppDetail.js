import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import axiosInstance from "../../api/axiosInstance.ts";
import dayjs from "dayjs";
import ConfirmDialog from "../../components/ConfirmDialog.js";
import { useConfirm } from '../../components/ConfirmContext';

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
      setStart(event.start ? new Date(event.start) : null);
      setEnd(event.end ? new Date(event.end) : null);
      setStatus(event.extendedProps?.status ?? 0);
    }
  }, [event]);

  const handleUpdate = async () => {
    if (!start || !end) {
      confirm("Başlangıç ve Bitiş tarihlerini doldurun.", "Tamam", "", "Uyarı");
      return;
    }
    if (start > end) {
      confirm("Başlangıç tarihi, bitiş tarihinden büyük olamaz.", "Tamam", "", "Uyarı");
      return;
    }
    try {
      const formattedStart = dayjs(start).format("YYYY-MM-DD HH:mm:ss");
      const formattedEnd = dayjs(end).format("YYYY-MM-DD HH:mm:ss");

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
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
            onChange={(newValue) => setStart(newValue)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            maxDateTime={end || undefined}
          />
        </Grid>

        <Grid item xs={5}>
          <Typography variant="subtitle1">Bitiş Tarihi:</Typography>
        </Grid>
        <Grid item xs={7}>
          <DateTimePicker
            value={end}
            onChange={(newValue) => setEnd(newValue)}
            renderInput={(params) => <TextField fullWidth size="small" {...params} />}
            minDateTime={start || undefined}
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
