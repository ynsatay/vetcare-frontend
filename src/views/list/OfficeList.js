import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardBody, CardTitle, CardSubtitle, Button,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input
} from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import Office from '../popup/Offices';
import MainModal from '../../components/MainModal';
import axiosInstance from '../../api/axiosInstance.ts';
import { trTR } from '@mui/x-data-grid/locales';

const OfficeList = () => {
  const [officelist, setOfficelist] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [selectedOfficeIndex, setSelectedOfficeIndex] = useState(null);
  const officeFormRef = useRef(null);
  const [editOffice, setEditOffice] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchOfficeList();
  }, []);

  const fetchOfficeList = async () => {
    try {
      const response = await axiosInstance.get('/officelist');
      if (response.data.status === 'success') {
        const dataWithIds = response.data.response.map((item, idx) => ({
          ...item,
          id: item.id || idx, // MUI DataGrid "id" alanı ister
        }));
        setOfficelist(dataWithIds);
      }
    } catch (error) {
      console.error('API error:', error.message);
    }
  };

  const toggleModal = (index) => {
    if (index !== null) {
      const office = officelist[index];
      setEditOffice({
        name: office.name,
        email: office.email,
        phone: office.phone,
      });
      setSelectedOfficeId(office.id);
    }
    setSelectedOfficeIndex(index);
    setModalOpen(!modalOpen);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedOffice = {
        name: editOffice.name,
        email: editOffice.email,
        phone: editOffice.phone,
      };
      const response = await axiosInstance.put(`/officelistUpdate/${selectedOfficeId}`, updatedOffice);
      if (response.status === 200) {
        toggleModal(selectedOfficeIndex);
        fetchOfficeList();
      }
    } catch (error) {
      console.error('Error saving changes:', error.response?.data || error.message);
    }
  };

  const handleOfficeClose = () => {
    setIsAddModalOpen(false);
    fetchOfficeList();
  };

  const handleSave = async () => {
    await officeFormRef.current?.handleSave();
  };

  const columns = [
    { field: 'name', headerName: 'Şube Adı', flex: 1, minWidth: 150 },
    { field: 'clinic_name', headerName: 'Klinik Adı', flex: 1, minWidth: 150 },
    { field: 'admin_name', headerName: 'Yönetici Adı', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Telefon', flex: 0.7, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Değiştir',
      sortable: false,
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Button color="primary" size="sm" onClick={() => toggleModal(params.api.getRowIndex(params.id))}>
          Değiştir
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle tag="h5">🏛️ Ofis Listesi</CardTitle>
          <CardSubtitle className="mb-2 text-muted" tag="h6">Kliniğe Bağlı Ofisler</CardSubtitle>

          <div style={{ height: 500, width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={officelist}
              columns={columns}
              height={500}
              autoHeight={false}
              disableSelectionOnClick
              localeText={{
                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                footerRowSelected: (count) =>
                  count > 1
                    ? `${count.toLocaleString()} satır seçildi`
                    : `${count.toLocaleString()} satır seçildi`,
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} toggle={() => toggleModal(null)}>
        <ModalHeader toggle={() => toggleModal(selectedOfficeIndex)}>Ofis Güncelle</ModalHeader>
        <ModalBody>
          {selectedOfficeIndex !== null && (
            <>
              <FormGroup>
                <Label for="name">Ofis Adı</Label>
                <Input
                  type="text"
                  id="name"
                  value={editOffice.name || ''}
                  onChange={(e) => setEditOffice({ ...editOffice, name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="email">E-Mail</Label>
                <Input
                  type="text"
                  id="email"
                  value={editOffice.email || ''}
                  onChange={(e) => setEditOffice({ ...editOffice, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label for="phone">Telefon</Label>
                <Input
                  type="text"
                  id="phone"
                  value={editOffice.phone || ''}
                  onChange={(e) => setEditOffice({ ...editOffice, phone: e.target.value })}
                />
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveChanges}>Kaydet</Button>{' '}
          <Button color="secondary" onClick={() => toggleModal(selectedOfficeIndex)}>İptal</Button>
        </ModalFooter>
      </Modal>

      <MainModal
        isOpen={isAddModalOpen}
        toggle={handleOfficeClose}
        title="Şube Ekle"
        content={<Office onClose={handleOfficeClose} />}
        onSave={handleSave}
        saveButtonLabel="Ekle"
      />
    </div>
  );
};

export default OfficeList;
