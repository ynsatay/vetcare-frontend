import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from "../../api/axiosInstance.ts";
import Animals from '../popup/Animals.js';
import MainModal from '../../components/MainModal.js';
import PatientFileReg from '../popup/PatientFileReg.js';
import { useConfirm } from '../../components/ConfirmContext';
import { 
  User, PawPrint, Mail, Phone, MapPin, Calendar, Hash, Trash2, Plus, Save, 
  FolderPlus, ClipboardList, Syringe, CalendarCheck, CreditCard
} from 'lucide-react';
import './IdentityInfo.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';

const IdentityInfo = () => {
  const location = useLocation();
  const { userId, identity, animalId } = location.state || {};

  const [animalsList, setAnimalsList] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [visitList, setVisitList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vaccinationList, setVaccinationList] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOwner, setIsSavingOwner] = useState(false);
  const [isDeletingAnimal, setIsDeletingAnimal] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPatientFileRegOpen, setIsPatientFileRegOpen] = useState(false);

  const [appointmentList, setAppointmentList] = useState([]);
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('detay');
  const [ownerCollapsed, setOwnerCollapsed] = useState(true);
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [showApplyVisitModal, setShowApplyVisitModal] = useState(false);
  const [planToApply, setPlanToApply] = useState(null);
  const [selectedVisitIdForApply, setSelectedVisitIdForApply] = useState(null);
  const [vaxFilterText, setVaxFilterText] = useState('');
  const [vaxStatus, setVaxStatus] = useState(''); // '' | 'planned' | 'applied'
  const [vaxStartDate, setVaxStartDate] = useState('');
  const [vaxEndDate, setVaxEndDate] = useState('');
  const [vaxFilterOpen, setVaxFilterOpen] = useState(false);

  const isValidTC = (tc) => {
    tc = tc.toString();
    if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
    const digits = tc.split('').map(Number);
    const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
    const digit10 = (sumOdd * 7 - sumEven) % 10;
    const digit11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
    return digit10 === digits[9] && digit11 === digits[10];
  };

  const fetchAppointmentList = async (userAnimalId) => {
    try {
      if (!userAnimalId) { setAppointmentList([]); return; }
      const res = await axiosInstance.get('/getappointment');
      const all = res.data.data || [];
      const filtered = all.filter(a => {
        const ua = a.user_animal_id || a.userAnimalId || a.useranimalid;
        return ua && ua.toString() === userAnimalId.toString();
      });
      setAppointmentList(filtered);
    } catch (err) {
      setAppointmentList([]);
    }
  };

  const fetchVaccinationList = async (animalId) => {
    try {
      if (!animalId) { setVaccinationList([]); return; }
      const [unapplied, applied] = await Promise.all([
        axiosInstance.get(`/vaccine/plans/unapplied/${animalId}`).catch(() => ({ data: [] })),
        axiosInstance.get(`/vaccine/plans/applied/${animalId}`).catch(() => ({ data: [] }))
      ]);
      setVaccinationList([...(unapplied.data || []), ...(applied.data || [])]);
    } catch (err) {
      setVaccinationList([]);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!identity && !userId) {
        setOwnerInfo(null); setAnimalsList([]); setSelectedAnimal(null);
        return [];
      }

      let user = null;
      if (identity && isValidTC(identity)) {
        const res = await axiosInstance.get('/getpersonelsearch', { params: { tc: identity } });
        user = res.data.user || null;
      } else if (userId) {
        const res = await axiosInstance.get('/getpersonelsearchuid', { params: { user_id: userId } });
        user = res.data.user || null;
      }
      setOwnerInfo(user);

      if (!user) { setAnimalsList([]); setSelectedAnimal(null); return []; }

      const animalRes = await axiosInstance.get('/animalslist', { params: { user_id: user.id } });
      const animals = animalRes.data.response || [];
      setAnimalsList(animals);

      if (animalId) {
        const match = animals.find(a => a.id?.toString() === animalId?.toString());
        setSelectedAnimal(match || animals[0] || null);
      } else {
        setSelectedAnimal(animals[0] || null);
      }
      return animals;
    } catch (err) {
      setOwnerInfo(null); setAnimalsList([]); setSelectedAnimal(null);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [identity, userId, animalId]);

  const fetchVisitList = async (animalId) => {
    try {
      if (!animalId) { setVisitList([]); return; }
      const res = await axiosInstance.get("/arrivals", { params: { animalId } });
      setVisitList(res.data.status === 'success' ? res.data.data || [] : []);
    } catch (err) {
      setVisitList([]);
    }
  };

  useEffect(() => {
    const uaId = selectedAnimal?.data_id || selectedAnimal?.id;
    const baseId = selectedAnimal?.id;
    if (uaId || baseId) {
      fetchVisitList(baseId);
      fetchAppointmentList(uaId);
      fetchVaccinationList(baseId);
    } else {
      setVisitList([]); setAppointmentList([]); setVaccinationList([]);
    }
  }, [selectedAnimal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddAnimalClose = () => setIsAddModalOpen(false);

  const onAddAnimalSave = async (data) => {
    const newIdent = data?.animalidentnumber;
    setIsAddModalOpen(false);
    const res = await axiosInstance.get('/animalslist', { params: { user_id: ownerInfo?.id || userId } });
    const animals = res.data.response || [];
    setAnimalsList(animals);
    const added = animals.find(a => a.animalidentnumber?.toString() === newIdent?.toString());
    setSelectedAnimal(added || null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedAnimal(prev => {
      let updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'deathdate') updated.isdeath = !!value;
      return updated;
    });
  };

  const handleOwnerInputChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedAnimal?.data_id) {
      confirm("Hayvan seçili değil.", "Tamam", "", "Uyarı");
      return;
    }
    setIsSaving(true);
    try {
      const { data_id, ...payload } = selectedAnimal;
      const res = await axiosInstance.put(`/animalslistUpdate/${data_id}`, payload);
      confirm(res.status === 200 ? "Güncellendi." : "Hata.", "Tamam", "", res.status === 200 ? "Bilgi" : "Uyarı");
    } catch (err) {
      if (err.__demo_blocked) return; 
      confirm("Hata.", "Tamam", "", "Uyarı");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!selectedAnimal?.data_id) return;
    setIsDeletingAnimal(true);
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming = appointmentList.filter(a => {
        const d = new Date(a.process_date); d.setHours(0, 0, 0, 0);
        return d >= today && (a.status === 0 || a.status === 1);
      });
      if (upcoming.length > 0) {
        await confirm("Randevusu olan hayvan silinemez.", "Tamam", "", "Uyarı");
        return;
      }
      if (visitList?.length > 0) {
        await confirm("Geliş kaydı olan hayvan silinemez.", "Tamam", "", "Uyarı");
        return;
      }
      const proceed = await confirm("Hayvan silinecek. Devam?", "Evet", "Hayır", "Uyarı");
      if (!proceed) return;
      const res = await axiosInstance.delete(`/animalslistDel/${selectedAnimal.data_id}`);
      if (res.status === 200) {
        //await confirm("Silindi.", "Tamam", "", "Bilgi");
        toast.success('Geliş başarıyla silindi!');
        const aRes = await axiosInstance.get('/animalslist', { params: { user_id: ownerInfo?.id || userId } });
        const animals = aRes.data.response || [];
        setAnimalsList(animals);
        setSelectedAnimal(animals[0] || null);
      }
    } catch (err) {
      if (err.__demo_blocked) return; 
      confirm("Hata.", "Tamam", "", "Uyarı");
    } finally {
      setIsDeletingAnimal(false);
    }
  };

  const handleOwnerSave = async () => {
    if (!ownerInfo?.id) return;
    setIsSavingOwner(true);
    try {
      const { picture, sex, uname, ...rest } = ownerInfo;
      const payload = { ...rest, sex: sex || '', username: uname || '' };
      const res = await axiosInstance.put(`/updatepersonel/${ownerInfo.id}`, payload);
      confirm(res.status === 200 && res.data.status === 'success' ? "Güncellendi." : "Hata.", "Tamam", "", "Bilgi");
    } catch (err) {
      if (err.__demo_blocked) return; 
      confirm("Hata.", "Tamam", "", "Uyarı");
    } finally {
      setIsSavingOwner(false);
    }
  };

  const handleOwnerDelete = async () => {
    if (!ownerInfo?.id) return;
    if (animalsList?.length > 0) {
      await confirm("Sahibe bağlı hayvanlar bulunduğu için silinemez.", "Tamam", "", "Uyarı");
      return;
    }
    await confirm("Sahip silme özelliği bu sürümde devre dışı.", "Tamam", "", "Bilgi");
  };

  const getAnimalStatus = (animal) => {
    if (animal?.isdeath) return { text: 'Vefat', class: 'deceased' };
    if (animal?.active) return { text: 'Aktif', class: 'active' };
    return { text: 'Pasif', class: 'inactive' };
  };

  const getAnimalEmoji = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('köpek') || t.includes('dog')) return '🐕';
    if (t.includes('kedi') || t.includes('cat')) return '🐈';
    if (t.includes('kuş') || t.includes('bird')) return '🐦';
    return '🐾';
  };

  const getInitials = (name, surname) => {
    return `${(name || '')[0] || ''}${(surname || '')[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getAppointmentStatus = (status) => {
    const map = { 0: { text: 'Bekliyor', class: 'pending' }, 1: { text: 'Geldi', class: 'pending' }, 2: { text: 'Tamamlandı', class: 'completed' }, 3: { text: 'İptal', class: 'cancelled' } };
    return map[status] || { text: 'Bilinmiyor', class: 'pending' };
  };

  const handleApplyPlan = async (plan) => {
    setPlanToApply(plan);
    setSelectedVisitIdForApply(null);
    setShowApplyVisitModal(true);
  };

  const applyToSelectedVisit = async () => {
    if (!planToApply || !selectedVisitIdForApply) return;
    try {
      const stockDetailRes = await axiosInstance.get(`/material/id/${planToApply.m_id}`);
      const stock = stockDetailRes.data.data;
      const addProcessRes = await axiosInstance.post('/add-patient-process', {
        pa_id: selectedVisitIdForApply,
        process_id: planToApply.m_id,
        row_type: 'M',
        count: 1,
        total_prices: stock.price,
        unit_prices: stock.price
      });
      const pp_id = addProcessRes.data.id;
      await axiosInstance.put(`/vaccine/plan/${planToApply.id}/apply`, { is_applied: true, pp_id });
      setShowApplyVisitModal(false);
      await confirm("Aşı başarıyla uygulandı.", "Tamam", "", "Bilgi");
      const baseId = selectedAnimal?.id;
      if (baseId) {
        await fetchVaccinationList(baseId);
      }
    } catch (err) {
      await confirm("Aşı uygulanırken hata oluştu.", "Tamam", "", "Hata");
    }
  };

  if (isLoading) {
    return (
      <div className="identity-page">
        <div className="identity-loading">
          <div className="identity-spinner" />
          <span style={{ color: 'var(--id-text-muted)' }}>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const filteredAnimals = animalsList.filter(a => {
    const q = filterText.toLowerCase();
    return [a.animalname, a.animal_name, a.species_name].some(v => (v || '').toLowerCase().includes(q));
  });

  const appointmentStatusCounts = {
    beklemede: appointmentList.filter(a => a.status === 0).length,
    geldi: appointmentList.filter(a => a.status === 1).length,
    tamamlandi: appointmentList.filter(a => a.status === 2).length,
    iptal: appointmentList.filter(a => a.status === 3).length,
  };

  const visitStatusCounts = {
    aktif: visitList.filter(v => !v.is_discharge).length,
    tamamlandi: visitList.filter(v => !!v.is_discharge).length,
  };

  return (
    <div className="identity-page">
      <div className="identity-container">
        <div className="identity-header">
          <div className="identity-header-left">
            <div className="identity-header-avatar">
              {ownerInfo ? getInitials(ownerInfo.name, ownerInfo.surname) : '?'}
            </div>
            <div className="identity-header-info">
              <h1>{ownerInfo ? `${ownerInfo.name} ${ownerInfo.surname}` : 'Bilgi Yok'}</h1>
              <div className="identity-header-meta"><CreditCard size={14} /> TC: {ownerInfo?.tc || 'Belirtilmemiş'}</div>
            </div>
          </div>
          <div className="identity-header-stats">
            <div className="identity-stat-pill"><PawPrint size={16} /> {animalsList.length}</div>
            <div className="identity-stat-pill"><ClipboardList size={16} /> {visitList.length}</div>
            <div className="identity-stat-pill"><CalendarCheck size={16} /> {appointmentList.length}</div>
            <div className="identity-stat-pill"><Syringe size={16} /> {vaccinationList.length}</div>
          </div>
        </div>

        <div className="identity-layout">
          <aside className="identity-sidebar">
            <div className="identity-animals-header">
              <h3 className="identity-animals-title"><PawPrint size={18} /> Hayvanlar</h3>
              <button className="identity-add-btn" onClick={() => setIsAddModalOpen(true)}><Plus size={18} /></button>
            </div>
            <div className="identity-search">
              <input className="identity-search-input" placeholder="Ara..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
            </div>
            <div className="identity-animals-list">
              {filteredAnimals.map(animal => (
                <div key={animal.id} className={`identity-animal-item ${selectedAnimal?.id === animal.id ? 'active' : ''}`} onClick={() => setSelectedAnimal(animal)}>
                  <div className="identity-animal-emoji">{getAnimalEmoji(animal.animal_name)}</div>
                  <div className="identity-animal-details">
                    <h4 className="identity-animal-name">{animal.animalname}</h4>
                    <p className="identity-animal-breed">{animal.animal_name}</p>
                  </div>
                  <span className={`identity-animal-badge ${getAnimalStatus(animal).class}`}>{getAnimalStatus(animal).text}</span>
                </div>
              ))}
              {filteredAnimals.length === 0 && <div className="identity-empty"><div className="identity-empty-icon">🐾</div><p>Sonuç yok</p></div>}
            </div>

            <div className="identity-section-card" style={{ marginTop: 16 }}>
              <div className="identity-section-header">
                <h4>Randevu Durumları</h4>
                <span className="identity-history-count">{appointmentList.length}</span>
              </div>
              <div className="identity-status-list">
                <div className="identity-status-item"><span className="dot pending"></span><span>Beklemede</span><strong>{appointmentStatusCounts.beklemede}</strong></div>
                <div className="identity-status-item"><span className="dot arrived"></span><span>Geldi</span><strong>{appointmentStatusCounts.geldi}</strong></div>
                <div className="identity-status-item"><span className="dot completed"></span><span>Tamamlandı</span><strong>{appointmentStatusCounts.tamamlandi}</strong></div>
                <div className="identity-status-item"><span className="dot cancelled"></span><span>İptal</span><strong>{appointmentStatusCounts.iptal}</strong></div>
              </div>
            </div>

            <div className="identity-section-card" style={{ marginTop: 16 }}>
              <div className="identity-section-header">
                <h4>Geliş Durumları</h4>
                <span className="identity-history-count">{visitList.length}</span>
              </div>
              <div className="identity-status-list">
                <div className="identity-status-item"><span className="dot pending"></span><span>Aktif</span><strong>{visitStatusCounts.aktif}</strong></div>
                <div className="identity-status-item"><span className="dot completed"></span><span>Tamamlandı</span><strong>{visitStatusCounts.tamamlandi}</strong></div>
              </div>
            </div>
          </aside>

          <main className="identity-content">
            <div className="identity-section-card">
              <div className="identity-section-header">
                <h3>Sahip Bilgileri</h3>
                <button className="identity-collapse-toggle" onClick={() => setOwnerCollapsed(c => !c)}>
                  {ownerCollapsed ? 'Düzenle' : 'Gizle'}
                </button>
              </div>
              {!ownerCollapsed ? (
                <div className="identity-owner-grid">
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">Adı</label>
                    <div className="identity-input-group">
                      <User className="identity-input-icon" size={16} />
                      <input className="identity-owner-input" name="name" value={ownerInfo?.name || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">Soyadı</label>
                    <div className="identity-input-group">
                      <User className="identity-input-icon" size={16} />
                      <input className="identity-owner-input" name="surname" value={ownerInfo?.surname || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">Telefon</label>
                    <div className="identity-input-group">
                      <Phone className="identity-input-icon" size={16} />
                      <input className="identity-owner-input" name="phone" value={ownerInfo?.phone || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">E-posta</label>
                    <div className="identity-input-group">
                      <Mail className="identity-input-icon" size={16} />
                      <input className="identity-owner-input" name="email" value={ownerInfo?.email || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field full">
                    <label className="identity-owner-label">Adres</label>
                    <div className="identity-input-group">
                      <MapPin className="identity-input-icon" size={16} />
                      <input className="identity-owner-input" name="address" value={ownerInfo?.address || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">Doğum Tarihi</label>
                    <div className="identity-input-group">
                      <Calendar className="identity-input-icon" size={16} />
                      <input type="date" className="identity-owner-input" name="birthdate" value={ownerInfo?.birthdate || ''} onChange={handleOwnerInputChange} />
                    </div>
                  </div>
                  <div className="identity-owner-field">
                    <label className="identity-owner-label">Cinsiyet</label>
                    <div className="identity-input-group">
                      <User className="identity-input-icon" size={16} />
                      <select className="identity-owner-select" name="sex" value={ownerInfo?.sex || ''} onChange={handleOwnerInputChange}>
                        <option value="">Seçiniz</option>
                        <option value="ERKEK">Erkek</option>
                        <option value="KADIN">Kadın</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="identity-owner-summary">
                  <div className="summary-row"><span>Ad Soyad</span><strong>{ownerInfo ? `${ownerInfo.name} ${ownerInfo.surname}` : '-'}</strong></div>
                  <div className="summary-row"><span>Telefon</span><strong>{ownerInfo?.phone || '-'}</strong></div>
                  <div className="summary-row"><span>E-posta</span><strong>{ownerInfo?.email || '-'}</strong></div>
                  <div className="summary-row"><span>Adres</span><strong>{ownerInfo?.address || '-'}</strong></div>
                </div>
              )}
              <div className="identity-owner-actions">
                <button className="identity-btn identity-btn-primary" onClick={handleOwnerSave} disabled={isSavingOwner}>
                  <Save size={16} /> {isSavingOwner ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            <div className="identity-tabs">
              <button className={`identity-tab ${activeTab === 'detay' ? 'active' : ''}`} onClick={() => setActiveTab('detay')}>Detay</button>
              <button className={`identity-tab ${activeTab === 'gelisler' ? 'active' : ''}`} onClick={() => setActiveTab('gelisler')}>Gelişler</button>
              <button className={`identity-tab ${activeTab === 'randevular' ? 'active' : ''}`} onClick={() => setActiveTab('randevular')}>Randevular</button>
              <button className={`identity-tab ${activeTab === 'asilar' ? 'active' : ''}`} onClick={() => setActiveTab('asilar')}>Aşılar</button>
            </div>

            {selectedAnimal ? (
              activeTab === 'detay' ? (
                <div className="identity-animal-detail">
                  <div className="identity-animal-detail-header">
                    <div className="identity-animal-detail-left">
                      <div className="identity-animal-detail-avatar">{getAnimalEmoji(selectedAnimal.animal_name)}</div>
                      <div className="identity-animal-detail-info">
                        <h3>{selectedAnimal.animalname}</h3>
                        <p>{selectedAnimal.animal_name} • {selectedAnimal.species_name || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    <div className="identity-animal-detail-actions">
                      <button className="identity-btn identity-btn-success" onClick={() => setIsPatientFileRegOpen(true)} disabled={selectedAnimal?.isdeath || !selectedAnimal?.active}>
                        <FolderPlus size={16} /> Yeni Geliş
                      </button>
                    </div>
                  </div>
                  <div className="identity-animal-detail-body">
                    <div className="identity-form-row">
                      <div className="identity-form-field">
                        <label className="identity-form-label">Hayvan Adı</label>
                        <input className="identity-form-input" name="animalname" value={selectedAnimal.animalname || ''} onChange={handleInputChange} />
                      </div>
                      <div className="identity-form-field">
                        <label className="identity-form-label">Türü</label>
                        <input className="identity-form-input" name="animal_name" value={selectedAnimal.animal_name || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="identity-form-row">
                      <div className="identity-form-field">
                        <label className="identity-form-label">Cinsi</label>
                        <input className="identity-form-input" value={selectedAnimal.species_name || ''} disabled />
                      </div>
                      <div className="identity-form-field">
                        <label className="identity-form-label"><Hash size={12} /> Kimlik No</label>
                        <input className="identity-form-input" name="animalidentnumber" value={selectedAnimal.animalidentnumber || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="identity-form-row">
                      <div className="identity-form-field">
                        <label className="identity-form-label"><Calendar size={12} /> Doğum Tarihi</label>
                        <input type="date" className="identity-form-input" name="birthdate" value={selectedAnimal.birthdate || ''} onChange={handleInputChange} />
                      </div>
                      <div className="identity-form-field">
                        <label className="identity-form-label">Ölüm Tarihi</label>
                        <input type="date" className="identity-form-input" name="deathdate" value={selectedAnimal.deathdate || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="identity-checkbox-grid">
                      <label className="identity-checkbox-card">
                        <input type="checkbox" name="active" checked={!!selectedAnimal.active} onChange={handleInputChange} />
                        <span>Aktif</span>
                      </label>
                      <label className="identity-checkbox-card">
                        <input type="checkbox" name="isdeath" checked={!!selectedAnimal.isdeath} disabled />
                        <span>Vefat Etti</span>
                      </label>
                    </div>
                  </div>
                  <div className="identity-animal-detail-footer">
                    <button className="identity-btn identity-btn-danger" onClick={handleDeleteAnimal} disabled={isDeletingAnimal}>
                      <Trash2 size={16} /> {isDeletingAnimal ? 'Siliniyor...' : 'Sil'}
                    </button>
                    <button className="identity-btn identity-btn-primary" onClick={handleSave} disabled={isSaving}>
                      <Save size={16} /> {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ) : activeTab === 'gelisler' ? (
                <div className="identity-history-card">
                  <div className="identity-history-header">
                    <h4 className="identity-history-title visits"><ClipboardList /> Gelişler</h4>
                    <span className="identity-history-count">{visitList.length}</span>
                  </div>
                  <div className="identity-history-body">
                    {visitList.length > 0 ? visitList.map((v, i) => (
                      <div key={i} className="identity-history-item" onClick={() => v?.id && navigate(`/patientFile/${v.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="identity-history-item-info">
                          <span className="identity-history-item-title">Geliş #{v.id}</span>
                          <span className="identity-history-item-date">{formatDate(v.created_at)}</span>
                        </div>
                        <span className={`identity-history-item-status ${v.is_discharge ? 'completed' : 'pending'}`}>
                          {v.is_discharge ? 'Taburcu' : 'Aktif'}
                        </span>
                      </div>
                    )) : <div className="identity-history-empty">Geliş kaydı yok</div>}
                  </div>
                </div>
              ) : activeTab === 'randevular' ? (
                <div className="identity-history-card">
                  <div className="identity-history-header">
                    <h4 className="identity-history-title appointments"><CalendarCheck /> Randevular</h4>
                    <span className="identity-history-count">{appointmentList.length}</span>
                  </div>
                  <div className="identity-history-body">
                    {appointmentList.length > 0 ? appointmentList.map((a, i) => (
                      <div key={i} className="identity-history-item">
                        <div className="identity-history-item-info">
                          <span className="identity-history-item-title">{a.app_type === 0 ? 'Muayene' : 'Kontrol'}</span>
                          <span className="identity-history-item-date">{formatDate(a.start_time)}</span>
                        </div>
                        <span className={`identity-history-item-status ${getAppointmentStatus(a.status).class}`}>
                          {getAppointmentStatus(a.status).text}
                        </span>
                      </div>
                    )) : <div className="identity-history-empty">Randevu yok</div>}
                  </div>
                </div>
              ) : (
                <div className="identity-history-card">
                  <div className="identity-history-header">
                    <h4 className="identity-history-title vaccinations"><Syringe /> Aşılar</h4>
                    <span className="identity-history-count">{vaccinationList.length}</span>
                  </div>
                  <div className="identity-vax-toolbar">
                    <div className="identity-toolbar-left">
                      <input
                        className="identity-search-input identity-search-compact"
                        placeholder="Aşı adına göre ara"
                        value={vaxFilterText}
                        onChange={(e) => setVaxFilterText(e.target.value)}
                      />
                    </div>
                    <div className="identity-toolbar-right">
                      <button
                        className="identity-btn identity-btn-ghost"
                        onClick={() => setVaxFilterOpen(o => !o)}
                      >
                        {vaxFilterOpen ? 'Filtreyi Gizle' : 'Filtreyi Aç'}
                      </button>
                      <div className="identity-chip-group">
                        {vaxStatus && (
                          <span className={`identity-chip ${vaxStatus === 'applied' ? 'success' : 'warning'}`}>
                            {vaxStatus === 'applied' ? 'Uygulandı' : 'Planlandı'}
                          </span>
                        )}
                        {vaxStartDate && <span className="identity-chip">Başlangıç: {vaxStartDate}</span>}
                        {vaxEndDate && <span className="identity-chip">Bitiş: {vaxEndDate}</span>}
                        {vaxFilterText && <span className="identity-chip">Ara: {vaxFilterText}</span>}
                      </div>
                      <button
                        className="identity-btn identity-btn-ghost"
                        onClick={() => { setVaxFilterText(''); setVaxStatus(''); setVaxStartDate(''); setVaxEndDate(''); }}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                  {vaxFilterOpen && (
                    <div className="identity-vax-advanced">
                      <div className="identity-chip-group">
                        <button
                          className={`identity-chip ${vaxStatus === '' ? 'primary' : ''}`}
                          onClick={() => setVaxStatus('')}
                        >
                          Tümü
                        </button>
                        <button
                          className={`identity-chip ${vaxStatus === 'planned' ? 'warning' : ''}`}
                          onClick={() => setVaxStatus('planned')}
                        >
                          Planlandı
                        </button>
                        <button
                          className={`identity-chip ${vaxStatus === 'applied' ? 'success' : ''}`}
                          onClick={() => setVaxStatus('applied')}
                        >
                          Uygulandı
                        </button>
                      </div>
                      <div className="identity-date-range">
                        <input
                          type="date"
                          className="identity-owner-input"
                          value={vaxStartDate}
                          onChange={(e) => setVaxStartDate(e.target.value)}
                        />
                        <span className="range-sep">—</span>
                        <input
                          type="date"
                          className="identity-owner-input"
                          value={vaxEndDate}
                          onChange={(e) => setVaxEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="identity-history-body">
                    {vaccinationList.length > 0 ? vaccinationList
                      .filter((v) => {
                        const nameOk = (v.vaccine_name || '').toLowerCase().includes(vaxFilterText.toLowerCase());
                        const statusOk = vaxStatus === '' ? true : (vaxStatus === 'applied' ? !!v.is_applied : !v.is_applied);
                        const refDateStr = v.is_applied ? v.applied_on : v.planned_date;
                        const refDate = refDateStr ? new Date(refDateStr) : null;
                        let dateOk = true;
                        if (vaxStartDate && refDate) {
                          const start = new Date(vaxStartDate);
                          start.setHours(0,0,0,0);
                          dateOk = dateOk && refDate >= start;
                        }
                        if (vaxEndDate && refDate) {
                          const end = new Date(vaxEndDate);
                          end.setHours(23,59,59,999);
                          dateOk = dateOk && refDate <= end;
                        }
                        return nameOk && statusOk && dateOk;
                      })
                      .map((v, i) => (
                      <div
                        key={i}
                        className="identity-history-item"
                        onClick={() => v?.pa_id && navigate(`/patientFile/${v.pa_id}`)}
                        style={{ cursor: v?.pa_id ? 'pointer' : 'default' }}
                      >
                        <div className="identity-history-item-info" style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap', columnGap: 40, rowGap: 6, width: '100%' }}>
                          <span className="identity-history-item-title">{v.vaccine_name || 'Aşı'}</span>
                          <span className="identity-history-item-title">Geliş {v.pa_id || '-'}</span>
                          <span className="identity-history-item-date" style={{ color: 'var(--id-text)' }}>{formatDate(v.planned_date || v.applied_on)}</span>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {!v.is_applied && (
                              <button
                                className="identity-btn identity-btn-success identity-btn-xs"
                                onClick={(e) => { e.stopPropagation(); handleApplyPlan(v); }}
                              >
                                Uygula
                              </button>
                            )}
                            <span className={`identity-history-item-status ${v.is_applied ? 'completed' : 'pending'}`}>
                              {v.is_applied ? 'Uygulandı' : 'Planlandı'}
                            </span>
                            
                          </div>
                        </div>
                      </div>
                    )) : <div className="identity-history-empty">Aşı planı yok</div>}
                  </div>
                </div>
              )
            ) : (
              <div className="identity-empty">
                <div className="identity-empty-icon">🐾</div>
                <p>Hayvan seçin veya yeni ekleyin</p>
              </div>
            )}
          </main>
        </div>

        <MainModal
          isOpen={isAddModalOpen}
          toggle={handleAddAnimalClose}
          title="Yeni Hayvan Ekle"
          content={<Animals ident_user_id={ownerInfo?.id || userId} onClose={handleAddAnimalClose} onSave={onAddAnimalSave} />}
          onSave={onAddAnimalSave}
          saveButtonLabel="Ekle"
          modalStyle={{ width: '100%', maxWidth: '560px', maxHeight: '80vh' }}
        />

        <MainModal
          isOpen={isPatientFileRegOpen}
          toggle={() => setIsPatientFileRegOpen(false)}
          title="Yeni Geliş Dosyası"
          content={
            <PatientFileReg
              pat_id={ownerInfo?.id || 0}
              pat_name={`${ownerInfo?.name || ''} ${ownerInfo?.surname || ''}`.trim()}
              animal_id={selectedAnimal?.id || 0}
              animal_name={selectedAnimal?.animalname || ''}
              navigateOnSave={false}
            />
          }
          saveButtonLabel="Kaydet"
          onSave={(result) => {
            setIsPatientFileRegOpen(false);
            const baseId = selectedAnimal?.id;
            if (baseId) {
              fetchVisitList(baseId);
            }
            setShowApplyVisitModal(true);
          }}
        />
        <Modal isOpen={showApplyVisitModal} toggle={() => setShowApplyVisitModal(false)}>
          <ModalHeader toggle={() => setShowApplyVisitModal(false)}>Aşıyı Uygula</ModalHeader>
          <ModalBody>
            {visitList.filter(v => !v.is_discharge).length === 0 ? (
              <div>Aktif geliş dosyası bulunamadı.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visitList.filter(v => !v.is_discharge).map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVisitIdForApply(v.id)}
                    style={{
                      padding: 10,
                      border: '1px solid var(--id-border)',
                      borderRadius: 8,
                      background: selectedVisitIdForApply === v.id ? 'rgba(99,102,241,0.08)' : 'var(--id-bg-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className="identity-history-item-title">Geliş #{v.id}</span>
                      <span className="identity-history-item-date">{new Date(v.created_at).toLocaleString('tr-TR')}</span>
                    </div>
                    <span className={`identity-history-item-status ${v.is_discharge ? 'completed' : 'pending'}`}>
                      {v.is_discharge ? 'Taburcu' : 'Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="success" disabled={!selectedVisitIdForApply} onClick={applyToSelectedVisit}>
              Bu Gelişe Uygula
            </Button>
            <Button color="primary" onClick={() => { setIsPatientFileRegOpen(true); }}>
              Yeni Geliş Oluştur
            </Button>
            <Button color="secondary" onClick={() => setShowApplyVisitModal(false)}>İptal</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default IdentityInfo;
