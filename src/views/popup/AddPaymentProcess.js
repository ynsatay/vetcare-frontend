import React, { useState, useEffect, useCallback } from "react";
import "./AddPaymentProcess.css";
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


  const handlePrint = (selectedIds) => {
    const selectedData = paidRows.filter(row =>
      selectedIds.includes(row.id) || selectedIds.includes(row.parentId)
    );

    const totalAmount = selectedData
      .filter(row => row.isMaster)
      .reduce((acc, row) => acc + Number(row.total_prices || 0), 0);

    const detailRows = selectedData.filter(row => !row.isMaster);

    const mastersById = {};
    selectedData.filter(row => row.isMaster).forEach(master => {
      mastersById[master.id] = master;
    });

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Fatura</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            .total-amount {
              font-weight: bold;
              font-size: 1.2em;
              margin-bottom: 15px;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Fatura</h2>
          <div class="total-amount">Toplam Tutar: ${totalAmount.toFixed(2)} ₺</div>
          <table>
            <thead>
              <tr>
                <th>İşlem</th>
                <th>Tutar</th>
                <th>Ödeme Tarihi</th>
                <th>Tür</th>
              </tr>
            </thead>
            <tbody>
              ${detailRows.map(row => {
            const master = mastersById[row.parentId];
            const ptime = master?.ptime ? new Date(master.ptime).toLocaleString('tr-TR') : '';
            const type = master?.type || '';
            return `
                  <tr>
                    <td>${row.process_name || '-'}</td>
                    <td>${Number(row.total_prices || 0).toFixed(2)} ₺</td>
                    <td>${ptime}</td>
                    <td>${type}</td>
                  </tr>
                `;
          }).join('')}
            </tbody>
          </table>
        </body>
      </html>
      `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="payment-modal">
      <div className="payment-card">
        <div className="payment-header">
          <h3>Ödenmemiş İşlemler</h3>
          <div className="payment-actions">
            <button className="payment-btn payment-primary" onClick={handlePayment} disabled={selectedUnpaid.length === 0}>Seçilenleri Tahsil Et</button>
          </div>
        </div>
        <div className="payment-data-grid">
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
            autoHeight
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                count > 1
                  ? `${count.toLocaleString()} satır seçildi`
                  : `${count.toLocaleString()} satır seçildi`,
            }}
          />
        </div>
      </div>

      <div className="payment-card">
        <div className="payment-header">
          <h3>Yapılmış Tahsilatlar</h3>
          <div className="payment-actions">
            <button className="payment-btn payment-danger" onClick={handleDeletePayment} disabled={selectedPaid.length === 0}>Seçilen Tahsilatı Sil</button>
            <button className="payment-btn payment-ghost" onClick={() => handlePrint(selectedPaid)} disabled={selectedPaid.length === 0}>Fatura Yazdır</button>
          </div>
        </div>
        <div className="payment-data-grid">
          <DataGrid
            rows={paidRows}
            columns={columns}
            checkboxSelection
            onSelectionModelChange={(ids) => {
              const filtered = ids.filter(id => {
                const row = paidRows.find(r => r.id === id);
                return row?.isMaster === true; // sadece master satır seçilebilir
              });
              setSelectedPaid(filtered);
            }}
            selectionModel={selectedPaid}
            autoHeight
            getRowClassName={(params) =>
              params.row.isDetail ? "payment-detail-row" : ""
            }
            isRowSelectable={(params) => params.row.isMaster === true}
            localeText={{
              ...trTR.components.MuiDataGrid.defaultProps.localeText,
              footerRowSelected: (count) =>
                count > 1
                  ? `${count.toLocaleString()} satır seçildi`
                  : `${count.toLocaleString()} satır seçildi`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddPaymentProcess;
