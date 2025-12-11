import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import AppPatientSearch from './AppPatientSearch';
import { Grid, Button, TextField, Select, MenuItem, Typography, Checkbox } from '@mui/material';
import '../../views/scss/_login.scss';
import '../scss/_appointment.scss';

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import trLocale from 'dayjs/locale/tr';
import { useConfirm } from '../../components/ConfirmContext';

dayjs.extend(utc);
dayjs.locale(trLocale);

const AppointmentForm = forwardRef(({ startDateProp, endDateProp, currentView }, ref) => {
  // startDate ve endDate artık dayjs local objeleri
  const [startDate, setStartDate] = useState(startDateProp ? dayjs(startDateProp) : null);
  const [endDate, setEndDate] = useState(endDateProp ? dayjs(endDateProp) : null);
  const [patientName, setPatientName] = useState('');
  const [userAnimalId, setUserAnimalId] = useState(null);
  const [notes, setNotes] = useState('');
  const [appType, setAppType] = useState(0);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [appDay, setAppDay] = useState(true);
  const { confirm } = useConfirm();

  const isCheckboxDisabled = currentView !== "dayGridMonth";

  useEffect(() => {
    if (startDateProp) setStartDate(dayjs(startDateProp));
    if (endDateProp) setEndDate(dayjs(endDateProp));
  }, [startDateProp, endDateProp]);

  // Local zaman formatını backend uyumlu stringe dönüştürür
  const toLocalString = (date) => {
    if (!date) return null;
    return date.format('YYYY-MM-DD HH:mm:ss');
  };

  useImperativeHandle(ref, () => ({
    handleSave: () => {
      if (!userAnimalId || !startDate || !endDate) {
        confirm("Lütfen tüm zorunlu alanları doldurun.", "Tamam", "", "Uyarı");
        return null;
      }
      return {
        user_animal_id: userAnimalId,
        process_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        start_time: toLocalString(startDate),
        end_time: toLocalString(endDate),
        notes: notes || null,
        status: 0,
        app_type: appType,
        appDay: appDay,
      };
    },
    setPatient: (patient) => {
      setPatientName(patient.name);
      setUserAnimalId(patient.id);
    }
  }));

  // Tarih seçerken local modunda al
  const handleStartDateChange = (newValue) => {
    setStartDate(newValue ? dayjs(newValue) : null);
  };

  const handleEndDateChange = (newValue) => {
    if (newValue && startDate && newValue.isBefore(startDate)) {
      confirm("Bitiş tarihi, başlangıç tarihinden önce olamaz.", "Tamam", "", "Uyarı");
      setEndDate(startDate.add(30, 'minute'));
    } else {
      setEndDate(newValue ? dayjs(newValue) : null);
    }
  };

  const handleAppDayChange = (e) => {
    setAppDay(e.target.checked);
  };

  const handlePatientSelect = (patient) => {
    setPatientName(patient.name);
    setUserAnimalId(patient.id);
    setShowPatientSearch(false);
  };

  return (
    <Grid container spacing={1}>
      {/* Hasta */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Hasta Adı :</Typography>
        </Grid>
        <Grid item xs={8} sx={{ marginBottom: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={7}>
              <TextField
                fullWidth
                value={patientName}
                InputProps={{ readOnly: true }}
                placeholder="Hasta seçiniz"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={5}>
              <Button
                fullWidth
                variant="contained"
                className='login'
                onClick={() => setShowPatientSearch(true)}
              >
                Hasta Ara
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Başlangıç */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Başlangıç Tarihi :</Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={trLocale}>
            <DateTimePicker
              value={startDate}
              onChange={handleStartDateChange}
              minDate={dayjs()}
              renderInput={(params) => <TextField fullWidth size="small" {...params} />}
              ampm={false}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      {/* Bitiş */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Bitiş Tarihi :</Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={trLocale}>
            <DateTimePicker
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || dayjs()}
              renderInput={(params) => <TextField fullWidth size="small" {...params} />}
              ampm={false}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      {/* Günlere Böl */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Günlere Böl :</Typography>
        </Grid>
        <Grid item xs={8}>
          <Checkbox
            size='medium'
            checked={appDay}
            defaultChecked
            disabled={isCheckboxDisabled}
            onChange={handleAppDayChange}
            className='custom-checkbox'
          />
        </Grid>
      </Grid>

      {/* Randevu Tipi */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Randevu Tipi :</Typography>
        </Grid>
        <Grid item xs={8}>
          <Select
            fullWidth
            value={appType}
            onChange={(e) => setAppType(parseInt(e.target.value))}
            size="small"
            variant="outlined"
          >
            <MenuItem value={0}>Normal</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {/* Notlar */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Grid item xs={4}>
          <Typography variant="subtitle1" gutterBottom>Notlar:</Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opsiyonel not ekleyebilirsiniz"
            size="small"
          />
        </Grid>
      </Grid>

      {/* Hasta Arama Modal */}
      {showPatientSearch && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: 8, width: 400 }}>
            <AppPatientSearch
              onSelect={handlePatientSelect}
              onClose={() => setShowPatientSearch(false)}
            />
          </div>
        </div>
      )}
    </Grid>
  );
});

export default AppointmentForm;
