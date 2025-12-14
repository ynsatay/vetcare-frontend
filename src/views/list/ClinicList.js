import React, { useEffect, useState } from 'react';
import {
  Card, CardBody, CardTitle, Button
} from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { trTR } from '@mui/x-data-grid/locales';
import { useLanguage } from '../../context/LanguageContext.js';

const packageTypeValues = [1,2,3];

const ClinicList = () => {
  const [clinicList, setClinicList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const { t, lang } = useLanguage();

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
    {
      field: 'name',
      headerName: t('ClinicName'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'E-Mail',
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: 'phone',
      headerName: t('Phone'),
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'admin_name',
      headerName: t('Administrator'),
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'package_type',
      headerName: t('Package'),
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => {
        const v = params.row.package_type;
        if (v === 1) return lang === 'en' ? 'Starter' : 'Başlangıç';
        if (v === 2) return lang === 'en' ? 'Standard' : 'Standart';
        if (v === 3) return lang === 'en' ? 'Professional' : 'Profesyonel';
        return '-';
      },
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={() => handleEditClick(params.row)}
        >
          {t('EditAction')}
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Card>
        <CardBody>
          <CardTitle tag="h5">🏨 {t('ClinicListTitle')}</CardTitle>
          <div style={{ height: 500, width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={clinicList}
              columns={columns}
              height={500}
              autoHeight={false}
              disableSelectionOnClick
              localeText={{
                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                footerRowSelected: (count) =>
                  lang === 'en'
                    ? `${count.toLocaleString()} row selected`
                    : `${count.toLocaleString()} satır seçildi`,
              }}

            />
          </div>
        </CardBody>
      </Card>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>{t('UpdateClinicInfo')}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label={t('ClinicName')}
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
            label={t('Phone')}
            name="phone"
            fullWidth
            value={selectedClinic?.phone || ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="secondary">
            {t('Cancel')}
          </Button>
          <Button onClick={handleUpdate} color="primary">
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClinicList;
