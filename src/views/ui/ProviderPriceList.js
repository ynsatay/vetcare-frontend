import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import MainModal from '../../components/MainModal.js';
import { useConfirm } from '../../components/ConfirmContext';
import EditProviderPrice from '../popup/EditProviderPrice.js';
import { trTR } from '@mui/x-data-grid/locales';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';
import '../list/ListTheme.css';

// columns defined inside component to access i18n

const ProviderPriceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceList, setPriceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { confirm } = useConfirm();
  const { t, lang } = useLanguage();
  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'material_name', headerName: t('Material'), flex: 1, minWidth: 150 },
    { field: 'provider_firm_name', headerName: t('ProviderFirms'), flex: 1, minWidth: 150 },
    { field: 'purchase_price', headerName: t('PricePurchase'), width: 130, type: 'number' },
    { 
      field: 'is_default', 
      headerName: t('Default'), 
      width: 110,
      valueFormatter: ({ value }) => value ? t('Yes') : t('No'),
    },
    { 
      field: 'active', 
      headerName: t('Active'), 
      width: 90,
      valueFormatter: ({ value }) => value ? t('Yes') : t('No'),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchPriceList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/provider-price-list');
      if (res.data?.status === 'success' && Array.isArray(res.data.firms)) {
        setPriceList(res.data.firms);
        setFilteredList(res.data.firms);
      } else {
        setPriceList([]);
        setFilteredList([]);
      }
    } catch (err) {
      console.error('Tedarikçi fiyat listesi çekme hatası:', err);
      setPriceList([]);
      setFilteredList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceList();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredList(priceList);
      return;
    }
    const filtered = priceList.filter(item =>
      item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider_firm_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const confirmed = await confirm(
      lang === 'en'
        ? `Are you sure you want to delete the price for "${selectedRow.material_name}" from "${selectedRow.provider_firm_name}"?`
        : `"${selectedRow.material_name}" için "${selectedRow.provider_firm_name}" kaydını silmek istediğinize emin misiniz?`,
      t('Yes'),
      t('No'),
      t('Warning')
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/provider-price-delete/${selectedRow.id}`);
      await fetchPriceList();
      setSelectedRow(null);
      toast.success(lang === 'en' ? 'Record deleted successfully.' : 'Kayıt başarıyla silindi.');
    } catch (err) {
      if (err.__demo_blocked) return; 
      await confirm(err.response?.data?.message || err.message || (lang === 'en' ? 'An error occurred' : 'Bir hata oluştu'), t('Ok'), "", t('Warning'));
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    fetchPriceList();
  };

  return (
    <div
      className="list-page"
      style={{
        backgroundColor: 'var(--id-bg-card, #ffffff)',
        color: 'var(--id-text, #0f172a)',
        border: '1px solid var(--id-border, #e2e8f0)',
        padding: 15,
        borderRadius: 10,
      }}
    >
      <h4 className="mb-3">💰 {t('ProviderPrices')}</h4>

      <Row className="mb-3 g-2">
        <Col xs={12} md={4}>
          <Input 
            placeholder={t('Search')} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSearch()} 
          />
        </Col>

        <Col xs="auto">
          <Button color="primary" onClick={handleSearch}>{t('Search')}</Button>
        </Col>

        <Col xs="auto">
          <Button color="success" onClick={handleAddNew}>{t('Add')}</Button>
        </Col>

        <Col xs="auto">
          <Button color="danger" disabled={!selectedRow} onClick={handleDelete}>{t('Delete')}</Button>
        </Col>

        <Col xs="auto">
          <Button color="warning" disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow)}>{t('EditAction')}</Button>
        </Col>
      </Row>

      <div className="list-data-grid" style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredList}
          columns={columns}
          pageSizeOptions={[10, 20, 50]}
          pagination
          loading={loading}
          getRowId={(row) => row.id}
          onSelectionModelChange={(ids) => {
            if (!ids || ids.length === 0) {
              setSelectedRow(null);
              return;
            }
            const selectedID = ids[0];
            const selected = filteredList.find(row => row.id === selectedID);
            setSelectedRow(selected || null);
          }}
          selectionModel={selectedRow ? [selectedRow.id] : []}
          disableSelectionOnClick={false}
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
        isOpen={isModalOpen}
        toggle={closeModal}
        title={editData ? t('EditAction') : t('Add')}
        content={
          <EditProviderPrice initialData={editData} onClose={closeModal} />
        }
        ShowFooter={false}
      />
    </div>
  );
};

export default ProviderPriceList;
