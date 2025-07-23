import React, { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../api/axiosInstance.ts";

const AddPatService = ({ onClose, onSelect }) => {
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
    { field: "name", headerName: "Hizmet Adı", flex: 1 },
    {
      field: "price",
      headerName: "Fiyat",
      width: 130,
      valueFormatter: (params) => `${params.value} ₺`,
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <TextField
        label="Ara..."
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
        noRowsOverlay={() => <div style={{ padding: 16 }}>Hizmet bulunamadı.</div>}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
        <Button
          variant="contained"
          disabled={!selectedService}
          onClick={() => {
            onSelect(selectedService);
            onClose();
          }}
        >
          Ekle
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Vazgeç
        </Button>
      </Box>
    </Box>
  );
};

export default AddPatService;
