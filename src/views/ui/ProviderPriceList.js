import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import MainModal from '../../components/MainModal.js';
import { useConfirm } from '../../components/ConfirmContext';
import EditProviderPrice from '../popup/EditProviderPrice.js';

const columns = [
  { field: 'id', headerName: '#', width: 70 },
  { field: 'material_name', headerName: 'Malzeme', flex: 1, minWidth: 150 },
  { field: 'provider_firm_name', headerName: 'Tedarikçi Firma', flex: 1, minWidth: 150 },
  { field: 'purchase_price', headerName: 'Alım Fiyatı (₺)', width: 130, type: 'number' },
  { field: 'vat_rate', headerName: 'KDV (%)', width: 100, type: 'number' },
  { 
    field: 'is_default', 
    headerName: 'Varsayılan', 
    width: 110,
    valueFormatter: ({ value }) => value ? 'Evet' : 'Hayır',
  },
  { 
    field: 'active', 
    headerName: 'Aktif', 
    width: 90,
    valueFormatter: ({ value }) => value ? 'Evet' : 'Hayır',
  },
];

const ProviderPriceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceList, setPriceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { confirm } = useConfirm();

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
      `"${selectedRow.material_name}" için "${selectedRow.provider_firm_name}" kaydını silmek istediğinize emin misiniz?`,
      "Evet",
      "Hayır",
      "Silme Onayı"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/provider-price-delete/${selectedRow.id}`);
      await fetchPriceList();
      setSelectedRow(null);
    } catch (err) {
      await confirm(err.response?.data?.message || err.message || "Bir hata oluştu", "Tamam", "", "Uyarı");
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
    <div style={{ backgroundColor: 'white', padding: 15, borderRadius: 10 }}>
      <h4 className="mb-3">💰 Tedarikçi Fiyat Listesi</h4>

      <Row className="mb-3 g-2">
        <Col xs={12} md={4}>
          <Input 
            placeholder="Malzeme veya Tedarikçi Ara" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSearch()} 
          />
        </Col>

        <Col xs="auto">
          <Button color="primary" onClick={handleSearch}>Ara</Button>
        </Col>

        <Col xs="auto">
          <Button color="success" onClick={handleAddNew}>Yeni Kayıt</Button>
        </Col>

        <Col xs="auto">
          <Button color="danger" disabled={!selectedRow} onClick={handleDelete}>Sil</Button>
        </Col>

        <Col xs="auto">
          <Button color="warning" disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow)}>Düzenle</Button>
        </Col>
      </Row>

      <div style={{ height: 600, width: '100%' }}>
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
        />
      </div>

      <MainModal
        isOpen={isModalOpen}
        toggle={closeModal}
        title={editData ? 'Fiyat Bilgisi Düzenle' : 'Yeni Fiyat Bilgisi Ekle'}
        content={
          <EditProviderPrice initialData={editData} onClose={closeModal} />
        }
        ShowFooter={false}
      />
    </div>
  );
};

export default ProviderPriceList;
