import React, { useEffect, useState } from 'react';
import {
  Card, CardBody, CardTitle, CardSubtitle, Button
} from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const packageTypeLabels = {
  1: 'Başlangıç',
  2: 'Standart',
  3: 'Profesyonel',
};

const ClinicList = () => {
  const [clinicList, setClinicList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    fetchClinicList();
  }, []);

  const fetchClinicList = async () => {
    try {
      const response = await axiosInstance.get('/cliniclist');
      if (response.data.status === 'success') {
        setClinicList(response.data.response);
      } else {
        console.error('Klinik listesi alınamadı:', response.data.message);
      }
    } catch (error) {
      console.error('API hatası:', error);
    }
  };

  const handleEditClick = (clinic) => {
    setSelectedClinic({ ...clinic });
    setEditModalOpen(true);
  };

  const handleChange = (e) => {
    setSelectedClinic((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`/cliniclistUpdate/${selectedClinic.id}`, {
        name: selectedClinic.name,
        email: selectedClinic.email,
        phone: selectedClinic.phone,
      });
      setEditModalOpen(false);
      fetchClinicList();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Klinik Adı', flex: 1 },
    { field: 'email', headerName: 'E-Mail', flex: 1 },
    { field: 'phone', headerName: 'Telefon', flex: 1 },
    { field: 'admin_name', headerName: 'Yönetici', flex: 1 },
    {
      field: 'package_type',
      headerName: 'Paket',
      flex: 1,
      valueGetter: (params) => packageTypeLabels[params.row.package_type] || '-',
    },
    {
      field: 'actions',
      headerName: 'İşlem',
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={() => handleEditClick(params.row)}
        >
          Değiştir
        </Button>
      ),
      sortable: false,
      filterable: false,
      width: 120,
    },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Card>
        <CardBody>
          <CardTitle tag="h5">🏨 Klinik Listesi</CardTitle>
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={clinicList}
              columns={columns}
              height={500}
              autoHeight={false}
              disableSelectionOnClick
            />
          </div>
        </CardBody>
      </Card>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Klinik Bilgilerini Güncelle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Klinik Adı"
            name="name"
            fullWidth
            value={selectedClinic?.name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={selectedClinic?.email || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Telefon"
            name="phone"
            fullWidth
            value={selectedClinic?.phone || ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="secondary">
            İptal
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClinicList;
