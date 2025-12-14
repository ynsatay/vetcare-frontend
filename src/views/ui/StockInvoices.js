import React, { useMemo, useState } from "react";
import { Box, Button, TextField, MenuItem, Typography, Paper, Grid, Stack, Chip, Divider } from "@mui/material";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import MaterialSelectModal from "../popup/MaterialSelectModal.js";
import { useConfirm } from "../../components/ConfirmContext";
import axiosInstance from "../../api/axiosInstance.ts";
import InvoiceSelectorModal from "../popup/InvoiceSelectorModal.js";
import dayjs from "dayjs";
import { printInvoice } from "../../utils/printInvoice";
import { trTR } from '@mui/x-data-grid/locales';
import { useLanguage } from "../../context/LanguageContext.js";
import '../list/ListTheme.css';


function StockInvoicePage() {
  const { confirm } = useConfirm();
  const { t, lang } = useLanguage();
  const [invNo, setInvNo] = useState("");
  const [invDate, setInvDate] = useState("");
  const [invType, setInvType] = useState("");
  const [stocks, setStocks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [canPrint, setCanPrint] = useState(false);
  const [loadedFromExisting, setLoadedFromExisting] = useState(false);
  const apiRef = useGridApiRef();
  const INV_TYPES = useMemo(() => [
    { value: 1, label: t('Purchase') },
    { value: 2, label: t('Return') },
  ], [t]);

  const columns = useMemo(() => [
    { field: "id", headerName: "#", width: 70, headerAlign: "center" },
    { field: "name", headerName: t('StockName'), flex: 2, minWidth: 160, headerAlign: "center" },
    { field: "quantity", headerName: t('Quantity'), flex: 1, width: 110, headerAlign: "center", editable: isEditing, type: "number" },
    { field: "price", headerName: t('UnitPrice'), flex: 1, width: 130, headerAlign: "center", editable: isEditing, type: "number", valueFormatter: (p) => `${p.value} ₺` },
    { field: "total", headerName: t('Total'), flex: 1, width: 130, headerAlign: "center", valueFormatter: (p) => `${p.value} ₺` }
  ], [isEditing, t]);

  const subtotal = useMemo(() => stocks.reduce((sum, s) => sum + Number(s.price) * Number(s.quantity), 0), [stocks]);
  const headerValid = useMemo(() => invNo.trim() !== "" && invDate !== "" && [1, 2].includes(Number(invType)), [invNo, invDate, invType]);
  const isFormValid = useMemo(() => headerValid && stocks.length > 0, [headerValid, stocks]);

  const handleNewInvoice = () => {
    setInvNo("");
    setInvDate("");
    setInvType("");
    setStocks([]);
    setSelectedInvoiceId(null);
    setIsEditing(true);
    setCanPrint(false);
    setLoadedFromExisting(false);
  };

  const handleAddStock = async () => {
    if (!headerValid) {
      await confirm(lang === 'en' ? 'Please fill the invoice header first.' : 'Önce fatura bilgilerini doldurun.', t('Ok'), "", t('Warning'));
      return;
    }
    setSelectOpen(true);
  };

  const handleCancel = async () => {
    const ok = await confirm(lang === 'en' ? 'Are you sure you want to cancel the invoice?' : 'Faturayı iptal etmek istediğinize emin misiniz?', t('Yes'), t('No'), t('Warning'));
    if (!ok) return;
    setInvNo("");
    setInvDate("");
    setInvType("");
    setStocks([]);
    setIsEditing(false);
    setSelectedRows([]);
    setSelectedInvoiceId(null);
    setCanPrint(false);
  };

  const handleMaterialSelect = async (materialList) => {
    const base = stocks.length;
    const items = materialList.map((m, i) => ({
      id: base + i + 1,
      name: m.name,
      quantity: 1,
      price: m.purchase_price || 0,
      total: (m.purchase_price || 0) * 1,
      material_id: m.id
    }));
    // Sadece listeye ekle; kaydetme butonuna basınca persist edilecek
    setStocks((prev) => [...prev, ...items]);
    // Yeni eklenenleri otomatik seç — Stok Sil aktif olsun
    setSelectedRows(items.map(s => s.id));
    setSelectOpen(false);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      await confirm("Lütfen fatura bilgilerini ve en az bir stok ekleyin.", "Tamam", "", "Uyarı");
      return;
    }
    try {
      // Edit modundaki son değişiklikleri commit et
      try {
        const ids = stocks.map(s => s.id);
        ids.forEach((id) => {
          ["quantity", "price"].forEach((field) => {
            apiRef.current?.commitCellChange?.({ id, field });
            apiRef.current?.stopCellEditMode?.({ id, field });
          });
        });
      } catch { }

      const totalAmount = subtotal;
      if (!selectedInvoiceId) {
        const res = await axiosInstance.post("/material-invoice/full-create", {
          inv_no: invNo,
          inv_date: invDate,
          inv_type: Number(invType),
          total_amount: totalAmount,
          movements: stocks.map(s => ({
            m_id: s.material_id,
            quantity: Number(s.quantity),
            price: Number(s.price),
            total_price: Number(s.price) * Number(s.quantity),
            movement_date: invDate
          }))
        });
        setSelectedInvoiceId(res.data.id);
      } else {
        // Önce fatura başlığını güncelle
        await axiosInstance.put(`/material-invoice/${selectedInvoiceId}`, {
          inv_no: invNo,
          inv_date: invDate,
          inv_type: Number(invType),
          total_amount: totalAmount
        });
        await axiosInstance.delete(`/material-invoice/${selectedInvoiceId}/movement-delete`);
        for (let s of stocks) {
          await axiosInstance.post("/material-movement/add", {
            mi_id: selectedInvoiceId,
            m_id: s.material_id,
            quantity: Number(s.quantity),
            price: Number(s.price),
            total_price: Number(s.price) * Number(s.quantity),
            movement_date: invDate,
            inv_type: Number(invType)
          });
        }
      }
      await confirm(lang === 'en' ? 'Invoice and stock movements saved.' : 'Fatura ve stok hareketleri kaydedildi.', t('Ok'), "", t('Info'));
      setIsEditing(false);
      setCanPrint(true);
    } catch (err) {
      if (err.__demo_blocked) return;
      await confirm(err.response?.data?.message || err.message || (lang === 'en' ? 'An error occurred while saving.' : 'Kaydetme sırasında hata oluştu.'), t('Ok'), "", t('Error'));
    }
  };

  const handleShowInvoice = async (invoiceId) => {
    try {
      const invoiceRes = await axiosInstance.get("/material-invoice/list");
      const invoice = invoiceRes.data.find(i => i.id === invoiceId);
      if (!invoice) throw new Error(lang === 'en' ? 'Invoice not found' : 'Fatura bulunamadı');
      setInvNo(invoice.inv_no);
      setInvDate(invoice.inv_date ? dayjs(invoice.inv_date).format("YYYY-MM-DD") : "");
      setInvType(invoice.inv_type);
      setIsEditing(false);
      setSelectedInvoiceId(invoiceId);
      setCanPrint(true);
      setLoadedFromExisting(true);
      const movementsRes = await axiosInstance.get(`/material-invoice/${invoiceId}/movement-list`);
      const items = movementsRes.data.map((m, index) => ({
        id: index + 1,
        name: m.material_name,
        quantity: m.quantity,
        price: m.price,
        total: m.total_price,
        material_id: m.m_id
      }));
      setStocks(items);
    } catch {
    }
  };

  const handlePrint = () => {
    if (!selectedInvoiceId) return;
    printInvoice({ invNo, invDate, invType, stocks });
  };

  return (
    <Box className="list-page" sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg,#f7f7fb,#ffffff)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5">🧾 {t('NewInvoice')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleNewInvoice} disabled={isEditing}>{t('NewInvoice')}</Button>
            <Button variant="outlined" onClick={() => setShowInvoiceModal(true)} disabled={isEditing}>{t('OpenInvoice')}</Button>
            <Button variant="outlined" color="secondary" onClick={handlePrint} disabled={!canPrint}>{t('Print')}</Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField label={t('InvoiceNo')} value={invNo} onChange={(e) => setInvNo(e.target.value)} disabled={!isEditing} fullWidth />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label={lang === 'en' ? 'Invoice Date' : 'Fatura Tarihi'} type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} disabled={!isEditing} InputLabelProps={{ shrink: true }} fullWidth />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField select label={lang === 'en' ? 'Invoice Type' : 'Fatura Tipi'} value={invType} onChange={(e) => setInvType(e.target.value)} disabled={!isEditing} fullWidth>
                    <MenuItem value="">{t('Select')}</MenuItem>
                    {INV_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={isEditing ? t('NewInvoice') : t('Details')} color={isEditing ? "warning" : "default"} />
                <Chip label={`${t('Items')}: ${stocks.length}`} />
                <Chip label={`${t('Total')}: ${subtotal.toFixed(2)} ₺`} color="success" />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {loadedFromExisting && !isEditing && (
                  <Button variant="outlined" color="warning" onClick={() => setIsEditing(true)}>{t('EditAction')}</Button>
                )}
                <Button variant="contained" color="success" onClick={handleAddStock} disabled={!isEditing}>{t('AddStock')}</Button>
                <Button variant="outlined" color="error" disabled={!selectedRows.length || !isEditing} onClick={() => { setStocks(prev => prev.filter(s => !selectedRows.includes(s.id))); setSelectedRows([]); }}>{t('DeleteStock')}</Button>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={!isFormValid || !isEditing}>{t('Save')}</Button>
                <Button variant="outlined" color="error" onClick={handleCancel} disabled={!isEditing}>{t('Cancel')}</Button>
              </Stack>
              <Box className="list-data-grid" sx={{ height: 520, width: "100%" }}>
                <DataGrid
                  apiRef={apiRef}
                  rows={stocks}
                  columns={columns}
                  pageSizeOptions={[5]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  hideFooterSelectedRowCount
                  getRowId={(row) => row.id}
                  rowSelectionModel={selectedRows}
                  processRowUpdate={(updatedRow) => {
                    const updated = { ...updatedRow, total: Number(updatedRow.quantity) * Number(updatedRow.price) };
                    setStocks(prev => prev.map(r => (r.id === updated.id ? updated : r)));
                    return updated;
                  }}
                  experimentalFeatures={{ newEditingApi: true }}
                  onRowSelectionModelChange={(ids) => setSelectedRows(ids.map(id => Number(id)))}
                  slots={{
                    noRowsOverlay: () => <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>{t('NoRows')}</Typography>
                  }}
                  localeText={{
                    ...trTR.components.MuiDataGrid.defaultProps.localeText,
                    footerRowSelected: (count) =>
                      lang === 'en'
                        ? `${count.toLocaleString()} row selected`
                        : `${count.toLocaleString()} satır seçildi`,
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1">{t('Summary')}</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography>{t('Items')}</Typography><Typography>{stocks.length}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography>{t('Total')}</Typography><Typography>{subtotal.toFixed(2)} ₺</Typography></Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <MaterialSelectModal open={selectOpen} onClose={() => setSelectOpen(false)} onSelect={handleMaterialSelect} />
      <InvoiceSelectorModal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} onSelect={(invoice) => { handleShowInvoice(invoice.id); setShowInvoiceModal(false); }} />
    </Box>
  );
}

export default StockInvoicePage;
