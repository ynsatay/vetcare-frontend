import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from "reactstrap";
import defaultAvatar from '../../assets/images/users/user5.jpg';
import Animals from '../popup/Animals.js';
import { AuthContext } from '../../context/usercontext.tsx';
import MainModal from '../../components/MainModal.js';
import '../scss/_login.scss';
import axiosInstance from '../../api/axiosInstance.ts';

const Animalslist = () => {
  const [animalslist, setAnimalslist] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);

  const [animals, setAnimals] = useState([]);
  const [animalsspecies, setAnimalsspecies] = useState([]);
  const [selectedanimalid, setSelectedanimalid] = useState(null);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnimalIndex, setSelectedAnimalIndex] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { userid } = useContext(AuthContext);

  const animalFormRef = useRef(null);

  // Edit fields
  const [editedAnimal, setEditedAnimal] = useState({
    id: 0,
    name: '',
    species_id: '',
    animal_id: '',
    active: true,
    isdeath: false,
    birthdate: '',
    deathdate: '',
    animalidentnumber: '',
    animalname: '',
  });
  
  const fetchAnimalsList = useCallback(async () => {
    try {
      const animalsListResponse = await axiosInstance.get('/animalslist', {
        params: { user_id: userid }
      });
      setAnimalslist(animalsListResponse.data.response);
    } catch (error) {
      console.log(error);
    }
  }, [userid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const animalsResponse = await axiosInstance.get('/animals');
        setAnimals(animalsResponse.data.response);
        return true;
      } catch (error) {
        setError(error);
        return false;
      } finally {
        setLoading(false);
      }
    };

    const loadAll = async () => {
      const success = await fetchData();
      if (success) {
        await fetchAnimalsList();
      }
    };

    loadAll();
  }, [fetchAnimalsList]);

  const toggleModal = (index) => {
    setSelectedAnimalIndex(index);
    setModalOpen(prevState => !prevState);

    if (index !== null) {
      const animal = animalslist[index];
      const formattedBirthdate = animal.birthdate ? formatDate(animal.birthdate) : '';
      const formattedDeathdate = animal.deathdate ? formatDate(animal.deathdate) : '';
      setSelectedanimalid(animal.id);
      setEditedAnimal({
        id: animal.id,
        animal_id: animal.animal_id,
        name: animal.animal_name,
        species_id: animal.species_id,
        active: animal.active,
        isdeath: animal.isdeath,
        birthdate: formattedBirthdate,
        deathdate: formattedDeathdate,
        animalidentnumber: animal.animalidentnumber || '',
        animalname: animal.animalname
      });
      fetchAnimalSpecies(animal.animal_id);
    }
  };

  const toggleModaldel = async (index) => {
    try {
      const animalIdToDelete = animalslist[index].id;;
      console.log(`Animal ID to delete: ${animalIdToDelete}`);
      await axiosInstance.delete(`/animalslistDel/${animalIdToDelete}`);

      fetchAnimalsList();
    } catch (error) {
      console.error('Hayvan silme hatası:', error);
    }
  };

  const AddAnimal = () => {
    setIsAddModalOpen(true);
  };

  const fetchAnimalSpecies = async (animal_id) => {
    if (!animal_id) {
      setAnimalsspecies([]);
      return;
    }
    try {
      const response = await axiosInstance.get('/animalsspecies', {
        params: { animal_id }
      });
      setAnimalsspecies(response.data.response);
    } catch (error) {
      console.error('API error:', error);
    }
  };

  const handleAnimalChange = (e) => {
    const animalIndex = e.target.value;
    setSelectedAnimalIndex(animalIndex);
    const animal = animals[animalIndex];
    const animalId = animal.id;
    setEditedAnimal(prevState => ({
      ...prevState,
      animal_id: animalId
    }));
    fetchAnimalSpecies(animalId);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedAnimal = {
        animal_species_id: editedAnimal.species_id,
        animal_id: editedAnimal.animal_id,
        birthdate: editedAnimal.birthdate,
        deathdate: editedAnimal.deathdate,
        animalidentnumber: editedAnimal.animalidentnumber,
        picture: editedAnimal.picture,
        isdeath: editedAnimal.isdeath,
        active: editedAnimal.active,
        animalname: editedAnimal.animalname
      };

      const response = await axiosInstance.put(`/animalslistUpdate/${selectedanimalid}`, updatedAnimal);

      if (response.status === 200) {
        console.log('Update successful:', response.data);
        toggleModal(selectedAnimalIndex); // Modal kapat
        fetchAnimalsList();
      } else {

        console.error('Unexpected response:', response);
      }
    } catch (error) {
      if (error.response) {
        // Sunucu yanıtı ile ilgili hata
        console.error('Error saving changes:', error.response.data);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('Error saving changes:', error.request);
      } else {
        // Diğer hatalar
        console.error('Error saving changes:', error.message);
      }
    }
    fetchAnimalsList();
  };

  const handleAddAnimalClose = () => {
    setIsAddModalOpen(false);
    setModalOpen(false);
    fetchAnimalsList();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    return formattedDate;
  };

  const handleSave = async () => {
    await animalFormRef.current.handleSave();
  };

  return (
    <div>
      <Card>
        <CardBody>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <CardTitle tag="h5">Hayvan Listesi</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Kayıtlı Hayvanlarınız
              </CardSubtitle>
            </div>
            <div>
              <Button color="primary" size="large" className="login" onClick={() => AddAnimal(null)}>
                Hayvan Ekle
              </Button>
            </div>
          </div>
          <Table className="no-wrap mt-3 align-middle" responsive borderless>
            <thead>
              <tr>
                <th>Resim</th>
                <th>Kullanıcı Adı</th>
                <th>Hayvan Türü</th>
                <th>Hayvan Cinsi</th>
                <th>Hayvan Adı</th>
                <th>Aktif</th>
                <th>Ölümü</th>
                <th>Doğum Tarihi</th>
                <th>Ölüm Tarihi</th>
                <th>Hayvan Kimlik Numarası</th>
                <th>Güncelle</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {animalslist.map((animal, index) => (
                <tr key={index} className="border-top">
                  <td>
                    <div className="d-flex align-items-center p-2">
                      <img
                        src={animal.picture || defaultAvatar}
                        className="rounded-circle"
                        alt="avatar"
                        width="45"
                        height="45"
                      />
                    </div>
                  </td>
                  <td>{animal.user_name}</td>
                  <td>{animal.animal_name}</td>
                  <td>{animal.species_name}</td>
                  <td>{animal.animalname}</td>
                  <td>
                    {animal.active ? (
                      <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                    ) : (
                      <span className="p-2 bg-secondary rounded-circle d-inline-block ms-3"></span>
                    )}
                  </td>
                  <td>
                    {animal.isdeath ? (
                      <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                    ) : (
                      <span className="p-2 bg-secondary rounded-circle d-inline-block ms-3"></span>
                    )}
                  </td>
                  <td>{animal.birthdate !== '0000-00-00' ? animal.birthdate : ""}</td>
                  <td>{animal.deathdate !== '0000-00-00' ? animal.deathdate : ""}</td>
                  <td>{animal.animalidentnumber}</td>
                  <td>
                    <Button color="primary" size="sm" onClick={() => toggleModal(index)}>
                      Değiştir
                    </Button>
                  </td>
                  <td>
                    <Button color="secondary" size="sm" onClick={() => toggleModaldel(index)}>
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} toggle={() => toggleModal(null)}>
        <ModalHeader toggle={() => toggleModal(selectedAnimalIndex)}>Hayvan Güncelle</ModalHeader>
        <ModalBody>
          {selectedAnimalIndex !== null && (
            <div>
              <FormGroup>
                <Label for="animalName">Hayvan Adı</Label>
                <Input
                  type="select"
                  id="animalName"
                  value={animals.findIndex(animal => animal.id === parseInt(editedAnimal.animal_id))}
                  onChange={(e) => {
                    handleAnimalChange(e);
                    var animalId = parseInt(e.target.value, 10) + 1;
                    setEditedAnimal({
                      ...editedAnimal, animal_id: animalId.toString()
                    });
                  }}
                >
                  <option value=""></option>
                  {animals.map((animal, index) => (
                    <option key={index} value={index}>
                      {animal.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="speciesName">Hayvan Türü</Label>
                <Input
                  type="select"
                  id="speciesName"
                  value={editedAnimal.species_id}
                  onChange={(e) => setEditedAnimal({ ...editedAnimal, species_id: e.target.value })}
                >
                  <option value=''></option>
                  {animalsspecies.map((animalspec) => (
                    <option key={animalspec.id} value={animalspec.id}>
                      {animalspec.species_name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={editedAnimal.active}
                    onChange={(e) => setEditedAnimal({ ...editedAnimal, active: e.target.checked })}
                  />{' '}
                  Aktif
                </Label>
              </FormGroup>
              <FormGroup>
                <Label for="animalIdentNumber">Hayvan Adı</Label>
                <Input
                  type="text"
                  id="animalname"
                  value={editedAnimal.animalname}
                  onChange={(e) => setEditedAnimal({ ...editedAnimal, animalname: e.target.value })}
                />
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={editedAnimal.isdeath}
                    onChange={(e) => setEditedAnimal({ ...editedAnimal, isdeath: e.target.checked })}
                  />{' '}
                  Ölü
                </Label>
              </FormGroup>
              <FormGroup>
                <Label for="birthdate">Doğum Tarihi</Label>
                <Input
                  type="date"
                  id="birthdate"
                  value={editedAnimal.birthdate}
                  onChange={(e) => setEditedAnimal({ ...editedAnimal, birthdate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="deathdate">Ölüm Tarihi</Label>
                <Input
                  type="date"
                  id="deathdate"
                  value={editedAnimal.deathdate}
                  onChange={(e) => setEditedAnimal({ ...editedAnimal, deathdate: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="animalIdentNumber">Hayvan Kimlik Numarası</Label>
                <Input
                  type="text"
                  id="animalIdentNumber"
                  value={editedAnimal.animalidentnumber}
                  disabled // Bu satır alanı devre dışı bırakır
                />
              </FormGroup>

            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveChanges}>
            Kaydet
          </Button>{' '}
          <Button color="secondary" onClick={handleAddAnimalClose}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      <MainModal isOpen={isAddModalOpen} toggle={handleAddAnimalClose} title="Hayvan Ekle" content={<Animals onClose={handleAddAnimalClose} />} onSave={handleSave} saveButtonLabel="Ekle" />
    </div>
  );
};

export default Animalslist;
