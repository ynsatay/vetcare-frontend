import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import MainModal from '../../components/MainModal.js';
import AddService from '../popup/AddService.js';
import axiosInstance from '../../api/axiosInstance.ts';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';
import { getServiceCategories, normalizeServiceCategory } from '../../constants/serviceCategories.js';
import './ListTheme.css';

const ServiceList = () => {
  const { t, lang } = useLanguage();
  const categories = getServiceCategories(t);

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
        const next = res.data.data;
        setServices(next);
        setFilteredServices(next);
        setSelectedRow(prev => {
          if (!prev) return null;
          const prevId = prev.id ?? prev._id;
          const found = next.find(row => String(row.id ?? row._id) === String(prevId));
          return found || null;
        });
      } else {
        setServices([]);
        setFilteredServices([]);
        setSelectedRow(null);
      }
    } catch (err) {
      console.error('Service fetch error:', err);
      setServices([]);
      setFilteredServices([]);
      setSelectedRow(null);
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
      lang === 'en' ? `Are you sure you want to delete "${selectedRow.name}"?` : `"${selectedRow.name}" adlı hizmeti silmek istediğinize emin misiniz?`,
      t('Yes'),
      t('No'),
      t('Warning')
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/deleteService/${selectedRow.id}`);
      await fetchServices();
      setSelectedRow(null);
      toast.success(lang === 'en' ? 'Service deleted successfully.' : 'Hizmet başarıyla silindi.');
    } catch (error) {
      if (error.__demo_blocked) return; 
      await new Promise(resolve => setTimeout(resolve, 300));
      await confirm(
        error.response?.data?.message || error.message || (lang === 'en' ? 'An error occurred' : 'Bir hata oluştu'),
        t('Ok'),
        "",
        t('Warning')
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
    { field: 'name', headerName: t('ServiceName'), flex: 2, minWidth: 150 },
    {
      field: 'category', headerName: t('Category'), flex: 1, width: 150,
      valueFormatter: (params) => {
        const normalized = normalizeServiceCategory(params.value);
        if (normalized === '' || normalized === null || normalized === undefined) return t('Unknown');
        const cat = categories.find(c => c.value === Number(normalized));
        return cat ? cat.label : t('Unknown');
      }
    },
    {
      field: 'price', headerName: t('Price'), flex: 1, width: 100,
      valueFormatter: (params) => params.value ? `${params.value} ₺` : ''
    },
    { field: 'description', headerName: t('Notes'), flex: 1, minWidth: 200, sortable: false, filterable: false },
  ];

  return (
    <div
      className="list-page"
      style={{
        backgroundColor: 'var(--id-bg-card, #ffffff)',
        color: 'var(--id-text, #0f172a)',
        border: '1px solid var(--id-border, #e2e8f0)',
        padding: 10,
        borderRadius: 10,
      }}
    >
      <h4 className="mb-3">🩺 {t('ServiceListTitle')}</h4>

      <Row className="mb-3 g-2">
        <Col xs={12} md={4}>
          <Input
            placeholder={t('ServiceSearch')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </Col>

        <Col xs={12} md="auto">
          <div className="d-flex flex-wrap gap-2">
            <Button outline color="secondary" onClick={handleSearch}>{t('Search')}</Button>
            <Button
              color="danger"
              disabled={!selectedRow}
              onClick={handleDelete}
            >
              {t('Delete')}
            </Button>
            <Button
              outline
              color="primary"
              disabled={!selectedRow}
              onClick={() => selectedRow && onEdit(selectedRow)}
            >
              {t('EditAction')}
            </Button>
          </div>
        </Col>

        <Col xs={12} md className="text-md-end text-start">
          <Button color="primary" onClick={toggleAddModal}>
            {t('AddServiceLabel')}
          </Button>
        </Col>
      </Row>

      <div className="list-data-grid" style={{ width: '100%', height: 620 }}>
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
            const selected = filteredServices.find(row => String(row.id ?? row._id) === String(selectedID));
            setSelectedRow(selected || null);
          }}
          selectionModel={selectedRow ? [selectedRow.id] : []}
          localeText={{
            ...trTR.components.MuiDataGrid.defaultProps.localeText,
            footerRowSelected: (count) =>
              lang === 'en'
                ? `${count.toLocaleString()} row selected`
                : `${count.toLocaleString()} satır seçildi`,
          }}
        />
      </div>

      <MainModal
        isOpen={isAddModalOpen}
        toggle={toggleAddModal}
        title={editService ? t('EditService') : t('AddServiceLabel')}
        content={<AddService service={editService} onClose={toggleAddModal} />}
        saveButtonLabel={editService ? t('Update') : t('Add')}
      />
    </div>
  );
};

export default ServiceList;
