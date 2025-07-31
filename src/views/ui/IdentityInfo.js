import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col
} from "reactstrap";
import { useLocation } from 'react-router-dom';
import axiosInstance from "../../api/axiosInstance.ts";
import Animals from '../popup/Animals.js';
import MainModal from '../../components/MainModal.js';
import { Grid } from '@mui/material';
import PatientFileReg from '../popup/PatientFileReg.js';
import VisitsAndAppointmentsTabs from '../../components/VisitsAndAppointmentsTabs.js';
import { useConfirm } from '../../components/ConfirmContext';

const IdentityInfo = () => {
  const location = useLocation();
  const { userId, identity, animalId } = location.state || {};

  const [animalsList, setAnimalsList] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [visitList, setVisitList] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOwner, setIsSavingOwner] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPatientFileRegOpen, setIsPatientFileRegOpen] = useState(false);

  const [appointmentList, setAppointmentList] = useState([]);
  const { confirm } = useConfirm();

  // TC Kimlik No doğrulama
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

  const fetchAppointmentList = async (animalId) => {
    try {
      if (!animalId) {
        setAppointmentList([]);
        return;
      }

      const appointmentRes = await axiosInstance.get('/getappointment', { params: { animal_id: animalId } });
      setAppointmentList(appointmentRes.data.data || []);
    } catch (err) {
      console.error('Randevu verisi çekme hatası:', err);
      setAppointmentList([]);
    }
  };
  // Sahip ve hayvan listesini çek
  const fetchData = useCallback(async () => {
    try {
      if (!identity && !userId) {
        setOwnerInfo(null);
        setAnimalsList([]);
        setSelectedAnimal(null);
        return [];
      }

      let user = null;
      if (identity && isValidTC(identity)) {
        const res = await axiosInstance.get('/getpersonelsearch', { params: { tc: identity } });
        user = res.data.user || null;
      } else if (userId) {
        const ownerRes = await axiosInstance.get('/getpersonelsearchuid', { params: { user_id: userId } });
        user = ownerRes.data.user || null;
      }
      setOwnerInfo(user);

      if (!user) {
        setAnimalsList([]);
        setSelectedAnimal(null);
        return [];
      }

      const animalRes = await axiosInstance.get('/animalslist', { params: { user_id: user.id } });
      const animals = animalRes.data.response || [];
      setAnimalsList(animals);

      if (animalId) {
        const match = animals.find(a => a.id?.toString() === animalId?.toString());
        setSelectedAnimal(match || animals[0] || null);
      } else {
        setSelectedAnimal(animals[0] || null);
      }
      return animals;  // burası önemli
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      setOwnerInfo(null);
      setAnimalsList([]);
      setSelectedAnimal(null);
      return [];
    }
  }, [identity, userId, animalId]);

  // Seçilen hayvanın gelişlerini çek
  const fetchVisitList = async (animalId) => {
    try {
      if (!animalId) {
        setVisitList([]);
        return;
      }

      const visitRes = await axiosInstance.get("/arrivals", {
        params: { animalId: animalId }
      });

      if (visitRes.data.status === 'success') {
        setVisitList(visitRes.data.data || []);
      } else {
        setVisitList([]);
        console.warn('Backend geliş verisi yok veya hata:', visitRes.data);
      }
    } catch (err) {
      console.error('Geliş verisi çekme hatası:', err);
      setVisitList([]);
    }
  };
  // Hayvan seçimi değiştiğinde gelişleri çek
  useEffect(() => {
    if (selectedAnimal?.id) {
      fetchVisitList(selectedAnimal.id);
      fetchAppointmentList(selectedAnimal.id);
    } else {
      setVisitList([]);
      setAppointmentList([]);
    }
  }, [selectedAnimal]);

  // Sayfa açıldığında veya identity/userId değiştiğinde veri çek
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal kapatma fonksiyonu
  const handleAddAnimalClose = () => {
    setIsAddModalOpen(false);
  };

  // Yeni hayvan eklendikten sonra listeyi yenile
  const onAddAnimalSave = async (data) => {
    const newIdent = data?.animalidentnumber;
    setIsAddModalOpen(false);

    const animalRes = await axiosInstance.get('/animalslist', {
      params: { user_id: ownerInfo?.id || userId },
    });

    const updatedAnimals = animalRes.data.response || [];
    setAnimalsList(updatedAnimals);

    const added = updatedAnimals.find(
      a => a.animalidentnumber?.toString() === newIdent?.toString()
    );
    console.log("Added animal:", added);
    setSelectedAnimal(added || null);
  };

  // Hayvan seçimi değişimi
  const handleAnimalChange = (e) => {
    const value = e.target.value;

    if (value === '__add__') {
      setIsAddModalOpen(true);
      setSelectedAnimal(null);
    } else {
      const selectedId = Number(value);
      const animal = animalsList.find(a => a.id === selectedId) || null;
      setSelectedAnimal(animal);
    }
  };

  // Hayvan form inputları kontrolü
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSelectedAnimal((prev) => {
      let updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'deathdate') {
        updated.isdeath = value ? true : false;
      }

      return updated;
    });
  };

  // Sahip form inputları kontrolü
  const handleOwnerInputChange = (e) => {
    const { name, value } = e.target;
    setOwnerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hayvan bilgilerini kaydet
  const handleSave = async () => {
    if (!selectedAnimal?.data_id) {
      confirm("Kayıt güncellenemedi: Hayvan seçili değil.", "Tamam", "", "Uyarı");
      return;
    }
    setIsSaving(true);
    try {
      const { data_id, ...payload } = selectedAnimal;
      const response = await axiosInstance.put(`/animalslistUpdate/${data_id}`, payload);
      if (response.status === 200) {
        confirm("Hayvan bilgileri güncellendi.", "Tamam", "", "Uyarı");
      } else {
        confirm("Hayvan bilgileri güncellenemedi.", "Tamam", "", "Uyarı");
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      confirm("Hayvan bilgileri güncellenemedi.", "Tamam", "", "Uyarı");
    } finally {
      setIsSaving(false);
    }
  };

  // Sahip bilgilerini kaydet
  const handleOwnerSave = async () => {
    if (!ownerInfo?.id) {
      confirm("Kayıt güncellenemedi: Sahip bilgisi yok.", "Tamam", "", "Uyarı");
      return;
    }
    setIsSavingOwner(true);
    try {
      // Backend beklentisine göre property mapping yapılabilir
      const { picture, sex, uname, ...rest } = ownerInfo;
      const payload = {
        ...rest,
        sexuality: ownerInfo.sex || '',
        username: ownerInfo.uname || '',
      };

      const response = await axiosInstance.put(`/updatepersonel/${ownerInfo.id}`, payload);
      if (response.status === 200 && response.data.status === 'success') {
        confirm("Sahip bilgileri güncellendi.", "Tamam", "", "Uyarı");
      } else {
        confirm("Sahip bilgileri güncellenemedi.", "Tamam", "", "Uyarı");
      }
    } catch (err) {
      console.error('Sahip güncelleme hatası:', err);
      confirm("Sahip bilgileri güncellenemedi.", "Tamam", "", "Uyarı");
    } finally {
      setIsSavingOwner(false);
    }
  };

  return (
    <div className="p-3">
      <Row style={{ paddingBottom: '20px' }}>
        {/* Sahip Bilgileri */}
        <Col md={6} sm={12} style={{ marginBottom: '20px' }}>
          <Card className="shadow-sm mb-4" style={{ height: '100%' }}>
            <CardBody>
              <CardTitle tag="h5">Sahip Kimlik Bilgileri</CardTitle>
              {ownerInfo ? (
                <>
                  <FormGroup>
                    <Label>Adı</Label>
                    <Input type="text" name="name" value={ownerInfo.name || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Soyadı</Label>
                    <Input type="text" name="surname" value={ownerInfo.surname || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Kullanıcı Adı</Label>
                    <Input type="text" name="uname" value={ownerInfo.uname || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="email" name="email" value={ownerInfo.email || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Telefon</Label>
                    <Input type="text" name="phone" value={ownerInfo.phone || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Adres</Label>
                    <Input type="text" name="address" value={ownerInfo.address || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Doğum Tarihi</Label>
                    <Input type="date" name="birthdate" value={ownerInfo.birthdate || ''} onChange={handleOwnerInputChange} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="sex">Cinsiyet</Label>
                    <Input
                      type="select"
                      name="sex"
                      id="sex"
                      value={ownerInfo.sex || ''}
                      onChange={handleOwnerInputChange}
                    >
                      <option value="">Seçiniz</option>
                      <option value="ERKEK">ERKEK</option>
                      <option value="KADIN">KADIN</option>
                    </Input>
                  </FormGroup>

                  <div className="text-end mt-3">
                    <Button color="primary" onClick={handleOwnerSave} disabled={isSavingOwner}>
                      {isSavingOwner ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                    </Button>
                  </div>
                </>
              ) : (
                <p>Yükleniyor...</p>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Hayvan Bilgileri */}
        <Col md={6} sm={12} style={{ marginBottom: '20px' }}>
          <Card className="shadow-sm mb-4" style={{ height: '100%' }}>
            <CardBody>
              <CardTitle tag="h5">Hayvan Kimlik Bilgileri</CardTitle>
              <FormGroup>
                <Label>Hayvan Seç</Label>
                <Input type="select" value={selectedAnimal?.id || ''} onChange={handleAnimalChange}>
                  <option value="">Seçiniz</option>
                  {animalsList.map((animal) => (
                    <option key={animal.id} value={animal.id}>{animal.animal_name + " - " + animal.animalname}</option>
                  ))}
                  <option value="__add__">➕ Yeni Hayvan Ekle</option>
                </Input>
              </FormGroup>

              <MainModal
                isOpen={isAddModalOpen}
                toggle={handleAddAnimalClose}
                title="Hayvan Ekle"
                content={<Animals ident_user_id={userId} onClose={handleAddAnimalClose} onSave={onAddAnimalSave} />}
                onSave={onAddAnimalSave}
                saveButtonLabel="Ekle"
              />

              {selectedAnimal && (
                <>
                  <FormGroup>
                    <Label>Hayvan Adı</Label>
                    <Input
                      type="text"
                      name="animalname"
                      value={selectedAnimal.animalname || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Türü</Label>
                    <Input
                      type="text"
                      name="animal_name"
                      value={selectedAnimal.animal_name || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Cinsi</Label>
                    <Input
                      type="text"
                      name="species_name"
                      value={selectedAnimal.species_name || ''}
                      disabled
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Doğum Tarihi</Label>
                    <Input
                      type="date"
                      name="birthdate"
                      value={selectedAnimal.birthdate || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Ölüm Tarihi</Label>
                    <Input
                      type="date"
                      name="deathdate"
                      value={selectedAnimal.deathdate || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Kimlik No</Label>
                    <Input
                      type="text"
                      name="animalidentnumber"
                      value={selectedAnimal.animalidentnumber || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="active"
                        checked={!!selectedAnimal.active}
                        onChange={handleInputChange}
                      /> Aktif
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="isdeath"
                        checked={!!selectedAnimal.isdeath}
                        disabled
                        onChange={handleInputChange}
                      /> Ölü (Ölüm Tarihi seçilmelidir.)
                    </Label>
                  </FormGroup>

                  <Grid
                    className="text-end mt-3"
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      color="primary"
                      disabled={selectedAnimal?.isdeath || !selectedAnimal?.active}
                      onClick={() => setIsPatientFileRegOpen(true)}>
                      Yeni Geliş Dosyası Aç
                    </Button>
                    <Button color="primary" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                    </Button>
                  </Grid>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* {visitList.length > 0 && ( */}
      <VisitsAndAppointmentsTabs
        visitList={visitList}
        appointmentList={appointmentList}
      />
      {/* )} */}

      <MainModal
        isOpen={isPatientFileRegOpen}
        toggle={() => setIsPatientFileRegOpen(false)}
        title="Hasta Geliş Dosyası Aç"
        content={
          <PatientFileReg
            pat_id={ownerInfo?.id || 0}
            pat_name={`${ownerInfo?.name || ''} ${ownerInfo?.surname || ''}`.trim()}
            animal_id={selectedAnimal?.id || 0}
            animal_name={selectedAnimal?.animalname || ''}
          />
        }
        saveButtonLabel="Kaydet"
      />
    </div>
  );
};

export default IdentityInfo;
