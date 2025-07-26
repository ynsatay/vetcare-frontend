import React, { useState, useEffect, useCallback } from "react";
import { Button, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../api/axiosInstance.ts";
import { trTR } from '@mui/x-data-grid/locales';

const AddPaymentProcess = ({ pa_id, vet_u_id }) => {
  const [unpaidRows, setUnpaidRows] = useState([]);
  const [paidRows, setPaidRows] = useState([]);
  const [selectedUnpaid, setSelectedUnpaid] = useState([]);
  const [selectedPaid, setSelectedPaid] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const unpaidRes = await axiosInstance.get("/unpaid-processes", {
        params: { pa_id }
      });
      setUnpaidRows(unpaidRes.data.map(item => ({
        ...item,
        total_price: item.total_prices
      })));

      const paidRes = await axiosInstance.get(`/payments/${pa_id}`);

      // Master ve detayları aynı dizide birleştiriyoruz
      const paidMappedWithDetails = [];
      paidRes.data.forEach(payment => {
        paidMappedWithDetails.push({
          id: `master-${payment.id}`,
          isMaster: true,
          ptime: payment.ptime,
          type: payment.type,
          ctime: payment.ctime,
          total_prices: payment.total_prices
        });

        payment.details.forEach(det => {
          paidMappedWithDetails.push({
            id: `detail-${det.id}`,
            isDetail: true,
            parentId: `master-${payment.id}`,
            process_name: det.process_name,
            total_prices: det.total_prices,
            // Diğer detay alanlar varsa ekle
          });
        });
      });

      setPaidRows(paidMappedWithDetails);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  }, [pa_id]);

  // Tahsilat yap
  const handlePayment = async () => {
    try {
      const selectedDetails = unpaidRows
        .filter(row => selectedUnpaid.includes(row.id))
        .map(row => ({
          pp_id: row.id,
          amount: row.total_prices,
        }));

      console.log("Gönderilen detaylar:", selectedDetails);

      await axiosInstance.post("/add-payment", {
        pa_id,
        vet_u_id,
        type: "nakit",
        is_refund: false,
        details: selectedDetails
      });

      await fetchData();
      setSelectedUnpaid([]);
    } catch (error) {
      console.error("Tahsilat hatası:", error);
    }
  };

  // Tahsilat sil (sadece master satırlar seçilebilir)
  const handleDeletePayment = async () => {
    try {
      // Seçilenler master satırlardan geliyor, id'lerden "master-" kısmını çıkarıyoruz
      const idsToDelete = selectedPaid
        .filter(id => typeof id === "string" && id.startsWith("master-"))
        .map(id => Number(id.replace("master-", "")));

      await Promise.all(
        [...new Set(idsToDelete)].map((id) =>
          axiosInstance.delete(`/delete-payment/${id}`)
        )
      );

      await fetchData();
      setSelectedPaid([]);
    } catch (error) {
      console.error("Tahsilat silme hatası:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pa_id, fetchData]);


  const columns = [
    {
      field: "process_name",
      headerName: "İşlem",
      width: 300,
      flex: 2,
      renderCell: (params) => {
        if (params.row.isMaster) {
          return <strong>{`Tahsilat ID: ${params.row.id.replace("master-", "")}`} </strong>;
        } else if (params.row.isDetail) {
          return <span style={{ paddingLeft: 30 }}>{params.value} </span>;
        }
        return params.value;
      },
    },
    {
      field: "total_prices",
      headerName: "Tutar",
      width: 100,
      flex: 1,
      valueFormatter: (params) => params.value ? `${params.value} ₺` : ''
    },
    {
      field: "ptime",
      headerName: "Ödeme Tarihi",
      width: 160,
      flex: 1,
      valueGetter: (params) => (params.row.isMaster ? params.row.ptime : ""),
      valueFormatter: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        return date.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    },
    {
      field: "type",
      headerName: "Ödeme Türü",
      width: 130,
      flex: 1,
      valueGetter: (params) => (params.row.isMaster ? params.row.type : ""),
    },
  ];


  return (
    <Box>
      <h5>Ödenmemiş İşlemler</h5>
      <DataGrid
        rows={unpaidRows}
        columns={[
          { field: "id", headerName: "ID", width: 70, flex: 1 },
          { field: "process_name", headerName: "İşlem", width: 200, flex: 2 },
          { field: "total_price", headerName: "Tutar", width: 100, flex: 1 },
          {
            field: "ctime", headerName: "Tarih", width: 150, flex: 1,
            valueFormatter: (params) => {
              if (!params.value) return "";
              const date = new Date(params.value);
              return date.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          },
        ]}
        checkboxSelection
        onSelectionModelChange={(ids) => {
          setSelectedUnpaid(ids.map(id => Number(id)));
        }}
        selectionModel={selectedUnpaid}
        sx={{ height: 350, mb: 2 }}
        localeText={{
          ...trTR.components.MuiDataGrid.defaultProps.localeText,
          footerRowSelected: (count) =>
            count > 1
              ? `${count.toLocaleString()} satır seçildi`
              : `${count.toLocaleString()} satır seçildi`,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handlePayment}
        disabled={selectedUnpaid.length === 0}
        sx={{ mb: 4 }}
      >
        Seçilenleri Tahsil Et
      </Button>

      <h5>Yapılmış Tahsilatlar</h5>
      <DataGrid
        rows={paidRows}
        columns={columns}
        checkboxSelection
        // Detay satırlar seçilemesin diye filtreliyoruz:
        onSelectionModelChange={(ids) => {
          const filtered = ids.filter(id => {
            const row = paidRows.find(r => r.id === id);
            return row?.isMaster === true; // sadece master satır seçilebilir
          });
          setSelectedPaid(filtered);
        }}
        selectionModel={selectedPaid}
        sx={{ height: 350, mb: 2 }}
        getRowClassName={(params) =>
          params.row.isDetail ? "detail-row" : ""
        }
        // Detay satırlar seçilemesin diye:
        isRowSelectable={(params) => params.row.isMaster === true}
        localeText={{
          ...trTR.components.MuiDataGrid.defaultProps.localeText,
          footerRowSelected: (count) =>
            count > 1
              ? `${count.toLocaleString()} satır seçildi`
              : `${count.toLocaleString()} satır seçildi`,
        }}
      />
      <Button
        variant="outlined"
        color="error"
        onClick={handleDeletePayment}
        disabled={selectedPaid.length === 0}
      >
        Seçilen Tahsilatı Sil
      </Button>

      {/* Basit stil örneği, detay satırlarını açık renk yapalım */}
      <style>{`
        .detail-row {
          background-color: #f9f9f9;
          font-style: italic;
          color: #555;
        }
      `}</style>
    </Box>
  );
};

export default AddPaymentProcess;
