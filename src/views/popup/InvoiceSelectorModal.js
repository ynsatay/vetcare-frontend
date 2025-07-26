import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axiosInstance from '../../api/axiosInstance.ts';
import dayjs from 'dayjs';
import { trTR } from '@mui/x-data-grid/locales';

const invoiceTypes = {
  1: 'Alım',
  2: 'İade',
  3: 'İade',
};

const InvoiceSelectorModal = ({ open, onClose, onSelect }) => {
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Anlık arama inputu (fatura numarası ile hızlı filtreleme)
  const [searchTerm, setSearchTerm] = useState('');

  // Listele butonundaki filtre alanları
  const [invoiceNo, setInvoiceNo] = useState('');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());

  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  // İlk açılışta veya filtrele butonuna basınca tüm veya filtrelenmiş listeyi getirir
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      if (invoiceNo.trim() !== '') {
        const res = await axiosInstance.get('/material-invoice/list', {
          params: { inv_no: invoiceNo.trim() }
        });
        setFilteredInvoices(res.data);
      } else {
        const params = {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        };
        const res = await axiosInstance.get('/material-invoice/list', { params });

        console.log('API cevabı:', res.data); // buraya bak
        setFilteredInvoices(res.data);
      }
    } catch (err) {
      console.error('Fatura listesi alınamadı:', err);
      setFilteredInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      // Modal kapandığında tüm filtre ve seçimleri sıfırla
      setInvoiceNo('');
      setStartDate(dayjs().startOf('month'));
      setEndDate(dayjs());
      setSearchTerm('');
      setSelectedRow(null);
      setFilteredInvoices([]);
    }
  }, [open]);


  const columns = [
    { field: 'id', headerName: '#', width: 70, flex: 1 },
    { field: 'inv_no', headerName: 'Fatura No', flex: 1 },
    {
      field: 'inv_date',
      headerName: 'Tarih',
      width: 130,
      valueFormatter: (params) => dayjs(params.value).format('DD.MM.YYYY'),
    },
    {
      field: 'inv_type',
      headerName: 'Tip',
      width: 100,
      flex: 1,
      valueFormatter: (params) => invoiceTypes[params.value] || '-',
    },
    {
      field: 'total_amount',
      headerName: 'Tutar',
      width: 120,
      flex: 1,
      valueFormatter: (params) => {
        const val = Number(params.value);
        return isNaN(val) ? '-' : `${val.toFixed(2)} ₺`;
      }
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Fatura Seçimi</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', marginTop: 2, height: 500 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Listele filtresi: Fatura no + tarih aralığı (alt alta veya yanyana) */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fatura No"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={6} sm={4}>
              <DatePicker
                label="Başlangıç Tarihi"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                format="DD.MM.YYYY"
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <DatePicker
                label="Bitiş Tarihi"
                value={endDate}
                onChange={(val) => setEndDate(val)}
                format="DD.MM.YYYY"
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth variant="contained" onClick={fetchInvoices}>
                Listele
              </Button>
            </Grid>

            {/* Anlık fatura no arama inputu - LISTELE butonunun üstünde */}
            <Grid item xs={12}>
              <TextField
                label="Fatura Numarası ile Ara (Anlık Filtre)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <DataGrid
            rows={filteredInvoices}
            columns={columns}
            hideFooter
            autoHeight
            loading={loading}
            onRowClick={(params) => setSelectedRow(params.row)}
            selectionModel={selectedRow ? [selectedRow.id] : []}
            sx={{
              mt: 2,
              cursor: 'pointer',
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: '#d0f0fd !important',
              },
            }}
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                count > 1
                  ? `${count.toLocaleString()} satır seçildi`
                  : `${count.toLocaleString()} satır seçildi`,
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          disabled={!selectedRow}
          onClick={() => {
            if (selectedRow) {
              onSelect(selectedRow);
              onClose();
            }
          }}
        >
          Seç
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Vazgeç
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceSelectorModal;
