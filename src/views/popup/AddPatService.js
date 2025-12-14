import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../api/axiosInstance.ts";
import { trTR } from '@mui/x-data-grid/locales';
import "./AddPatService.css";
import { useLanguage } from '../../context/LanguageContext.js';

const AddPatService = ({ onClose, onSelect }) => {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axiosInstance.get("/getServices");
        setServices(res.data.data || []);
      } catch (err) {
        console.error("Hizmetler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filtrelenmiş liste
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "name", headerName: t('ServiceName'), flex: 1 },
    {
      field: "price",
      headerName: t('Price'),
      width: 130,
      valueFormatter: (params) => `${params.value} ₺`,
    },
  ];

  return (
    <div className="select-modal">
      <div className="select-card">
        <div className="select-header">
          <h3>{t('SelectService')}</h3>
        </div>

        <TextField
          className="select-search"
          label={t('Search')}
          variant="outlined"
          size="small"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedService(null);
          }}
        />

        <div className="select-data-grid">
          <DataGrid
            rows={filteredServices}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            loading={loading}
            onRowClick={(params) => setSelectedService(params.row)}
            selectionModel={selectedService ? [selectedService.id] : []}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "#d0f0fd !important",
              },
            }}
            autoHeight
            disableSelectionOnClick={false}
            getRowId={(row) => row.id}
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                lang === 'en'
                  ? `${count.toLocaleString()} row selected`
                  : `${count.toLocaleString()} satır seçildi`,
            }}
          />
        </div>

        <div className="select-footer">
          <Button
            variant="contained"
            disabled={!selectedService}
            onClick={() => {
              onSelect(selectedService);
              onClose();
            }}
          >
            {t('Add')}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            {t('Cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPatService;
