import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip, Divider, Typography, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Anlık arama inputu (fatura numarası ile hızlı filtreleme)
  const [searchTerm, setSearchTerm] = useState('');

  // Listele butonundaki filtre alanları
  const [invoiceNo, setInvoiceNo] = useState('');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs());

  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [preset, setPreset] = useState('THIS_MONTH');

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
          endDate: endDate.add(1, 'day').format('YYYY-MM-DD'),
          inv_type: typeFilter || undefined
        };
        const res = await axiosInstance.get('/material-invoice/list', { params });
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
      setInvoiceNo('');
      setStartDate(dayjs().startOf('month'));
      setEndDate(dayjs());
      setSearchTerm('');
      setSelectedRow(null);
      setFilteredInvoices([]);
      setTypeFilter('');
      setPreset('THIS_MONTH');
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{ sx: isMobile ? { width: '100%', m: 0, borderRadius: 0 } : {} }}
    >
      <DialogTitle sx={{ p: isMobile ? 1 : 2 }}>Fatura Seçimi</DialogTitle>
      <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
        <Box sx={{ width: '100%', mt: 1 }}>
          <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Fatura No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker label="Başlangıç Tarihi" value={startDate} onChange={(val) => setStartDate(val)} format="DD.MM.YYYY" slotProps={{ textField: { size: 'small' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker label="Bitiş Tarihi" value={endDate} onChange={(val) => setEndDate(val)} format="DD.MM.YYYY" slotProps={{ textField: { size: 'small' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select label="Tip" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} fullWidth size="small">
                <option value=""></option>
                <option value="1">Alım</option>
                <option value="2">İade</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" label="Bugün" color={preset === 'TODAY' ? 'primary' : 'default'} onClick={() => { setPreset('TODAY'); setStartDate(dayjs()); setEndDate(dayjs()); }} />
                <Chip size="small" label="Bu Hafta" color={preset === 'THIS_WEEK' ? 'primary' : 'default'} onClick={() => { setPreset('THIS_WEEK'); setStartDate(dayjs().startOf('week')); setEndDate(dayjs().endOf('week')); }} />
                <Chip size="small" label="Bu Ay" color={preset === 'THIS_MONTH' ? 'primary' : 'default'} onClick={() => { setPreset('THIS_MONTH'); setStartDate(dayjs().startOf('month')); setEndDate(dayjs().endOf('month')); }} />
                <Button size="small" variant="contained" onClick={fetchInvoices}>Listele</Button>
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2">Toplam: {filteredInvoices.length}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Fatura Numarası ile Ara" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth size="small" />
            </Grid>
          </Grid>
          <Divider sx={{ my: isMobile ? 1 : 2 }} />
          <Box sx={{ height: isMobile ? 'calc(100vh - 360px)' : 'auto' }}>
          <DataGrid
            rows={
              searchTerm.trim() === ''
                ? filteredInvoices
                : filteredInvoices.filter((inv) =>
                  inv.inv_no?.toLowerCase().includes(searchTerm.trim().toLowerCase())
                )
            }
            columns={columns}
            autoHeight={!isMobile}
            loading={loading}
            onRowClick={(params) => setSelectedRow(params.row)}
            onRowDoubleClick={(params) => { onSelect(params.row); onClose(); }}
            selectionModel={selectedRow ? [selectedRow.id] : []}
            columnVisibilityModel={isMobile ? { id: false, inv_type: false } : undefined}
            rowHeight={isMobile ? 36 : 52}
            sx={{
              mt: 2,
              cursor: 'pointer',
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: '#d0f0fd !important',
              },
              '& .MuiDataGrid-cell': {
                py: isMobile ? 0.5 : 1
              }
            }}
            density={isMobile ? 'compact' : 'standard'}
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                count > 1
                  ? `${count.toLocaleString()} satır seçildi`
                  : `${count.toLocaleString()} satır seçildi`,
            }}
          />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: isMobile ? 1 : 2 }}>
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
