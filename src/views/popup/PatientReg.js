import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.ts';
import { Input } from 'reactstrap';
import { useConfirm } from '../../components/ConfirmContext';

const PatientReg = forwardRef((props, ref) => {
  const {
    initialInputValue = '',
    initialSearchByAnimalId = false,
    onSelect = null,
    onClose = null
  } = props;

  const [inputValue, setInputValue] = useState(initialInputValue);
  const [searchByAnimalId, setSearchByAnimalId] = useState(initialSearchByAnimalId);
  const [personelData, setPersonelData] = useState(null);
  const [ownersList, setOwnersList] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ tc: '', name: '', surname: '', phone: '', email: '' });
  const [newAnimal, setNewAnimal] = useState({ animal_name: '', name: '', species: '', animalidentity: '' });
  const [patientAutoFilled, setPatientAutoFilled] = useState(false);
  const [animalsspecies, setanimalsspecies] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [animalFormSearchId, setAnimalFormSearchId] = useState('');
  const [animalFormResults, setAnimalFormResults] = useState([]);
  const [existingAnimalSelected, setExistingAnimalSelected] = useState(null);
  const [isAnimalFormValid, setIsAnimalFormValid] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    const isValid =
      (newAnimal.animalname || '').trim() !== '' &&
      newAnimal.animal_name !== '' &&
      newAnimal.species !== '';
    setIsAnimalFormValid(isValid);
  }, [newAnimal.animalname, newAnimal.animal_name, newAnimal.species]);

  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    handleSave() {
      if (selected && (searchByAnimalId ? selectedOwner : personelData)) {
        if (onSelect) onSelect(searchByAnimalId ? selectedOwner : personelData);
      } else {
        console.log("Seçim yapılmadı.");
      }
    }
  }));

  // const handleAnimalChange = async (e) => {
  //   const animal_id = e.target.value;
  //   setSelectedAnimal(animal_id);

  //   if (animal_id === "") {
  //     setanimalsspecies([]);
  //     return;
  //   }

  //   try {
  //     const response = await axiosInstance.get('/animalsspecies', {
  //       params: { animal_id }
  //     });
  //     const animalData = response.data.response;
  //     setanimalsspecies(animalData);
  //   } catch (error) {
  //     console.error('API error:', error);
  //   }
  // };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başladığı için +1
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSaveAnimal = async () => {
    const birthdateToSend = newAnimal.birthdate || getTodayDate();
    const userId = personelData?.user_id || personelData?.id || selectedOwner?.user_id || selectedOwner?.id || null;
    const deathdate = newAnimal.deathdate || null;
    const animalIdentNumber = newAnimal.animalidentity || null;

    if (!userId) {
      confirm("Lütfen önce hasta ya da sahip seçiniz.", "Tamam", "", "Uyarı");
      return;
    }

    // If existing animal is selected, first check if it already belongs to the same user
    if (existingAnimalSelected) {
      // Normalize owners array (some code paths set owners, others used owner)
      const ownersArr = existingAnimalSelected.owners && existingAnimalSelected.owners.length > 0
        ? existingAnimalSelected.owners
        : (existingAnimalSelected.owner ? [existingAnimalSelected.owner] : []);

      const alreadyWithSameOwner = ownersArr.some(o => {
        const ownerId = o.user_id || o.id || o.data_id || o.userId || null;
        return ownerId && userId && ownerId.toString() === userId.toString();
      });

      if (alreadyWithSameOwner) {
        // Inform user that the animal is already registered to this user and cancel
        await confirm(
          "İşlem iptal edildi. Bu hayvan zaten seçili kullanıcıya kayıtlı.",
          "Tamam",
          "",
          "Bilgi"
        );

        // Clear fields and close form
        setNewAnimal({
          animalname: '',
          animal_name: '',
          species: '',
          animalidentity: '',
          birthdate: '',
          deathdate: '',
        });
        setExistingAnimalSelected(null);
        setAnimalFormResults([]);
        setShowAnimalForm(false);
        return;
      }

      // Otherwise confirm attaching an existing animal to another user
      const shouldContinue = await confirm(
        "Sistemde kayıtlı hayvanı başka kullanıcıyada kaydediceksiniz. Kayda devam edilsinmi?",
        "Evet",
        "Hayır",
        "Uyarı"
      );

      if (!shouldContinue) {
        // Clear fields on cancel
        setNewAnimal({
          animalname: '',
          animal_name: '',
          species: '',
          animalidentity: '',
          birthdate: '',
          deathdate: '',
        });
        setExistingAnimalSelected(null);
        setAnimalFormResults([]);
        setShowAnimalForm(false);
        return;
      }
    }

    try {
      const response = await axiosInstance.post('/animalpost', {
        user_id: userId,
        animal_id: selectedAnimal,
        animal_species_id: newAnimal.species,
        birthdate: birthdateToSend,
        deathdate: deathdate,
        animalidentnumber: animalIdentNumber || null,
        isdeath: deathdate ? true : false,
        animalname: newAnimal.animalname || '',
      });

      console.log('Response:', response.data);

      if (props.onSave) props.onSave();

      setNewAnimal({
        animalname: '',
        animal_name: '',
        species: '',
        animalidentity: '',
        birthdate: '',
        deathdate: '',
      });
      setExistingAnimalSelected(null);
      setShowAnimalForm(false);
      confirm("Kayıt İşlemi Başarılı", "Tamam", "", "Uyarı");

    } catch (error) {
      console.error('Error:', error);
      confirm("Hayvan kaydı sırasında hata oluştu.", "Tamam", "", "Uyarı");
    }
  };

  const handleSave = async () => {
    const { tc, name, surname, phone, email } = newPatient;

    if (!tc || !name || !surname || !phone || !email) {
      confirm("Tüm alanları doldurunuz.", "Tamam", "", "Uyarı");
      return false;
    }

    try {
      const tempUsername = `${(name[0] || '').toLowerCase()}${surname.slice(0, 3).toLowerCase()}`;

      const insertResponse = await axiosInstance.post('/addpersonel', {
        name,
        surname,
        username: tempUsername,
        password: tc,
        passwordAgain: tc,
        identity: newPatient.tc,
        email,
        phone,
        birthdate: null,
        role: 1, //1: hasta
        sex: '',
        address: '',
        picture: null,
        active: true
      });

      if (insertResponse.data.status === 'success') {
        const userId = insertResponse.data.insertId;

        const finalUsername = `${(name[0] || '').toLowerCase()}${surname.slice(0, 3).toLowerCase()}${userId}`;

        await axiosInstance.put('/updateusername', {
          id: userId,
          username: finalUsername
        });

        confirm("Kayıt başarıyla tamamlandı.", "Tamam", "", "Uyarı");
        handleSearch();
        return true;
      } else {
        console.error("Kayıt başarısız:", insertResponse.data.message);
        return false;
      }
    } catch (err) {
      console.error("Kayıt hatası:", err);
      return false;
    }
  };

  useEffect(() => { setInputValue(initialInputValue); }, [initialInputValue]);
  useEffect(() => { setSearchByAnimalId(initialSearchByAnimalId); }, [initialSearchByAnimalId]);
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await axiosInstance.get('/animals');
        setAnimals(response.data.response);
      } catch (error) {
        console.error('Tür verileri alınamadı:', error);
      }
    };

    fetchAnimals();
  }, []);

  const handleanimalchange = async (e) => {
    const animal_id = e.target.value;
    setSelectedAnimal(animal_id);

    setNewAnimal((prev) => ({
      ...prev,
      animal_name: animal_id,
      species: ''
    }));

    if (!animal_id) {
      setanimalsspecies([]);
      return;
    }

    try {
      const response = await axiosInstance.get('/animalsspecies', {
        params: { animal_id }
      });
      setanimalsspecies(response.data.response);
    } catch (error) {
      console.error('Cins verileri alınamadı:', error);
    }
  };

  const fetchPatientByTC = async (tc) => {
    try {
      const response = await axiosInstance.get('/getpersonelsearch', { params: { tc } });
      const data = response.data.user || response.data;

      if (data && Object.keys(data).length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Hasta TC sorgusu hatası:', error);
    }
    return null;
  };

  const searchByTC = async () => {
    if (!inputValue) {
      setError('Lütfen bir TC giriniz.');
      return;
    }

    setError('');
    setPersonelData(null);
    setShowPatientForm(false);
    setShowAnimalForm(false);
    setSelected(false);
    setSelectedOwner(null);
    setSelectedAnimal(null);
    setOwnersList([]);

    const data = await fetchPatientByTC(inputValue);

    if (data) {
      setPersonelData(data);
      setShowAnimalForm(false);
    } else {
      const confirmCreate = window.confirm("Hasta bulunamadı. Yeni kayıt oluşturulsun mu?");
      if (confirmCreate) {
        setNewPatient({ tc: inputValue, name: '', surname: '', phone: '' });
        setShowPatientForm(true);
        setShowAnimalForm(false);
      }
    }
  };

  const searchByAnimalIdFunc = async () => {
    if (!inputValue) {
      setError('Lütfen bir Hayvan ID giriniz.');
      return;
    }

    setError('');
    setPersonelData(null);
    setOwnersList([]);
    setSelectedOwner(null);
    setSelectedAnimal(null);
    setSelected(false);
    setShowAnimalForm(false);

    try {
      const response = await axiosInstance.get('/getanimalsearch', { params: { tc: inputValue, IsAnimalId: 1 } });
      const owners = response.data.data || [];
      const animal = response.data.animal || null;

      if (owners.length === 0 && !animal) {
        const confirm = window.confirm("Hayvan bulunamadı. Yeni kayıt oluşturulsun mu?");
        if (confirm) {
          setShowPatientForm(true);
          setShowAnimalForm(false);
        }
      } else {
        if (owners.length === 1) setSelectedOwner(owners[0]);
        else if (owners.length > 1) setOwnersList(owners);

        if (animal) setSelectedAnimal(animal);

        setShowAnimalForm(false);
      }
    } catch (error) {
      console.error('Hayvan sorgu hatası:', error);
      setError('Hayvan bulunamadı veya sunucu hatası');
    }
  };

  const handleSearch = () => {
    if (searchByAnimalId) searchByAnimalIdFunc();
    else searchByTC();
  };

  const handleSelectOwner = (e) => {
    const ownerId = e.target.value;
    const owner = ownersList.find(o => o.data_id.toString() === ownerId);
    setSelectedOwner(owner);
    setSelected(false);
    setError('');
  };

  // const handleSelect = () => setSelected(true);

  const goToIdentity = () => {
    const data = searchByAnimalId ? selectedOwner : personelData;
    const fallback = showPatientForm ? { id: 'yeni', identity: newPatient.tc } : null;

    if (!data && !fallback) {
      confirm("Lütfen önce arama yapınız veya kayıt oluşturunuz.", "Tamam", "", "Uyarı");
      return;
    }

    if (onClose) onClose();
    console.log(data.id)
    navigate(`/IdentityInfo/${data?.user_id || data?.id || fallback.id}`, {
      state: {
        userId: data?.user_id || data?.id || fallback.id,
        identity: data?.animalidentnumber || data?.identity || fallback.identity,
        animalId: data?.id || null
      }
    });
  };

  const handleAddAnimalClick = () => {
    // open animal form (user can either create new or search by animal id here)
    setExistingAnimalSelected(null);
    setAnimalFormSearchId('');
    setAnimalFormResults([]);
    setShowAnimalForm(true);
  };

  const searchAnimalByIdWithinForm = async () => {
    const id = animalFormSearchId?.toString().trim();
    if (!id) {
      setError('Lütfen bir Hayvan ID giriniz.');
      return;
    }
    setError('');
    try {
      const res = await axiosInstance.get('/getanimalsearch', { params: { tc: id, IsAnimalId: 1 } });
      const owners = res.data.data || [];
      const animal = res.data.animal || null;
      const results = [];
      // normalize results: prefer animal info combined with owner
      if (owners && owners.length) {
        owners.forEach(o => results.push({ owner: o, animal: o }));
      }
      if (animal) {
        results.push({ owner: null, animal });
      }
      setAnimalFormResults(results);
    } catch (e) {
      console.error(e);
      setError('Hayvan sorgulama sırasında hata oluştu.');
    }
  };

  const handleSelectExistingAnimal = (result) => {
    // When user selects an existing animal, lock the form fields and set selection
    const owner = result.owner || null;
    const animal = result.animal || null;
    if (owner) setSelectedOwner(owner);
    if (animal) {
      setSelectedAnimal(animal.id || animal.animal_id || animal.animalidentnumber || animal.id);
      setNewAnimal(prev => ({ ...prev, animalname: animal.animal_name || animal.animalname || '', animalidentity: animal.animalidentnumber || '', species: prev.species || '' }));
    }
    setExistingAnimalSelected(result);
    setShowAnimalForm(true);
  };

  const handleTcChange = async (e) => {
    const tc = e.target.value;
    setNewPatient(prev => ({ ...prev, tc }));

    if (searchByAnimalId && tc.length === 11) {
      const data = await fetchPatientByTC(tc);
      if (data) {
        setNewPatient({
          tc: data.identity,
          name: data.name,
          surname: data.surname,
          phone: data.phone,
          email: data.email
        });
        setPatientAutoFilled(true); // otomatik doldurma var
      } else {
        setPatientAutoFilled(false);
      }
    } else {
      setPatientAutoFilled(false);
    }
  };

  return (
    <div style={{ padding: 0, borderRadius: 16, background: '#fff', overflow: 'hidden' }}>
      {/* Header Section */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '32px 24px', borderRadius: '16px 16px 0 0', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
              🐾 Hasta<br />Yönetimi
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Hızlı arama ve kayıt sistemi</div>
          </div>
          
          {/* Toggle Switch - Combined */}
          <div 
            onClick={() => {
              setSearchByAnimalId(!searchByAnimalId);
              setError('');
              setPersonelData(null);
              setOwnersList([]);
              setSelectedOwner(null);
              setSelectedAnimal(null);
              setSelected(false);
              setInputValue('');
              setShowPatientForm(false);
              setShowAnimalForm(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.25)', padding: '8px', borderRadius: 50, cursor: 'pointer', transition: 'all 200ms ease', backdropFilter: 'blur(10px)' }}>
            <div style={{ padding: '6px 16px', borderRadius: 50, background: !searchByAnimalId ? '#fff' : 'transparent', color: !searchByAnimalId ? '#667eea' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 12, transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🆔</span> TC
            </div>
            <div style={{ padding: '6px 16px', borderRadius: 50, background: searchByAnimalId ? '#fff' : 'transparent', color: searchByAnimalId ? '#667eea' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 12, transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🐾</span> Hayvan ID
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={{ padding: '24px 24px', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8 }}>
              {searchByAnimalId ? '🐾 Hayvan ID Numarası' : '🆔 TC Kimlik No'}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={searchByAnimalId ? 'Hayvan ID giriniz...' : 'TC kimlik numarasını girin...'}
              maxLength={searchByAnimalId ? undefined : 11}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 14, outline: 'none', background: '#f8f9fc', transition: 'all 200ms ease' }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e6e9f2'}
            />
          </div>

          <button 
            onClick={handleSearch} 
            style={{ padding: '12px 24px', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: '12px 32px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 200ms ease', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔍 Ara
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '12px 24px', background: '#fee', borderLeft: '4px solid #ef4444', color: '#991b1b', fontSize: 13, fontWeight: 500 }}>{error}</div>}

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, padding: 0 }}>
        {/* Left Panel */}
        <div style={{ padding: '24px 24px', minHeight: '400px', minWidth: 0, maxHeight: '62vh', overflowY: 'auto', boxSizing: 'border-box' }}>
          {!personelData && !ownersList.length && !selectedOwner && !showPatientForm && !showAnimalForm && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {searchByAnimalId ? 'Hayvan ID ile arama yapın' : 'TC Kimlik No ile arama yapın'}
              </div>
              <div style={{ fontSize: 12, marginTop: 8, color: '#9ca3af' }}>
                Yukarıdaki arama alanını kullanarak başlayın
              </div>
            </div>
          )}

          {/* Hasta Bilgileri (TC ile arama için) */}
          {personelData && !searchByAnimalId && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>👤</span> Hasta Bilgileri
              </div>
              
              <div style={{ borderRadius: 12, border: '1px solid #e6e9f2', padding: 16, background: '#fff', marginBottom: 16, wordBreak: 'break-word', whiteSpace: 'normal' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
                    {(personelData.name || '')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{personelData.name} {personelData.surname}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <span>📱 {personelData.phone}</span>
                      <span>📧 {personelData.email}</span>
                    </div>
                  </div>
                </div>

                {personelData.sex && <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 12, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: '#4b5563' }}>Cinsiyet:</span> {personelData.sex}
                </div>}
                {personelData.birthdate && <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: '#4b5563' }}>Doğum Tarihi:</span> {personelData.birthdate}
                </div>}
              </div>
            </div>
          )}

          {/* Owners list */}
          {ownersList.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🐾</span> Bulunan Hayvanlar
              </div>
              
              <select 
                onChange={handleSelectOwner} 
                value={selectedOwner?.data_id || ''} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, marginBottom: 14, outline: 'none', cursor: 'pointer', background: '#f8f9fc', maxWidth: '100%', boxSizing: 'border-box' }}>
                <option value="">-- Hayvan Seçin --</option>
                {ownersList.map(o => (
                  <option key={o.data_id} value={o.data_id}>👤 {o.user_name} - 🐾 {o.animal_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Seçilen Sahip Bilgileri */}
          {selectedOwner && (
            <div style={{ borderRadius: 12, border: '1px solid #e6e9f2', padding: 16, background: '#fff', wordBreak: 'break-word', whiteSpace: 'normal' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
                  {(selectedOwner.user_name || '')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedOwner.user_name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>🐾 {selectedOwner.animal_name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>📊 {selectedOwner.species_name}</div>
                </div>
              </div>

              {selectedOwner.birthdate && <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 12, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#4b5563' }}>Doğum:</span> {selectedOwner.birthdate}
              </div>}
              {selectedOwner.animalidentnumber && <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 8, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: '#4b5563' }}>Kimlik No:</span> {selectedOwner.animalidentnumber}
              </div>}
            </div>
          )}

          {/* Yeni Hasta Formu */}
          {showPatientForm && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>➕</span> Yeni Hasta Kaydı
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <input 
                  placeholder="TC Kimlik No" 
                  value={newPatient.tc} 
                  onChange={handleTcChange} 
                  readOnly={!searchByAnimalId}
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                />
                <input 
                  placeholder="Ad" 
                  value={newPatient.name} 
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} 
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                />
                <input 
                  placeholder="Soyad" 
                  value={newPatient.surname} 
                  onChange={e => setNewPatient({ ...newPatient, surname: e.target.value })} 
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                />
                <input 
                  placeholder="Telefon" 
                  value={newPatient.phone} 
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} 
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                />
                <input 
                  placeholder="Email" 
                  value={newPatient.email} 
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} 
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                />
              </div>
            </div>
          )}

          {/* Yeni Hayvan Formu */}
          {showAnimalForm && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🐾</span> Yeni Hayvan Kaydı
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {/* Animal ID field FIRST - required and with real-time search */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>🔑 Hayvan Kimlik Numarası *</label>
                  <input 
                    placeholder="Hayvan kimlik numarasını giriniz" 
                    value={newAnimal.animalidentity} 
                    onChange={async (e) => {
                      const id = e.target.value;
                      setNewAnimal({ ...newAnimal, animalidentity: id });
                      
                      // Real-time search as user types
                      if (id.trim()) {
                        try {
                          const res = await axiosInstance.get('/getanimalsearch', { params: { tc: id, IsAnimalId: 1 } });
                          const owners = res.data.data || [];
                          const animal = res.data.animal || null;
                          
                          // If single match, auto-populate and lock
                          if (owners.length === 1 && !animal) {
                            const owner = owners[0];
                            const animalId = owner.animal_id || owner.id || '';
                            const speciesName = owner.species_name || owner.species || '';
                            
                            // Fetch species list to get the correct species ID
                            if (animalId) {
                              try {
                                const speciesRes = await axiosInstance.get('/animalsspecies', { params: { animal_id: animalId } });
                                const speciesList = speciesRes.data.response || [];
                                const matchedSpecies = speciesList.find(s => s.species_name === speciesName);
                                const speciesId = matchedSpecies ? matchedSpecies.id : '';
                                
                                setNewAnimal(prev => ({ 
                                  ...prev, 
                                  animalidentity: id,
                                  animalname: owner.animal_name || owner.animalname || '',
                                  animal_name: animalId,
                                  species: speciesId
                                }));
                                setSelectedAnimal(animalId);
                                if (speciesList.length > 0) {
                                  setanimalsspecies(speciesList);
                                }
                              } catch (e) {
                                console.error('Species fetch error:', e);
                                setNewAnimal(prev => ({ 
                                  ...prev, 
                                  animalidentity: id,
                                  animalname: owner.animal_name || owner.animalname || '',
                                  animal_name: animalId,
                                  species: ''
                                }));
                                setSelectedAnimal(animalId);
                              }
                            }
                            setExistingAnimalSelected({ owners: [owner], animal: owner });
                          } else if (animal) {
                            const animalId = animal.animal_id || animal.id || '';
                            const speciesName = animal.species_name || animal.species || '';
                            
                            // Fetch species list to get the correct species ID
                            if (animalId) {
                              try {
                                const speciesRes = await axiosInstance.get('/animalsspecies', { params: { animal_id: animalId } });
                                const speciesList = speciesRes.data.response || [];
                                const matchedSpecies = speciesList.find(s => s.species_name === speciesName);
                                const speciesId = matchedSpecies ? matchedSpecies.id : '';
                                
                                setNewAnimal(prev => ({
                                  ...prev,
                                  animalidentity: id,
                                  animalname: animal.animal_name || animal.animalname || '',
                                  animal_name: animalId,
                                  species: speciesId
                                }));
                                setSelectedAnimal(animalId);
                                if (speciesList.length > 0) {
                                  setanimalsspecies(speciesList);
                                }
                              } catch (e) {
                                console.error('Species fetch error:', e);
                                setNewAnimal(prev => ({
                                  ...prev,
                                  animalidentity: id,
                                  animalname: animal.animal_name || animal.animalname || '',
                                  animal_name: animalId,
                                  species: ''
                                }));
                                setSelectedAnimal(animalId);
                              }
                            }
                            setExistingAnimalSelected({ owners: [], animal });
                          } else if (owners.length > 1) {
                            // Auto-select first owner without showing results list
                            const firstOwner = owners[0];
                            const animalId = firstOwner.animal_id || firstOwner.id || '';
                            const speciesName = firstOwner.species_name || firstOwner.species || '';
                            
                            // Fetch species list to get the correct species ID
                            if (animalId) {
                              try {
                                const speciesRes = await axiosInstance.get('/animalsspecies', { params: { animal_id: animalId } });
                                const speciesList = speciesRes.data.response || [];
                                const matchedSpecies = speciesList.find(s => s.species_name === speciesName);
                                const speciesId = matchedSpecies ? matchedSpecies.id : '';
                                
                                setNewAnimal(prev => ({ 
                                  ...prev, 
                                  animalidentity: id,
                                  animalname: firstOwner.animal_name || firstOwner.animalname || '',
                                  animal_name: animalId,
                                  species: speciesId
                                }));
                                setSelectedAnimal(animalId);
                                if (speciesList.length > 0) {
                                  setanimalsspecies(speciesList);
                                }
                              } catch (e) {
                                console.error('Species fetch error:', e);
                                setNewAnimal(prev => ({ 
                                  ...prev, 
                                  animalidentity: id,
                                  animalname: firstOwner.animal_name || firstOwner.animalname || '',
                                  animal_name: animalId,
                                  species: ''
                                }));
                                setSelectedAnimal(animalId);
                              }
                            }
                            // store all owners and keep the first as representative for animal info
                            setExistingAnimalSelected({ owners: owners, animal: firstOwner });
                            setAnimalFormResults([]);
                          } else {
                            // Eşleşme bulunamazsa alanları temizle
                            setNewAnimal(prev => ({ 
                              ...prev, 
                              animalidentity: id,
                              animalname: '',
                              animal_name: '',
                              species: ''
                            }));
                            setExistingAnimalSelected(null);
                            setAnimalFormResults([]);
                          }
                        } catch (e) {
                          console.error(e);
                          setNewAnimal(prev => ({ 
                            ...prev, 
                            animalidentity: id,
                            animalname: '',
                            animal_name: '',
                            species: ''
                          }));
                          setExistingAnimalSelected(null);
                          setAnimalFormResults([]);
                        }
                      } else {
                        // Boş ise her şeyi temizle
                        setNewAnimal(prev => ({ 
                          ...prev, 
                          animalidentity: '',
                          animalname: '',
                          animal_name: '',
                          species: ''
                        }));
                        setExistingAnimalSelected(null);
                        setAnimalFormResults([]);
                      }
                    }} 
                    style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc', width: '100%', boxSizing: 'border-box' }} 
                  />
                </div>



                {/* Auto-populated locked fields when match found */}
                {existingAnimalSelected && (
                  <>
                    <div style={{ padding: 12, borderRadius: 10, border: '1px solid #10b981', background: '#ecfdf5' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#065f46', marginBottom: 8 }}>✓ Hayvan Bulundu</div>
                      <div style={{ fontSize: 12, color: '#047857' }}>
                        {existingAnimalSelected.owners && existingAnimalSelected.owners.length > 0
                          ? existingAnimalSelected.owners.map(o => o.user_name).join(', ')
                          : (existingAnimalSelected.animal?.animal_name || '')
                        }
                      </div>
                    </div>

                    <input 
                      placeholder="Hayvan Adı" 
                      value={newAnimal.animalname} 
                      readOnly
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f3f4f6' }} 
                    />
                    <Input
                      type="select"
                      value={newAnimal.animal_name}
                      disabled
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f3f4f6', opacity: 0.6 }}
                    >
                      <option value="">Tür Seçin</option>
                      {animals.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.name}
                        </option>
                      ))}
                    </Input>

                    <Input
                      type="select"
                      value={newAnimal.species}
                      disabled
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f3f4f6', opacity: 0.6 }}
                    >
                      <option value="">Cins Seçin</option>
                      {animalsspecies.map((animalspec) => (
                        <option key={animalspec.id} value={animalspec.id}>
                          {animalspec.species_name}
                        </option>
                      ))}
                    </Input>

                    <button 
                      onClick={() => { setExistingAnimalSelected(null); setNewAnimal({ animal_name: '', name: '', species: '', animalidentity: '' }); }} 
                      style={{ padding: '10px 14px', background: '#ef4444', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                      Başka Hayvan Ara
                    </button>
                  </>
                )}

                {/* If no match or user hasn't searched, show editable fields */}
                {!existingAnimalSelected && newAnimal.animalidentity && (
                  <>
                    <input 
                      placeholder="Hayvan Adı" 
                      value={newAnimal.animalname} 
                      onChange={e => setNewAnimal({ ...newAnimal, animalname: e.target.value })} 
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }} 
                    />
                    <Input
                      type="select"
                      value={newAnimal.animal_name}
                      onChange={handleanimalchange}
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc' }}
                    >
                      <option value="">Tür Seçin</option>
                      {animals.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.name}
                        </option>
                      ))}
                    </Input>

                    <Input
                      type="select"
                      value={newAnimal.species}
                      onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}
                      disabled={!selectedAnimal}
                      style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e6e9f2', fontSize: 13, outline: 'none', background: '#f8f9fc', opacity: !selectedAnimal ? 0.6 : 1, cursor: !selectedAnimal ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="">Cins Seçin</option>
                      {animalsspecies.map((animalspec) => (
                        <option key={animalspec.id} value={animalspec.id}>
                          {animalspec.species_name}
                        </option>
                      ))}
                    </Input>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Panel (stacked below content) */}
        <div style={{ padding: '18px 24px', background: '#f8f9fc', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', borderTop: '1px solid #e6e9f2' }}>
          {personelData && !searchByAnimalId && !showAnimalForm && (
            <>
              <button 
                onClick={handleAddAnimalClick} 
                style={{ width: '100%', padding: '12px 16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 200ms ease' }}
              >
                ➕ Hayvan Ekle
              </button>
              <button 
                onClick={goToIdentity} 
                style={{ width: '100%', padding: '12px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                🆔 Kimliğe Git
              </button>
            </>
          )}

          {showPatientForm && (
            <>
              <button
                disabled={(searchByAnimalId && patientAutoFilled)}
                onClick={handleSave}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: (searchByAnimalId && patientAutoFilled) ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  background: (searchByAnimalId && patientAutoFilled) ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  borderRadius: 10,
                  border: 'none',
                  cursor: (searchByAnimalId && patientAutoFilled) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                ✓ Kaydet
              </button>
              {!searchByAnimalId && (
                <button
                  onClick={handleAddAnimalClick}
                  style={{ width: '100%', padding: '12px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  🐾 Hayvan Ekle
                </button>
              )}
            </>
          )}

          {showAnimalForm && (
            <button
              disabled={(searchByAnimalId && patientAutoFilled) || !isAnimalFormValid}
              onClick={handleSaveAnimal}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: ((searchByAnimalId && patientAutoFilled) || !isAnimalFormValid) ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: ((searchByAnimalId && patientAutoFilled) || !isAnimalFormValid) ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: 10,
                border: 'none',
                cursor: ((searchByAnimalId && patientAutoFilled) || !isAnimalFormValid) ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              ✓ Hayvan Kaydet
            </button>
          )}

          {(selectedOwner || (showAnimalForm && selectedOwner)) && (
            <>
              <button 
                onClick={goToIdentity} 
                style={{ width: '100%', padding: '12px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                🆔 Kimliğe Git
              </button>
            </>
          )}

          {(selectedOwner || personelData || showAnimalForm) && (
            <button 
              onClick={() => {
                setPersonelData(null);
                setOwnersList([]);
                setSelectedOwner(null);
                setSelectedAnimal(null);
                setSelected(false);
                setInputValue('');
                setShowPatientForm(false);
                setShowAnimalForm(false);
                setNewPatient({ tc: '', name: '', surname: '', phone: '', email: '' });
                setNewAnimal({ animal_name: '', name: '', species: '', animalidentity: '' });
                setError('');
              }}
              style={{ width: '100%', padding: '12px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              🔄 Temizle
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default PatientReg;
