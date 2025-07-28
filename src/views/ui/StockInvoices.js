import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MaterialSelectModal from "../popup/MaterialSelectModal.js";
import { useConfirm } from '../../components/ConfirmContext';
import axiosInstance from '../../api/axiosInstance.ts';
import InvoiceSelectorModal from "../popup/InvoiceSelectorModal.js";
import dayjs from 'dayjs';
import { printInvoice } from '../../utils/printInvoice';
const INV_TYPES = [
  { value: 1, label: "Alım" },
  { value: 2, label: "İade" },
];

function StockInvoicePage() {
  const [invNo, setInvNo] = useState("");
  const [invDate, setInvDate] = useState("");
  const [invType, setInvType] = useState("");
  const [stocks, setStocks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [canPrint, setCanPrint] = useState(false);
  const [isNewInv, setIsNewInv] = useState(false);
  const { confirm } = useConfirm();

  const [selectOpen, setSelectOpen] = useState(false);

  const columns = [
    { field: "id", headerName: "#", width: 70, headerAlign: "center" },
    { field: "name", headerName: "Stok Adı", flex: 2, minWidth: 150, headerAlign: "center" },
    { field: "quantity", headerName: "Miktar", flex: 1, width: 100, headerAlign: "center", editable: isEditing, type: "number" },
    { field: "price", headerName: "Fiyat", flex: 1, width: 100, headerAlign: "center", type: "number", editable: isEditing, valueFormatter: (params) => `${params.value} ₺` },
    { field: "total", headerName: "Toplam Fiyat", flex: 1, width: 110, headerAlign: "center", valueFormatter: (params) => `${params.value} ₺` },
  ];

  const isFormValid =
    invNo.trim() !== "" &&
    invDate !== "" &&
    [1, 2, 3].includes(Number(invType)) &&
    stocks.length > 0;

  const handleNewInvoice = () => {
    setInvNo("");
    setInvDate("");
    setInvType("");
    setStocks([]);
    setIsNewInv(true);
    setIsEditing(true);
    setIsViewing(true);
    setIsInputDisabled(true);
    setSelectedInvoiceId(null);
    setCanPrint(false);
  };

  const handleAddStock = () => {
    setSelectOpen(true);
  };

  const handleCancel = async () => {
    const result = await confirm("Faturayı iptal etmek istediğinize emin misiniz?", "Evet", "Hayır", "İptal Onayı");
    if (!result) return;

    setInvNo("");
    setInvDate("");
    setInvType("");
    setStocks([]);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedRow(null);
    setIsInputDisabled(false);
    setIsNewInv(false);
  };

  const handleMaterialSelect = (materialList) => {
    const newItems = materialList.map((material, index) => ({
      id: stocks.length + index + 1,
      name: material.name,
      quantity: 1,
      price: material.purchase_price || 0,
      total: (material.purchase_price || 0) * 1,
      material_id: material.id,
    }));
    setStocks((prev) => [...prev, ...newItems]);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      await confirm("Lütfen fatura bilgilerini ve en az bir stok ekleyin.", "Tamam", "", "Uyarı");
      return;
    }

    try {
      const totalAmount = stocks.reduce((sum, s) => sum + (s.price * s.quantity), 0);
      if (!selectedInvoiceId) {
        // Yeni fatura oluşturma
        // const invoiceRes = await axiosInstance.post("/material-invoice/create", {
        //   inv_no: invNo,
        //   inv_date: invDate,
        //   inv_type: Number(invType),
        //   total_amount: totalAmount,
        // });

        // const invoiceId = invoiceRes.data.id;
        // if (!invoiceId) throw new Error("Fatura oluşturulurken ID dönmedi.");

        // // Stok hareketleri ekle
        // for (let s of stocks) {
        //   await axiosInstance.post("/material-movement/add", {
        //     mi_id: invoiceId,
        //     m_id: s.material_id,
        //     quantity: Number(s.quantity),
        //     price: Number(s.price),
        //     total_price: Number(s.price) * Number(s.quantity),
        //     movement_date: invDate,
        //     inv_type: Number(invType),
        //   });
        // }
        // setSelectedInvoiceId(invoiceId);

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

        // Önce tüm hareketleri sil (backend'de ilgili endpoint olmalı)
        await axiosInstance.delete(`/material-invoice/${selectedInvoiceId}/movement-delete`);

        // Sonra güncel hareketleri ekle
        for (let s of stocks) {
          await axiosInstance.post("/material-movement/add", {
            mi_id: selectedInvoiceId,
            m_id: s.material_id,
            quantity: Number(s.quantity),
            price: Number(s.price),
            total_price: Number(s.price) * Number(s.quantity),
            movement_date: invDate,
            inv_type: Number(invType),
          });
        }
      }

      await confirm("Fatura ve stok hareketleri başarıyla kaydedildi.", "Tamam", "", "Başarılı");
      setIsEditing(false);
      setIsViewing(true); // Güncellemeden sonra görüntüleme moduna geçebiliriz
      setIsInputDisabled(false);
      setCanPrint(true);
      setIsNewInv(false);

    } catch (err) {
      console.error("Kaydetme hatası:", err);
      await confirm(
        err.response?.data?.message ||
        err.message ||
        "Kaydetme sırasında bir hata oluştu.",
        "Tamam",
        "",
        "Hata"
      );
    }
  };

  const handleShowInvoice = async (invoiceId) => {
    try {
      const invoiceRes = await axiosInstance.get("/material-invoice/list");
      const invoice = invoiceRes.data.find(i => i.id === invoiceId);
      if (!invoice) throw new Error("Fatura bulunamadı");
      console.log(invoiceRes.data);
      setInvNo(invoice.inv_no);
      setInvDate(invoice.inv_date ? dayjs(invoice.inv_date).format("YYYY-MM-DD") : "");
      setInvType(invoice.inv_type);
      setIsEditing(false);
      setIsViewing(true);
      setSelectedInvoiceId(invoiceId);
      setIsNewInv(false);

      const movementsRes = await axiosInstance.get(`/material-invoice/${invoiceId}/movement-list`);
      const items = movementsRes.data.map((m, index) => ({
        id: index + 1,
        name: m.material_name,
        quantity: m.quantity,
        price: m.price,
        total: m.total_price,
        material_id: m.m_id,
      }));
      setStocks(items);
    } catch (err) {
      console.error("Gösterme hatası:", err);
    }
  };

  const handlePrint = () => {
    if (!selectedInvoiceId) return;

    printInvoice({ invNo, invDate, invType, stocks });
  };

  return (
    <Box
      style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}
    >
      <h4 className="mb-3">🧾 Stok Fatura Ekranı</h4>

      {/* Inputlar yan yana */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Fatura No"
          value={invNo}
          onChange={(e) => setInvNo(e.target.value)}
          disabled={!isInputDisabled}
          sx={{ flex: 1, minWidth: 180 }}
        />
        <TextField
          label="Fatura Tarihi"
          type="date"
          value={invDate}
          onChange={(e) => setInvDate(e.target.value)}
          disabled={!isInputDisabled}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1, minWidth: 180 }}
        />
        <TextField
          select
          label="Fatura Tipi"
          value={invType}
          onChange={(e) => setInvType(e.target.value)}
          disabled={!isInputDisabled}
          sx={{ flex: 1, minWidth: 180 }}
        >
          <MenuItem value="">Seçiniz</MenuItem>
          {INV_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Butonlar inputların altında, yan yana */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
      >
        <Button variant="contained" onClick={handleNewInvoice} disabled={isEditing}>
          Yeni Fatura
        </Button>
        <Button variant="contained" onClick={() => { setShowInvoiceModal(true); setIsInputDisabled(false); setCanPrint(true); }} disabled={isEditing}>
          Fatura Göster
        </Button>
        <Button
          variant="outlined"
          color="primary"
          disabled={!isViewing || isNewInv}   // sadece gösterim modunda aktif
          onClick={() => { setIsEditing(true); setIsInputDisabled(false); }}  // düzenleme modunu açar
        >
          Değiştir
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!isFormValid || !isEditing}
        >
          Kaydet
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={!isEditing}
          onClick={handleCancel}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAddStock}
          disabled={!isEditing}
        >
          Stok Ekle
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={!selectedRow?.length || !isEditing}
          onClick={() => {
            setStocks((prev) => prev.filter((s) => !selectedRow.includes(s.id)));
            setSelectedRow(null);
          }}
        >
          STOK SİL
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          disabled={!canPrint}
          onClick={handlePrint}
        >
          Yazdır
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={stocks}
          columns={columns}
          pageSizeOptions={[5]}
          selectionModel={selectedRow ? [selectedRow] : []}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          getRowId={(row) => row.id}
          sx={{ bgcolor: "background.default" }}
          processRowUpdate={(updatedRow) => {
            const updated = {
              ...updatedRow,
              total: updatedRow.quantity * updatedRow.price,
            };
            setStocks((prev) =>
              prev.map((row) => (row.id === updated.id ? updated : row))
            );
            return updated;
          }}
          experimentalFeatures={{ newEditingApi: true }}
          components={{
            NoRowsOverlay: () => (
              <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                Henüz stok eklenmedi.
              </Typography>
            ),
          }}

          onSelectionModelChange={(ids) => {
            setSelectedRow(ids.map(id => Number(id)));
          }}
        />
      </Box>

      <MaterialSelectModal
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        onSelect={handleMaterialSelect}
      />


      <InvoiceSelectorModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSelect={(invoice) => {
          handleShowInvoice(invoice.id);
          setShowInvoiceModal(false);
        }}
      />

    </Box>
  );
}

export default StockInvoicePage;
