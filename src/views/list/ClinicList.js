import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from "reactstrap";
import MainModal from '../../components/MainModal';
import Clinic from '../popup/Clinic';
import axiosInstance from '../../api/axiosInstance.ts';

const ClinicList = () => {
  const [cliniclist, setcliniclist] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOfficeId, setselectedOfficeId] = useState(null);
  // const [clinicId, setClinicId] = useState('');
  const [selectedOfficeIndex, setselectedOfficeIndex] = useState(null);
  const clinicFormRef = useRef(null);
  const [editOffice, setEditOffice] = useState({
    id: 0,
    clinic_id: 0,
    package_type: '',
    user_id: 0,
    email: '',
    phone: '',
  });

  const fetchClinicList = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/cliniclist');
      const data = response.data;

      if (data.status === 'success') {
        setcliniclist(data.response);
      } else {
        console.log(data.message || 'Bilinmeyen hata');
      }
    } catch (error) {
      console.error('API error:', error);
    }
  }, []);

  const toggleModaldel = async (index) => {
    try {
      const clinicIdToDel = cliniclist[index].id;
      console.log(`Office ID to delete: ${clinicIdToDel}`);
      await axiosInstance.delete(`/cliniclistdel/${clinicIdToDel}`);

      fetchClinicList();
    } catch (error) {
      console.error('Office deletion error:', error);
    }
  };

  const toggleModal = (index) => {
    if (index !== null) {
      const clinic = cliniclist[index];
      setEditOffice({
        id: clinic.id,
        clinic_id: clinic.clinic_id,
        package_type: clinic.package_type,
        user_id: clinic.user_id,
        email: clinic.email,
        phone: clinic.phone,
      });
      setselectedOfficeId(clinic.id);
    }
    setselectedOfficeIndex(index);
    setModalOpen(!modalOpen);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedClinic = {
        id: editOffice.id,
        clinic_id: editOffice.clinic_id,
        package_type: editOffice.package_type,
        user_id: editOffice.user_id,
        email: editOffice.email,
        phone: editOffice.phone,
      };

      const response = await axiosInstance.put(`/cliniclistUpdate/${selectedOfficeId}`, updatedClinic);
      if (response.status === 200) {
        console.log('Update successful:', response.data);
        toggleModal(selectedOfficeIndex); // Modal kapat
        fetchClinicList();
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
  };

  const handleClinicClose = () => {
    setIsAddModalOpen(false);
    fetchClinicList();
  };

  const handleSave = async () => {
    await clinicFormRef.current.handleSave();
  };

  useEffect(() => {
    fetchClinicList();
  }, [fetchClinicList]);
  
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Klinik Listesi</CardTitle>
          <Button color="primary" size="large" className="float-end" onClick={() => setIsAddModalOpen(true)}>
            Ekle
          </Button>
          <CardSubtitle className="mb-2 text-muted" tag="h6">
            Klinik Bilgileri
          </CardSubtitle>

          <Table className="no-wrap mt-3 align-middle" responsive borderless>
            <thead>
              <tr>
                <th>Klinik Adı</th>
                <th>Db Name</th>
                <th>Db Şifre</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Admin</th>
                <th>Değiştir</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {cliniclist.map((clinic, index) => (
                <tr key={index} className="border-top">
                  <td>{clinic.name}</td>
                  <td>{clinic.dbname}</td>
                  <td>{clinic.dbpassword}</td>
                  <td>{clinic.email}</td>
                  <td>{clinic.phone}</td>
                  <td>{clinic.user_name}</td>
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

      <Modal isOpen={modalOpen} toggle={() => toggleModal(null)}>
        <ModalHeader toggle={() => toggleModal(selectedOfficeIndex)}>Ofis Güncelle</ModalHeader>
        <ModalBody>
          {selectedOfficeIndex !== null && (
            <div>
              <FormGroup>
                <Label for="packageType">Klinik Adı</Label>
                <Input
                  type="text"
                  id="name"
                  value={editOffice.package_type}
                  onChange={(e) => setEditOffice({ ...editOffice, package_type: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="packageType">Paket Tipi</Label>
                <Input
                  type="text"
                  id="packageType"
                  value={editOffice.package_type}
                  onChange={(e) => setEditOffice({ ...editOffice, package_type: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="email">E-Mail</Label>
                <Input
                  type="text"
                  id="email"
                  value={editOffice.email}
                  onChange={(e) => setEditOffice({ ...editOffice, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="phone">Telefon</Label>
                <Input
                  type="text"
                  id="phone"
                  value={editOffice.phone}
                  onChange={(e) => setEditOffice({ ...editOffice, phone: e.target.value })}
                />
              </FormGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveChanges}>
            Kaydet
          </Button>{' '}
          <Button color="secondary" onClick={() => toggleModal(selectedOfficeIndex)}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      <MainModal isOpen={isAddModalOpen} toggle={handleClinicClose} title="Şube Ekle"
        content={<Clinic onClose={handleClinicClose} />} onSave={handleSave} saveButtonLabel="Ekle" />

    </div>
  );
};

export default ClinicList;
