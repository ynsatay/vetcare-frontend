import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from "reactstrap";
import Office from '../popup/Offices';
import MainModal from '../../components/MainModal';
import axiosInstance from '../../api/axiosInstance.ts';

const OfficeList = () => {
  const [officelist, setOfficelist] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOfficeId, setselectedOfficeId] = useState(null);
  const [clinicId, setClinicId] = useState('');
  const [selectedOfficeIndex, setselectedOfficeIndex] = useState(null);
  const officeFormRef = useRef(null);
  const [editOffice, setEditOffice] = useState({
    id: 0,
    clinic_id: 0,
    package_type: '',
    user_id: 0,
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchOfficeList();
  }, []);

  const fetchOfficeList = async () => {
    try {
      const response = await axiosInstance.get('/officelist');
      const data = response.data;

      if (data.status === 'success') {

        console.log(data.response);
        setOfficelist(data.response);
      }
    } catch (error) {
      console.error('API error:', error.message);
    }
  };

  const toggleModaldel = async (index) => {
    try {
      const officeIdToDel = officelist[index].id;
      console.log(`Office ID to delete: ${officeIdToDel}`);
      await axiosInstance.delete(`/officelistdel/${officeIdToDel}`);

      fetchOfficeList();
    } catch (error) {
      console.error('Office deletion error:', error);
    }
  };

  const toggleModal = (index) => {
    if (index !== null) {
      const office = officelist[index];
      setEditOffice({
        id: office.id,
        clinic_id: office.clinic_id,
        package_type: office.package_type,
        user_id: office.user_id,
        email: office.email,
        phone: office.phone,
      });
      setselectedOfficeId(office.id);
    }
    setselectedOfficeIndex(index);
    setModalOpen(!modalOpen);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedOffice = {
        id: editOffice.id,
        clinic_id: editOffice.clinic_id,
        package_type: editOffice.package_type,
        user_id: editOffice.user_id,
        email: editOffice.email,
        phone: editOffice.phone,
      };

      const response = await axiosInstance.put(`/officelistUpdate/${selectedOfficeId}`, updatedOffice);
      if (response.status === 200) {
        console.log('Update successful:', response.data);
        toggleModal(selectedOfficeIndex); // Modal kapat
        fetchOfficeList();
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

  const handleOfficeClose = () => {
    setIsAddModalOpen(false);
    fetchOfficeList();
  };

  const handleSave = async () => {
    await officeFormRef.current.handleSave();
  };
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">Ofis Listesi</CardTitle>
          <Button color="primary" size="large" className="float-end" onClick={() => setIsAddModalOpen(true)}>
            Ekle
          </Button>
          <CardSubtitle className="mb-2 text-muted" tag="h6">
            Kliniğe Bağlı Ofisler
          </CardSubtitle>

          <Table className="no-wrap mt-3 align-middle" responsive borderless>
            <thead>
              <tr>
                <th>Klinik Adı</th>
                <th>Paket Tipi</th>
                <th>Admin Adı</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Değiştir</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {officelist.map((office, index) => (
                <tr key={index} className="border-top">
                  <td>{office.clinic_name}</td>
                  <td>{office.package_type}</td>
                  <td>{office.user_name}</td>
                  <td>{office.email}</td>
                  <td>{office.phone}</td>
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
        <ModalHeader toggle={() => toggleModal(selectedOfficeIndex)}>Ofis Güncelle</ModalHeader>
        <ModalBody>
          {selectedOfficeIndex !== null && (
            <div>
              <FormGroup>
                <Label for="clinikName">Klinik Adı</Label>
                <Input
                  type="select"
                  id="clinikName"
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                >
                  <option value="0">Seçiniz</option> {0}
                  <option value="1">klinik</option> {1}
                </Input>
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

      <MainModal isOpen={isAddModalOpen} toggle={handleOfficeClose} title="Şube Ekle"
        content={<Office onClose={handleOfficeClose} />} onSave={handleSave} saveButtonLabel="Ekle" />

    </div>
  );
};

export default OfficeList;
