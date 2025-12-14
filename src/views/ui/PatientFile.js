import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.ts";
import AddPatStock from "../popup/AddPatStock.js";
import AddPatService from "../popup/AddPatService.js";
import MainModal from '../../components/MainModal';
import { DataGrid } from '@mui/x-data-grid';
import AddPaymentProcess from '../popup/AddPaymentProcess.js';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';
import './IdentityInfo.css';
import { ClipboardList, Wallet, CheckCircle2, AlertCircle, Syringe, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

const NewVisitFileLayout = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const [visitFile, setVisitFile] = useState(null);
  const [patientProcesses, setPatientProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vet_u_id = localStorage.getItem('userid');
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [animalId, setAnimalId] = useState(null);
  const { confirm } = useConfirm();
  const [procFilter, setProcFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('islemler');

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
    { field: 'process_name', headerName: t('Process'), flex: 1 },
    { field: 'count', headerName: t('Quantity'), width: 100 },
    { field: 'unit_price', headerName: t('UnitPrice'), width: 130, renderCell: (params) => `${params.value} ₺` },
    { field: 'total_price', headerName: t('Total'), width: 130, renderCell: (params) => `${params.value} ₺` },
    {
      field: 'actions',
      headerName: t('Actions'),
      width: 110,
      renderCell: (params) => (
        <button className="identity-btn identity-btn-danger identity-btn-xs" onClick={() => handleDelete(params.row.id)} disabled={visitFile.is_discharge}>
          {t('Delete')}
        </button>
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
      if (err.__demo_blocked) return; 
      await confirm(t('Error'), t('Ok'), "", t('Warning'));
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
      if (err.__demo_blocked) return;
      await confirm(t('Error'), t('Ok'), "", t('Warning'));
    }
  };

  // İşlem silme
  const handleDelete = async (processId) => {
    const result = await confirm(t('DeleteAnimalConfirm'), t('Yes'), t('No'), t('Warning'));
    if (!result) return;

    try {
      await axiosInstance.delete(`/delete-patient-process/${processId}`);
      setPatientProcesses(prev => prev.filter(p => p.id !== processId));
      fetchPaymentSummary();
    } catch (err) {
      if (err.__demo_blocked) return;
      await confirm(err.response?.data?.message || err.message || t('Error'), t('Ok'));
    }
  };

  //Ödeme Özeti
  const fetchPaymentSummary = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/payment-summary/${id}`);
      setPaymentSummary(res.data);
      setLastPaymentUpdate(new Date().toISOString());
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
      console.error("Failed to fetch vaccine plans:", err);
      confirm(t('VaccineApplyError'), t('Ok'), "", t('Error'));
    }
  };

  //Aşı Uygulama
  const handleApplyVaccine = async () => {
    if (!selectedPlanId) {
      return confirm(t('PleaseSelectVaccine'), t('Ok'), "", t('Warning'));
    }

    const plan = plans.find(p => p.id === selectedPlanId);
    const result = await confirm(`${t('ApplyVaccine')}: ${plan.vaccine_name}?`, t('Yes'), t('No'), t('Warning'));
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

      await confirm(t('VaccineAppliedSuccess'), t('Ok'), "", t('Info'));

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
      if (err.__demo_blocked) return;
      console.error("Error applying vaccine:", err);
      confirm(t('VaccineApplyError'), t('Ok'), "", t('Error'));
    }
  };

  const handleDischarge = async () => {
    const result = await confirm(t('Discharge') + '?', t('Yes'), t('No'), t('Info'));
    if (!result) return;

    try {
      await axiosInstance.put(`/patient-arrival/${id}/discharge`);
      setVisitFile(prev => ({ ...prev, is_discharge: true, discharge_time: new Date().toISOString() }));
    } catch (err) {
      if (err.__demo_blocked) return;
      const msg = err?.response?.data?.message || t('Error');
      await confirm(msg, t('Ok'), "", t('Error'));
    }
  };


  const handleUndoDischarge = async () => {
    const result = await confirm(t('UndoDischarge') + '?', t('Yes'), t('No'), t('Info'));
    if (!result) return;

    try {
      await axiosInstance.put(`/patient-arrival/${id}/undo-discharge`);
      setVisitFile(prev => ({ ...prev, is_discharge: false, discharge_time: null }));
    } catch (err) {
      if (err.__demo_blocked) return;
      await confirm(t('Error'), t('Ok'), "", t('Error'));
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
          setError(t('Error'));
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
        console.error("Error:", err);
        setError(t('ServerError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchPaymentSummary();
  }, [id, fetchPaymentSummary, animalId]);

  if (loading) return <div>{t('Loading')}</div>;
  if (error) return <div>{t('Error')}: {error}</div>;
  if (!visitFile) return <div>{t('VisitFileNotFound')}</div>;

  return (
    <div className="identity-page">
      <div className="identity-container">
        <div className="identity-header">
          <div className="identity-header-left">
            <div className="identity-header-avatar">🐾</div>
            <div className="identity-header-info">
              <h1>{t('VisitFile')}</h1>
              <div className="identity-header-meta">{t('Patient')}: {visitFile.patient_name} {visitFile.patient_surname}</div>
              <div className="identity-header-meta">{t('Animal')}: {visitFile.animal_name}</div>
              <div className="identity-header-meta">{t('Veterinarian')}: {visitFile.vet_name} {visitFile.vet_surname}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span className={`identity-chip ${visitFile.type === 2 ? 'warning' : visitFile.type === 3 ? 'accent' : 'primary'}`}>{visitFile.type === 1 ? t('Control') : visitFile.type === 2 ? t('Emergency') : visitFile.type === 3 ? t('Vaccination') : t('Unknown')}</span>
                <span className={`identity-chip ${visitFile.is_discharge ? 'success' : 'primary'}`}>{visitFile.is_discharge ? t('Discharged') : t('Active')}</span>
              </div>
            </div>
          </div>
          <div className="identity-header-stats">
            <div className="identity-stat-pill">{t('Processes')}: {patientProcesses.length}</div>
            <div className="identity-stat-pill">{t('Total')}: {paymentSummary.total.toFixed(2)} ₺</div>
            <div className="identity-stat-pill">{t('Paid')}: {paymentSummary.paid.toFixed(2)} ₺</div>
            <div className="identity-stat-pill">{t('Remaining')}: {paymentSummary.remaining.toFixed(2)} ₺</div>
          </div>
        </div>
        <div className="identity-progress"><div className="bar" style={{ width: `${paymentSummary.total ? Math.min(100, Math.round((paymentSummary.paid / paymentSummary.total) * 100)) : 0}%` }} /></div>

        <div className="identity-layout">
          <aside className="identity-sidebar">
            <div className="identity-section-card">
              <div className="identity-panel-banner">
                <div>
                  <div className="identity-panel-title">{t('VisitInfo')}</div>
                  <div className="identity-panel-sub">#{visitFile.id} · {new Date(visitFile.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')}</div>
                </div>
              </div>
              <div className="identity-owner-summary single">
                <div className="summary-row"><span>{t('VisitType')}</span><strong>{visitFile.type === 1 ? t('Control') : visitFile.type === 2 ? t('Emergency') : visitFile.type === 3 ? t('Vaccination') : t('Unknown')}</strong></div>
                <div className="summary-row"><span>{t('VisitTime')}</span><strong>{new Date(visitFile.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')}</strong></div>
                <div className="summary-row"><span>{t('DischargeTime')}</span><strong>{visitFile.discharge_time ? new Date(visitFile.discharge_time).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR') : '-'}</strong></div>
              </div>
            </div>
            <div className="identity-section-card">
              <div className="identity-section-header">
                <h3>{t('Collection')}</h3>
              </div>
              <div className="identity-owner-summary payments-summary">
                <div className="summary-row"><span>{t('Total')}</span><strong>{paymentSummary.total.toFixed(2)} ₺</strong></div>
                <div className="summary-row"><span>{t('Paid')}</span><strong>{paymentSummary.paid.toFixed(2)} ₺</strong></div>
                <div className="summary-row"><span>{t('Remaining')}</span><strong>{paymentSummary.remaining.toFixed(2)} ₺</strong></div>
              </div>
              <div className="identity-progress" style={{ marginTop: 8 }}><div className="bar" style={{ width: `${paymentSummary.total ? Math.min(100, Math.round((paymentSummary.paid / paymentSummary.total) * 100)) : 0}%` }} /></div>
              <div style={{ fontSize: 11, color: 'var(--id-text-muted)', textAlign: 'right' }}>{lastPaymentUpdate ? new Date(lastPaymentUpdate).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR') : ''}</div>
              <div className="identity-owner-actions">
                <button className="identity-btn identity-btn-primary" onClick={togglePaymentModal} disabled={visitFile.is_discharge}>{t('CollectionScreen')}</button>
              </div>
            </div>
            <div className="identity-section-card">
              <div className="identity-owner-actions start">
                <button className="identity-btn identity-btn-primary identity-btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> {t('BackToIdentityCard')}</button>
                {!visitFile.is_discharge ? (
                  <button className="identity-btn identity-btn-danger identity-btn-sm" onClick={handleDischarge}>{t('Discharge')}</button>
                ) : (
                  <button className="identity-btn identity-btn-success identity-btn-sm" onClick={handleUndoDischarge}>{t('UndoDischarge')}</button>
                )}
              </div>
            </div>
          </aside>

          <main className="identity-content">
            <div className="identity-tabs">
              <button className={`identity-tab ${activeTab === 'islemler' ? 'active' : ''}`} onClick={() => setActiveTab('islemler')}>{t('Operations')}</button>
              <button className={`identity-tab ${activeTab === 'asilar' ? 'active' : ''}`} onClick={() => setActiveTab('asilar')}>{t('Vaccinations')}</button>
            </div>

            {activeTab === 'islemler' && (
              <div className="identity-section-card">
                <div className="identity-section-header">
                  <h3 className="identity-card-title"><ClipboardList /> {t('ProcessedStocksServices')}</h3>
                </div>
                <div className="identity-action-bar">
                  <div className="identity-action-group">
                    <button className="identity-btn identity-btn-success" onClick={toggleStockModal} disabled={visitFile.is_discharge}>{t('AddStock')}</button>
                    <button className="identity-btn identity-btn-success" onClick={toggleServiceModal} disabled={visitFile.is_discharge}>{t('AddService')}</button>
                  </div>
                  <input className="identity-search-input identity-search-compact" placeholder={t('SearchPlaceholder')} value={procFilter} onChange={(e) => setProcFilter(e.target.value)} />
                </div>
                <div className="identity-data-grid">
                  <DataGrid
                    rows={patientProcesses.filter(p => (p.process_name || '').toLowerCase().includes(procFilter.toLowerCase())).map((item) => ({ ...item, id: item.id }))}
                    columns={columns}
                    autoHeight
                    disableRowSelectionOnClick
                    hideFooterPagination
                    localeText={{
                      ...trTR.components.MuiDataGrid.defaultProps.localeText,
                      footerRowSelected: (count) =>
                        lang === 'en'
                          ? `${count.toLocaleString()} row selected`
                          : `${count.toLocaleString()} satır seçildi`,
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'asilar' && (
              <div className="identity-section-card">
            <div className="identity-section-header">
              <h3 className="identity-card-title"><Syringe /> {t('PlannedVaccines')}</h3>
            </div>
            <div className="identity-action-bar">
              <div className="identity-action-group">
                <button className="identity-btn identity-btn-success" onClick={handleApplyVaccine} disabled={visitFile.is_discharge}>{t('Apply')}</button>
              </div>
              <input className="identity-search-input identity-search-compact" placeholder={t('SearchPlaceholder')} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} />
            </div>
                <div className="identity-data-grid">
                  <DataGrid
                    rows={plans.filter(pl => (pl.vaccine_name || '').toLowerCase().includes(planFilter.toLowerCase())).map(plan => ({ ...plan, id: plan.id }))}
                    columns={[
                      { field: 'vaccine_name', headerName: t('Vaccinations'), flex: 1 },
                      { field: 'planned_date', headerName: t('PlannedVaccines'), width: 150 },
                      { field: 'notes', headerName: t('Notes'), flex: 1 },
                      { field: 'm_id', headerName: t('Material') + ' ID', width: 100, hide: true }
                    ]}
                    autoHeight
                    disableRowSelectionOnClick={false}
                    checkboxSelection={false}
                    onRowClick={(params) => setSelectedPlanId(params.row.id)}
                    sx={{ height: 300 }}
                    localeText={{
                      ...trTR.components.MuiDataGrid.defaultProps.localeText,
                      footerRowSelected: (count) =>
                        lang === 'en'
                          ? `${count.toLocaleString()} row selected`
                          : `${count.toLocaleString()} satır seçildi`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tahsilat ayrı olarak sol panelde */}
          </main>
        </div>

        <MainModal
          isOpen={isAddStockModalOpen}
          toggle={toggleStockModal}
          title={t('AddStock')}
          content={<AddPatStock onClose={toggleStockModal} onSelect={handleAddStockToVisit} />}
          ShowFooter={false}
        />

        <MainModal
          isOpen={isAddServiceModalOpen}
          toggle={toggleServiceModal}
          title={t('AddService')}
          content={<AddPatService onClose={toggleServiceModal} onSelect={handleAddServiceToVisit} />}
          ShowFooter={false}
        />

        <MainModal
          modalStyle={{ maxWidth: '800px', width: '90%', maxHeight: '700px' }}
          isOpen={isPaymentModalOpen}
          toggle={togglePaymentModal}
          title={t('CollectionScreen')}
          content={<AddPaymentProcess pa_id={id} vet_u_id={vet_u_id} onPaymentSuccess={fetchPaymentSummary} />}
          ShowFooter={false}
        />
      </div>
    </div>
  );
};

export default NewVisitFileLayout;
