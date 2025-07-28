import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import Animals from '../popup/Animals.js';
import { AuthContext } from '../../context/usercontext.tsx';
import MainModal from '../../components/MainModal.js';
import axiosInstance from '../../api/axiosInstance.ts';

const Animalslist = () => {
  const [animalslist, setAnimalslist] = useState([]);
  const [selectedanimalid, setSelectedanimalid] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { userid } = useContext(AuthContext);
  const animalFormRef = useRef(null);

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
      const response = await axiosInstance.get('/animalslist', { params: { user_id: userid } });
      setAnimalslist(response.data.response);
    } catch (error) {
      console.error(error);
    }
  }, [userid]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAnimalsList();
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [fetchAnimalsList]);

  const toggleModal = (index) => {
    const animal = animalslist[index];
    setModalOpen(true);
    setSelectedanimalid(animal.id);
    setEditedAnimal({
      id: animal.id,
      animal_id: animal.animal_id,
      name: animal.animal_name,
      species_id: animal.species_id,
      active: animal.active,
      isdeath: animal.isdeath,
      birthdate: animal.birthdate || '',
      deathdate: animal.deathdate || '',
      animalidentnumber: animal.animalidentnumber || '',
      animalname: animal.animalname
    });
    fetchAnimalSpecies(animal.animal_id);
  };

  const fetchAnimalSpecies = async (animal_id) => {
    try {
      await axiosInstance.get('/animalsspecies', { params: { animal_id } });
      // Burada setAnimalsspecies kullanılmadığı için atlandı
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await axiosInstance.put(`/animalslistUpdate/${selectedanimalid}`, {
        animal_species_id: editedAnimal.species_id,
        animal_id: editedAnimal.animal_id,
        birthdate: editedAnimal.birthdate,
        deathdate: editedAnimal.deathdate,
        animalidentnumber: editedAnimal.animalidentnumber,
        picture: editedAnimal.picture,
        isdeath: editedAnimal.isdeath,
        active: editedAnimal.active,
        animalname: editedAnimal.animalname
      });
      setModalOpen(false);
      fetchAnimalsList();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { field: 'user_name', headerName: 'Kullanıcı Adı', flex: 1, minWidth: 130 },
    { field: 'animal_name', headerName: 'Hayvan Türü', flex: 1, minWidth: 130 },
    { field: 'species_name', headerName: 'Hayvan Cinsi', flex: 1, minWidth: 130 },
    { field: 'animalname', headerName: 'Hayvan Adı', flex: 1, minWidth: 130 },
    {
      field: 'active',
      headerName: 'Aktif',
      width: 70,
      renderCell: (params) => (
        <span className={`p-2 rounded-circle d-inline-block ${params.value ? "bg-success" : "bg-secondary"}`} />
      )
    },
    {
      field: 'isdeath',
      headerName: 'Ölümü',
      width: 70,
      renderCell: (params) => (
        <span className={`p-2 rounded-circle d-inline-block ${params.value ? "bg-danger" : "bg-secondary"}`} />
      )
    },
    { field: 'birthdate', headerName: 'Doğum Tarihi', flex: 1, minWidth: 120 },
    { field: 'deathdate', headerName: 'Ölüm Tarihi', flex: 1, minWidth: 120 },
    { field: 'animalidentnumber', headerName: 'Kimlik No', flex: 1, minWidth: 140 },
    {
      field: 'actions',
      headerName: 'İşlemler',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="d-flex gap-2">
          <Button size="sm" color="primary" onClick={() => toggleModal(params.row.index)}>Değiştir</Button>
          <Button size="sm" color="secondary" onClick={() => handleDelete(params.row.index)}>Sil</Button>
        </div>
      )
    },
  ];

  const handleDelete = async (index) => {
    try {
      const animalIdToDelete = animalslist[index].id;
      await axiosInstance.delete(`/animalslistDel/${animalIdToDelete}`);
      fetchAnimalsList();
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleSave = async () => {
    await animalFormRef.current.handleSave();
  };

  const handleAddAnimalClose = () => {
    setIsAddModalOpen(false);
    setModalOpen(false);
    fetchAnimalsList();
  };

  return (
    <div>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <CardTitle tag="h5">🐾 Hayvan Listesi</CardTitle>
              <CardSubtitle className="mb-2 text-muted">Kayıtlı Hayvanlarınız</CardSubtitle>
            </div>
            <Button color="primary" onClick={() => setIsAddModalOpen(true)}>
              Hayvan Ekle
            </Button>
          </div>

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={animalslist}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.id}
            />
          </div>
        </CardBody>
      </Card>
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>Hayvan Güncelle</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="animalname">Hayvan Adı</Label>
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
                checked={editedAnimal.active}
                onChange={(e) => setEditedAnimal({ ...editedAnimal, active: e.target.checked })}
              />{' '}Aktif
            </Label>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={editedAnimal.isdeath}
                onChange={(e) => setEditedAnimal({ ...editedAnimal, isdeath: e.target.checked })}
              />{' '}Ölü
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
            <Label for="animalidentnumber">Kimlik Numarası</Label>
            <Input
              type="text"
              id="animalidentnumber"
              value={editedAnimal.animalidentnumber}
              disabled
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveChanges}>Kaydet</Button>
          <Button color="secondary" onClick={handleAddAnimalClose}>İptal</Button>
        </ModalFooter>
      </Modal>

      <MainModal
        isOpen={isAddModalOpen}
        toggle={handleAddAnimalClose}
        title="Hayvan Ekle"
        content={<Animals onClose={handleAddAnimalClose} />}
        onSave={handleSave}
        saveButtonLabel="Ekle"
      />
    </div>
  );
};

export default Animalslist;
