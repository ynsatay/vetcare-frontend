import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip, Divider, Typography, useMediaQuery, MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axiosInstance from '../../api/axiosInstance.ts';
import dayjs from 'dayjs';
import { trTR } from '@mui/x-data-grid/locales';
import { useLanguage } from '../../context/LanguageContext.js';
import './InvoiceSelectorModal.css';

const InvoiceSelectorModal = ({ open, onClose, onSelect }) => {
  const { t, lang } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const invoiceTypeLabel = (v) => {
    if (Number(v) === 1) return t('Purchase');
    return t('Return');
  };

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
    { field: 'inv_no', headerName: t('InvoiceNo'), flex: 1 },
    {
      field: 'inv_date',
      headerName: lang === 'en' ? 'Date' : 'Tarih',
      width: 130,
      valueFormatter: (params) => dayjs(params.value).format('DD.MM.YYYY'),
    },
    {
      field: 'inv_type',
      headerName: t('Type'),
      width: 100,
      flex: 1,
      valueFormatter: (params) => invoiceTypeLabel(params.value) || '-',
    },
    {
      field: 'total_amount',
      headerName: lang === 'en' ? 'Amount' : 'Tutar',
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
      PaperProps={{
        className: 'invoice-selector-modal',
        sx: isMobile ? { width: '100%', m: 0, borderRadius: 0 } : {},
      }}
    >
      <DialogTitle sx={{ p: isMobile ? 1 : 2 }}>{t('InvoiceSelection')}</DialogTitle>
      <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
        <Box sx={{ width: '100%', mt: 1 }}>
          <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label={t('InvoiceNo')} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker label={t('StartDate')} value={startDate} onChange={(val) => setStartDate(val)} format="DD.MM.YYYY" slotProps={{ textField: { size: 'small' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker label={t('EndDate')} value={endDate} onChange={(val) => setEndDate(val)} format="DD.MM.YYYY" slotProps={{ textField: { size: 'small' } }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label={t('Type')}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">{t('All')}</MenuItem>
                <MenuItem value="1">{t('Purchase')}</MenuItem>
                <MenuItem value="2">{t('Return')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" label={t('Today')} color={preset === 'TODAY' ? 'primary' : 'default'} onClick={() => { setPreset('TODAY'); setStartDate(dayjs()); setEndDate(dayjs()); }} />
                <Chip size="small" label={t('ThisWeek')} color={preset === 'THIS_WEEK' ? 'primary' : 'default'} onClick={() => { setPreset('THIS_WEEK'); setStartDate(dayjs().startOf('week')); setEndDate(dayjs().endOf('week')); }} />
                <Chip size="small" label={t('ThisMonth')} color={preset === 'THIS_MONTH' ? 'primary' : 'default'} onClick={() => { setPreset('THIS_MONTH'); setStartDate(dayjs().startOf('month')); setEndDate(dayjs().endOf('month')); }} />
                <Button size="small" variant="contained" onClick={fetchInvoices}>{t('List')}</Button>
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2">{t('TotalCount')}: {filteredInvoices.length}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('SearchByInvoiceNo')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth size="small" />
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
                backgroundColor: 'rgba(var(--id-primary-rgb, 99, 102, 241), 0.18) !important',
              },
              '& .MuiDataGrid-cell': {
                py: isMobile ? 0.5 : 1
              }
            }}
            density={isMobile ? 'compact' : 'standard'}
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                lang === 'en'
                  ? `${count.toLocaleString()} row selected`
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
          {t('SelectItem')}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceSelectorModal;
