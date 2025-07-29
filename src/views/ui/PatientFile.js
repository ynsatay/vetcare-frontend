import React, { useState, useEffect, useCallback } from "react";
import {
  Row, Col, Card, CardBody, CardTitle, Button
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.ts";
import AddPatStock from "../popup/AddPatStock.js";
import AddPatService from "../popup/AddPatService.js"; // Hizmet popup'ı
import MainModal from '../../components/MainModal';
import { DataGrid } from '@mui/x-data-grid';
import AddPaymentProcess from '../popup/AddPaymentProcess.js';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';

const NewVisitFileLayout = () => {
  const { id } = useParams();
  const [visitFile, setVisitFile] = useState(null);
  const [patientProcesses, setPatientProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vet_u_id = localStorage.getItem('userid');
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [animalId, setAnimalId] = useState(null);
  const { confirm } = useConfirm();

  // Modal kontrol durumları
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const toggleStockModal = () => setIsAddStockModalOpen(prev => !prev);
  const toggleServiceModal = () => setIsAddServiceModalOpen(prev => !prev);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const togglePaymentModal = () => {
    if (isPaymentModalOpen) {
      fetchPaymentSummary();
    }
    setIsPaymentModalOpen(prev => !prev);
  };

  const [paymentSummary, setPaymentSummary] = useState({ total: 0, paid: 0, remaining: 0 });

  const navigate = useNavigate();

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'process_name', headerName: 'Stok/Hizmet Adı', flex: 1 },
    { field: 'count', headerName: 'Adet', width: 100 },
    { field: 'unit_price', headerName: 'Birim Fiyat', width: 130, renderCell: (params) => `${params.value} ₺` },
    { field: 'total_price', headerName: 'Toplam', width: 130, renderCell: (params) => `${params.value} ₺` },
    {
      field: 'actions',
      headerName: 'İşlem',
      width: 100,
      renderCell: (params) => (
        <Button color="danger" size="sm" onClick={() => handleDelete(params.row.id)} disabled={visitFile.is_discharge}>
          Sil
        </Button>
      ),
    },
  ];

  // Stok ekleme
  const handleAddStockToVisit = async (stock) => {
    try {
      await axiosInstance.post('/add-patient-process', {
        pa_id: id,
        process_id: stock.id,
        row_type: 'M',
        count: stock.count,
        total_prices: stock.count * stock.price,
        unit_prices: stock.price
      });
      //await confirm(`${stock.name} geliş dosyasına eklendi.`, "Tamam", "", "Uyarı");
      //toggleStockModal();

      const processRes = await axiosInstance.get(`/patient-process/${id}`);
      setPatientProcesses(processRes.data.map(item => ({
        ...item,
        unit_price: item.unit_price,
        total_price: item.total_prices,
      })) || []);
      fetchPaymentSummary();
    } catch (err) {
      await confirm('Stok eklenirken hata oluştu.', "Tamam", "", "Uyarı");
    }
  };

  // Hizmet ekleme
  const handleAddServiceToVisit = async (service) => {
    try {
      await axiosInstance.post('/add-patient-process', {
        pa_id: id,
        process_id: service.id,
        row_type: 'H',
        count: 1,
        total_prices: service.price,
        unit_prices: 0,
      });
      //alert(`${service.name} geliş dosyasına eklendi.`);
      //toggleServiceModal();

      const processRes = await axiosInstance.get(`/patient-process/${id}`);
      setPatientProcesses(processRes.data.map(item => ({
        ...item,
        unit_price: item.unit_price,
        total_price: item.total_prices,
      })) || []);
      fetchPaymentSummary();
    } catch (err) {
      await confirm('Hizmet eklenirken hata oluştu.', "Tamam", "", "Uyarı");
    }
  };

  // İşlem silme
  const handleDelete = async (processId) => {
    const result = await confirm("Bu işlemi silmek istediğinize emin misiniz?", "Evet", "Hayır", "Silme Onayı");
    if (!result) return;

    try {
      await axiosInstance.delete(`/delete-patient-process/${processId}`);
      setPatientProcesses(prev => prev.filter(p => p.id !== processId));
      fetchPaymentSummary();
    } catch (err) {
      await confirm(err.response?.data?.message || err.message || "Bir hata oluştu", "Tamam");
    }
  };

  //Ödeme Özeti
  const fetchPaymentSummary = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/payment-summary/${id}`);
      setPaymentSummary(res.data);
    } catch (error) {
      console.error("Ödeme özeti alınamadı:", error);
    }
  }, [id]);

  //Uygulanmamış Aşı Planları.
  const getUnappliedPlans = async () => {
    try {
      const response = await axiosInstance.get(`/vaccine/plans/unapplied/${animalId}`);
      setPlans(response.data);
    } catch (err) {
      console.error("Aşı planları alınamadı:", err);
      confirm("Aşı planları alınırken hata oluştu.", "Tamam", "", "Hata");
    }
  };

  //Aşı Uygulama
  const handleApplyVaccine = async () => {
    if (!selectedPlanId) {
      return confirm("Lütfen bir aşı planı seçin.", "Tamam", "", "Uyarı");
    }

    const plan = plans.find(p => p.id === selectedPlanId);
    const result = await confirm(`${plan.vaccine_name} aşısını uygulamak istiyor musunuz?`, "Evet", "Hayır", "Onay");
    if (!result) return;

    try {
      const stockDetailRes = await axiosInstance.get(`/material/id/${plan.m_id}`);
      const stock = stockDetailRes.data.data;

      const addProcessRes = await axiosInstance.post('/add-patient-process', {
        pa_id: id,
        process_id: stock.id,
        row_type: 'M',
        count: 1,
        total_prices: stock.price,
        unit_prices: stock.price
      });

      const pp_id = addProcessRes.data.id;

      await axiosInstance.put(`/vaccine/plan/${plan.id}/apply`, {
        is_applied: true,
        pp_id
      });

      await confirm(`${plan.vaccine_name} aşısı başarıyla uygulandı.`, "Tamam", "", "Bilgi");

      getUnappliedPlans();

      const processRes = await axiosInstance.get(`/patient-process/${id}`);
      setPatientProcesses(processRes.data.map(item => ({
        ...item,
        unit_price: item.unit_price,
        total_price: item.total_prices,
      })) || []);

      fetchPaymentSummary();
      setSelectedPlanId(null);
    } catch (err) {
      console.error("Aşı uygulanırken hata:", err);
      confirm("Aşı uygulanırken hata oluştu.", "Tamam", "", "Hata");
    }
  };

  const handleDischarge = async () => {
    const result = await confirm("Bu hastayı çıkış yapmak istiyor musunuz?", "Evet", "Hayır", "Onay");
    if (!result) return;

    try {
      await axiosInstance.put(`/patient-arrival/${id}/discharge`);
      setVisitFile(prev => ({ ...prev, is_discharge: true, discharge_time: new Date().toISOString() }));
    } catch (err) {
      const msg = err?.response?.data?.message || "Çıkış yapılırken bir hata oluştu.";
      await confirm(msg, "Tamam", "", "Hata");
    }
  };


  const handleUndoDischarge = async () => {
    const result = await confirm("Çıkışı iptal etmek istiyor musunuz?", "Evet", "Hayır", "Onay");
    if (!result) return;

    try {
      await axiosInstance.put(`/patient-arrival/${id}/undo-discharge`);
      setVisitFile(prev => ({ ...prev, is_discharge: false, discharge_time: null }));
    } catch (err) {
      await confirm("Çıkış iptali sırasında hata oluştu.", "Tamam", "", "Hata");
    }
  };


  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 1. Geliş bilgileri ve işlemleri paralel olarak çek
        const [infoRes, processRes] = await Promise.all([
          axiosInstance.get("/getPatientFileInfo", {
            params: { patFileId: id }
          }),
          axiosInstance.get(`/patient-process/${id}`)
        ]);

        if (infoRes.data.status === "success") {
          setVisitFile(infoRes.data.data[0]);
        } else {
          setError("Geliş bilgisi alınamadı");
        }

        setPatientProcesses(
          processRes.data.map(item => ({
            ...item,
            unit_price: item.unit_price,
            total_price: item.total_prices,
          })) || []
        );

        const animalRes = await axiosInstance.get(`/patient-arrival/${id}/animal`);
        setAnimalId(animalRes.data.animal_id);


        if (animalId) {
          const plansRes = await axiosInstance.get(`/vaccine/plans/unapplied/${animalId}`);
          setPlans(plansRes.data);
        }

      } catch (err) {
        console.error("Hata:", err);
        setError("Sunucu hatası");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchPaymentSummary();
  }, [id, fetchPaymentSummary, animalId]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;
  if (!visitFile) return <div>Geliş dosyası bulunamadı.</div>;

  return (
    <>
      <Row>
        {/* Sol Sütun */}
        <Col md={4} sm={12} style={{ marginTop: '20px' }}>
          <Card className="shadow-sm mb-4 h-100">
            <CardBody>
              <CardTitle tag="h5">Geliş Dosyası Bilgileri</CardTitle>
              <div className="mb-3"><strong>Hasta Adı:</strong> {visitFile.patient_name} {visitFile.patient_surname}</div>
              <div className="mb-3"><strong>Hayvan Adı:</strong> {visitFile.animal_name}</div>
              <div className="mb-3"><strong>Veteriner:</strong> {visitFile.vet_name} {visitFile.vet_surname}</div>
              <div className="mb-3"><strong>Geliş Tipi:</strong> {
                visitFile.type === 1 ? "Kontrol" :
                  visitFile.type === 2 ? "Acil" :
                    visitFile.type === 3 ? "Aşı" : "Bilinmiyor"
              }</div>
              <div className="mb-3"><strong>Geliş Zamanı:</strong> {new Date(visitFile.created_at).toLocaleString()}</div>
              <div className="mb-3"><strong>Çıkış Zamanı:</strong> {visitFile.discharge_time ? new Date(visitFile.discharge_time).toLocaleString() : '-'}</div>
            </CardBody>
            <CardBody>
              {/* <Button color="secondary" size="sm" onClick={() => navigate(`/IdentityInfo/${visitFile.id}`)} className="mb-3">
                ← Kimlik Kartına Geri Dön
              </Button> */}
              <Button color="secondary" size="sm" onClick={() => navigate(-1)} className="mb-3">
                ← Kimlik Kartına Geri Dön
              </Button>

              {!visitFile.is_discharge ? (
                <Button color="danger" size="sm" onClick={handleDischarge} className="mb-2" block>
                  Çıkış Yap
                </Button>
              ) : (
                <Button color="warning" size="sm" onClick={handleUndoDischarge} className="mb-2" block>
                  Çıkışı İptal Et
                </Button>
              )}

            </CardBody>
          </Card>
        </Col>

        {/* Sağ Sütun */}
        <Col md={8} sm={12} style={{ marginTop: '20px' }}>
          <Card className="shadow-sm mb-4 h-100">
            <CardBody className="d-flex flex-column" style={{ minHeight: 300 }}>
              <CardTitle tag="h5" className="d-flex justify-content-between align-items-center">
                <span>İşlenen Stoklar / Hizmetler</span>
                <div className="d-flex gap-2">
                  <Button color="success" size="sm" onClick={toggleStockModal} disabled={visitFile.is_discharge}>
                    Stok Ekle
                  </Button>
                  <Button color="success" size="sm" onClick={toggleServiceModal} disabled={visitFile.is_discharge}>
                    Hizmet Ekle
                  </Button>
                </div>
              </CardTitle>

              <DataGrid
                rows={patientProcesses.map((item, index) => ({ ...item, id: item.id }))}
                columns={columns}
                autoHeight={false}
                disableRowSelectionOnClick
                hideFooterPagination
                sx={{ height: 300 }}
                localeText={{
                  ...trTR.components.MuiDataGrid.defaultProps.localeText,
                  footerRowSelected: (count) =>
                    count > 1
                      ? `${count.toLocaleString()} satır seçildi`
                      : `${count.toLocaleString()} satır seçildi`,
                }}
              />
            </CardBody>
          </Card>
        </Col>

        {/* Stok Modal */}
        <MainModal
          isOpen={isAddStockModalOpen}
          toggle={toggleStockModal}
          title="Stok Ekle"
          content={<AddPatStock onClose={toggleStockModal} onSelect={handleAddStockToVisit} />}
          ShowFooter={false}
        />

        {/* Hizmet Modal */}
        <MainModal
          isOpen={isAddServiceModalOpen}
          toggle={toggleServiceModal}
          title="Hizmet Ekle"
          content={<AddPatService onClose={toggleServiceModal} onSelect={handleAddServiceToVisit} />}
          ShowFooter={false}
        />
      </Row>

      <Row>
        <Col md={4} sm={12} style={{ marginTop: "20px" }}>
          <Card className="shadow-sm h-100">
            <CardBody className="text-left" >
              <CardTitle tag="h5">Borçlara Ait Bilgiler</CardTitle>
              <div className="mb-3">
                Toplam Borç: <strong>{paymentSummary.total.toFixed(2)} ₺</strong>
              </div>
              <div className="mb-3">
                Ödenen: <strong>{paymentSummary.paid.toFixed(2)} ₺</strong>
              </div>
              <div className="mb-3">
                Kalan Borç: <strong>{paymentSummary.remaining.toFixed(2)} ₺</strong>
              </div>
              <Button color="primary" onClick={togglePaymentModal} disabled={visitFile.is_discharge}>
                Tahsilat Ekranı
              </Button>
            </CardBody>
          </Card>
        </Col>

        <Col md={8} sm={12} style={{ marginTop: "20px" }}>
          <Card className="shadow-sm mb-4 h-100">
            <CardBody className="d-flex flex-column" style={{ minHeight: 300 }}>
              <CardTitle tag="h5" className="d-flex justify-content-between align-items-center">
                <span>Planlanan Aşılar</span>
                <div className="d-flex gap-2">
                  <Button color="success" size="sm" onClick={handleApplyVaccine} disabled={visitFile.is_discharge}>
                    Uygula
                  </Button>
                </div>
              </CardTitle>

              <DataGrid
                rows={plans.map(plan => ({ ...plan, id: plan.id }))}
                columns={[
                  { field: 'vaccine_name', headerName: 'Aşı Adı', flex: 1 },
                  { field: 'planned_date', headerName: 'Planlanan Tarih', width: 150 },
                  { field: 'notes', headerName: 'Notlar', flex: 1 },
                  { field: 'm_id', headerName: 'Stok ID', width: 100, hide: true }
                ]}
                autoHeight
                disableRowSelectionOnClick={false}
                checkboxSelection={false}
                onRowClick={(params) => setSelectedPlanId(params.row.id)}
                sx={{ height: 300 }}
                localeText={{
                  ...trTR.components.MuiDataGrid.defaultProps.localeText,
                  footerRowSelected: (count) =>
                    count > 1
                      ? `${count.toLocaleString()} satır seçildi`
                      : `${count.toLocaleString()} satır seçildi`,
                }}
              />
            </CardBody>
          </Card>
        </Col>

        <MainModal
          modalStyle={{ maxWidth: '800px', width: '90%', maxHeight: '700px' }}
          isOpen={isPaymentModalOpen}
          toggle={togglePaymentModal}
          title="Tahsilat Ekranı"
          content={<AddPaymentProcess pa_id={id} vet_u_id={vet_u_id} onPaymentSuccess={fetchPaymentSummary} />}
          ShowFooter={false}
        />
      </Row>
    </>
  );
};

export default NewVisitFileLayout;
