import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import AppPatientSearch from "./AppPatientSearch";
import {
  Grid,
  Button,
  TextField,
  Autocomplete
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useConfirm } from "../../components/ConfirmContext";
import axiosInstance from "../../api/axiosInstance.ts";
import dayjs from "dayjs";

const VaccinationPlanForm = forwardRef(({ materialsList = [], initialDate }, ref) => {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [plannedDate, setPlannedDate] = useState(dayjs(initialDate));
  const [notes, setNotes] = useState("");
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatIntervalMonths, setRepeatIntervalMonths] = useState(6);

  const { confirm } = useConfirm();

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
      confirm("Lütfen bir hayvan seçin.", "Tamam", "", "Uyarı");
      return false;
    }
    if (!selectedVaccine) {
      confirm("Lütfen bir aşı seçin.", "Tamam", "", "Uyarı");
      return false;
    }
    if (!plannedDate) {
      confirm("Lütfen planlanan tarihi seçin.", "Tamam", "", "Uyarı");
      return false;
    }
    if (repeatCount < 1) {
      confirm("Tekrar sayısı 1 veya daha büyük olmalıdır.", "Tamam", "", "Uyarı");
      return false;
    }
    if (repeatIntervalMonths < 1) {
      confirm("Aralık (ay) 1 veya daha büyük olmalıdır.", "Tamam", "", "Uyarı");
      return false;
    }

    const payload = {
      animal_id: selectedAnimal.id,
      m_id: selectedVaccine.id,
      planned_date: dayjs(plannedDate).format("YYYY-MM-DD"),
      notes: notes || null,
      repeat_count: repeatCount,
      repeat_interval_months: repeatIntervalMonths,
      created_by: 1, // Örnek kullanıcı ID
    };

    try {
      const response = await axiosInstance.post("/vaccine/plan-multiple", payload);

      if (response.data.inserted_ids?.length > 0) {
        //confirm("Kayıt başarılı.", "Tamam", "", "Bilgi");
        return { success: true }; // Burada 'success' olarak döndür
      } else {
        confirm("Kayıt başarısız: " + (response.data.message || "Bilinmeyen hata"), "Tamam", "", "Hata");
        return { success: false };
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      confirm("Sunucu hatası: Kayıt işlemi gerçekleştirilemedi.", "Tamam", "", "Hata");
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
            placeholder="Hayvan seçiniz"
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
            Ara
          </Button>
        </Grid>

        {/* Aşı Seçimi */}
        <Grid item xs={12}>
          <Autocomplete
            options={materialsList}
            getOptionLabel={(option) => option.name}
            value={selectedVaccine}
            onChange={(e, newVal) => setSelectedVaccine(newVal)}
            renderInput={(params) => <TextField {...params} label="Aşı Seçimi" size="small" />}
            fullWidth
          />
        </Grid>

        {/* Planlanan Tarih */}
        <Grid item xs={12}>
          <DateTimePicker
            label="Planlanan Tarih"
            value={plannedDate}
            onChange={setPlannedDate}
            disablePast
            ampm={false}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
          />
        </Grid>

        {/* Tekrar Sayısı */}
        <Grid item xs={6}>
          <TextField
            label="Tekrar Sayısı"
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
            label="Aralık (Ay)"
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
            label="Notlar (Opsiyonel)"
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
            <div style={{ backgroundColor: "white", borderRadius: 8, width: 400 }}>
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
