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
          setShowAnimalForm(true);
        }
      } else {
        if (owners.length === 1) setSelectedOwner(owners[0]);
        else if (owners.length > 1) setOwnersList(owners);

        if (animal) setSelectedAnimal(animal);

        setShowAnimalForm(true);
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

    navigate(`/IdentityInfo/${data?.user_id || data?.id || fallback.id}`, {
      state: {
        userId: data?.user_id || data?.id || fallback.id,
        identity: data?.animalidentnumber || data?.identity || fallback.identity
      }
    });
  };

  const handleAddAnimalClick = () => {
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
    <div style={{   padding: 20, borderRadius: 12 }}>
      <h3 style={{ color: '#6A1B9A'}}>Hasta Kayıt Formu</h3>

      <label style={{ fontWeight: 500 }}>
        <input
          type="checkbox"
          checked={searchByAnimalId}
          onChange={() => {
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
        /> Hayvan ID ile ara
      </label>

      <div style={{ marginTop: 15 }}>
        <label>{searchByAnimalId ? 'Hayvan ID Numarası:' : 'TC Kimlik No:'}</label>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          maxLength={searchByAnimalId ? undefined : 11}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginTop: 15, textAlign: 'center' }}>
        <button onClick={handleSearch} style={{ width: '80%', backgroundColor: '#6A1B9A', color: '#fff', padding: 10, borderRadius: 8 }}>
          Ara
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

      {/* Hasta Bilgileri (TC ile arama için) */}
      {personelData && !searchByAnimalId && (
        <div style={{ marginTop: 20 }}>
          <h4>Hasta Bilgileri</h4>
          <table style={{ width: '100%' }}>
            <tbody>
              {[
                ['Ad', personelData.name],
                ['Soyad', personelData.surname],
                ['Telefon', personelData.phone],
                ['Email', personelData.email],
                ['Cinsiyet', personelData.sex],
                ['Doğum Tarihi', personelData.birthdate],
                ['Rol', personelData.role],
                ['Adres', personelData.address]
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{label}:</td>
                  <td style={{ padding: 8 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 15, textAlign: 'right' }}>
            <button onClick={handleAddAnimalClick} style={{ backgroundColor: '#1976d2', color: '#fff', padding: 10, borderRadius: 8 }}>
              Hayvan Ekle
            </button>
          </div>
        </div>
      )}

      {/* Sahip Seçimi */}
      {ownersList.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <h4>Birden Fazla Sahip Bulundu</h4>
          <select onChange={handleSelectOwner} value={selectedOwner?.data_id || ''} style={{ width: '100%', padding: 8 }}>
            <option value="">Seçiniz</option>
            {ownersList.map(owner => (
              <option key={owner.data_id} value={owner.data_id}>
                {owner.user_name} - {owner.animal_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Seçilen Sahip Bilgileri */}
      {selectedOwner && (
        <div style={{ marginTop: 20 }}>
          <h4>Seçilen Sahip Bilgileri</h4>
          <table style={{ width: '100%' }}>
            <tbody>
              {[
                ['Sahip Adı', selectedOwner.user_name],
                ['Hayvan', selectedOwner.animal_name],
                ['Tür', selectedOwner.species_name],
                ['Doğum Tarihi', selectedOwner.birthdate],
                ['Tanımlama No', selectedOwner.animalidentnumber]
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{label}:</td>
                  <td style={{ padding: 8 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni Hasta Formu */}
      {(showPatientForm || (showAnimalForm && !personelData && !selectedOwner)) && (
        <div style={{ marginTop: 30 }}>
          <h4>Yeni Hasta Kaydı</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input placeholder="TC Kimlik No" value={newPatient.tc} onChange={handleTcChange} readOnly={!searchByAnimalId} style={{ padding: 8 }} />
            <input placeholder="Ad" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} style={{ padding: 8 }} />
            <input placeholder="Soyad" value={newPatient.surname} onChange={e => setNewPatient({ ...newPatient, surname: e.target.value })} style={{ padding: 8 }} />
            <input placeholder="Telefon" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} style={{ padding: 8 }} />
            <input placeholder="Mail" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} style={{ padding: 8 }} />
          </div>
          <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between' }}>
            <button
              disabled={searchByAnimalId && patientAutoFilled}
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                backgroundColor: searchByAnimalId && patientAutoFilled ? '#888' : 'green',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                cursor: searchByAnimalId && patientAutoFilled ? 'not-allowed' : 'pointer',
              }}
            >
              Kaydet
            </button>
            {!searchByAnimalId && (
              <button
                onClick={handleAddAnimalClick}
                style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff', borderRadius: 8, border: 'none' }}
              >
                Hayvan Ekle
              </button>
            )}
          </div>
        </div>
      )}

      {/* Yeni Hayvan Formu */}
      {showAnimalForm && (
        <div style={{ marginTop: 30 }}>
          <h4>Yeni Hayvan Kaydı</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input placeholder="Hayvan Adı" value={newAnimal.animalname} onChange={e => setNewAnimal({ ...newAnimal, animalname: e.target.value })} style={{ padding: 8 }} />
            {/* Tür Seçimi */}
            <Input
              type="select"
              value={newAnimal.animal_name}
              onChange={handleanimalchange}
              className="ani-form-select"
            >
              <option value="">Tür Seçin</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name}
                </option>
              ))}
            </Input>

            {/* Cins Seçimi */}
            <Input
              type="select"
              value={newAnimal.species}
              onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}
              disabled={!selectedAnimal}
              className="ani-form-select"
            >
              <option value="">Cins Seçin</option>
              {animalsspecies.map((animalspec) => (
                <option key={animalspec.id} value={animalspec.id}>
                  {animalspec.species_name}
                </option>
              ))}
            </Input>
            <input placeholder="Hayvan Kimlik Numarası" value={newAnimal.animalidentity} onChange={e => setNewAnimal({ ...newAnimal, animalidentity: e.target.value })} style={{ padding: 8 }} />
            <button
              disabled={(searchByAnimalId && patientAutoFilled) || !isAnimalFormValid}
              onClick={handleSaveAnimal}
              style={{
                padding: '10px 20px',
                backgroundColor:
                  (searchByAnimalId && patientAutoFilled) || !isAnimalFormValid
                    ? '#888'
                    : 'green',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                cursor:
                  (searchByAnimalId && patientAutoFilled) || !isAnimalFormValid
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Kaydet
            </button>

          </div>
        </div>
      )}

      {/* Kimliğe Git */}
      {((!searchByAnimalId && (personelData || showPatientForm)) || (searchByAnimalId && (selectedOwner || showAnimalForm))) && (
        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <button onClick={goToIdentity} style={{ backgroundColor: '#1976d2', color: '#fff', padding: 12, borderRadius: 8, fontWeight: 'bold' }}>
            Kimliğe Git
          </button>
        </div>
      )}
    </div>
  );
});

export default PatientReg;
