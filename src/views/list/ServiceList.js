import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import MainModal from '../../components/MainModal.js';
import AddService from '../popup/AddService.js';
import axiosInstance from '../../api/axiosInstance.ts';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';

const categories = [
  { label: "Muayene", value: 1 },
  { label: "Aşılama", value: 2 },
  { label: "Operasyon", value: 3 },
  { label: "Tedavi", value: 4 },
  { label: "Diğer", value: 0 }
];

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { confirm } = useConfirm();

  // Add/Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/getServices');
      if (res.data && res.data.status === 'success' && res.data.data) {
        setServices(res.data.data);
        setFilteredServices(res.data.data);
      } else {
        setServices([]);
        setFilteredServices([]);
      }
    } catch (err) {
      console.error('Hizmet çekme hatası:', err);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
      return;
    }
    const filtered = services.filter(svc =>
      svc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const confirmed = await confirm(
      `"${selectedRow.name}" adlı hizmeti silmek istediğinize emin misiniz?`,
      "Evet",
      "Hayır",
      "Silme Onayı"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/deleteService/${selectedRow.id}`);
      await fetchServices();
      setSelectedRow(null);
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 300));
      await confirm(
        error.response?.data?.message || error.message || "Bir hata oluştu",
        "Tamam",
        "",
        "Uyarı"
      );
    }
  };

  const onEdit = (service) => {
    setEditService(service);
    setIsAddModalOpen(true);
  };

  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen);
    if (isAddModalOpen) {
      setEditService(null);
      fetchServices();
    }
  };

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Hizmet Adı', flex: 2, minWidth: 150 },
    {
      field: 'category', headerName: 'Kategori', flex: 1, width: 150,
      valueFormatter: (params) => {
        const cat = categories.find(c => c.value === Number(params.value));
        return cat ? cat.label : 'Bilinmiyor';
      }
    },
    {
      field: 'price', headerName: 'Fiyat', flex: 1, width: 100,
      valueFormatter: (params) => params.value ? `${params.value} ₺` : ''
    },
    { field: 'description', headerName: 'Açıklama', flex: 1, minWidth: 200, sortable: false, filterable: false },
  ];

  return (
    <div style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
      <h4 className="mb-3">🩺 Hizmet Listesi</h4>

      <Row className="mb-3 g-2">
        <Col xs={12} md={4}>
          <Input
            placeholder="Hizmet Ara"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </Col>

        <Col xs={12} md="auto">
          <div className="d-flex flex-wrap gap-2">
            <Button color="primary" onClick={handleSearch}>Ara</Button>
            <Button
              color="danger"
              disabled={!selectedRow}
              onClick={handleDelete}
            >
              Sil
            </Button>
            <Button
              color="success"
              disabled={!selectedRow}
              onClick={() => selectedRow && onEdit(selectedRow)}
            >
              Değiştir
            </Button>
          </div>
        </Col>

        <Col xs={12} md className="text-md-end text-start">
          <Button color="success" onClick={toggleAddModal}>
            Hizmet Ekle
          </Button>
        </Col>
      </Row>

      <div style={{ width: '100%', height: 620 }}>
        <DataGrid
          rows={filteredServices}
          columns={columns}
          pagination
          disableSelectionOnClick={false}
          autoHeight={false}
          loading={loading}
          getRowId={row => row.id || row._id}
          onSelectionModelChange={ids => {
            const selectedID = ids[0];
            const selected = filteredServices.find(row => row.id === selectedID);
            setSelectedRow(selected || null);
          }}
          selectionModel={selectedRow ? [selectedRow.id] : []}
          localeText={{
            ...trTR.components.MuiDataGrid.defaultProps.localeText,
            footerRowSelected: (count) =>
              count > 1
                ? `${count.toLocaleString()} satır seçildi`
                : `${count.toLocaleString()} satır seçildi`,
          }}
        />
      </div>

      <MainModal
        isOpen={isAddModalOpen}
        toggle={toggleAddModal}
        title={editService ? "Hizmet Düzenle" : "Hizmet Ekle"}
        content={<AddService service={editService} onClose={toggleAddModal} />}
        saveButtonLabel={editService ? "Güncelle" : "Ekle"}
      />
    </div>
  );
};

export default ServiceList;
