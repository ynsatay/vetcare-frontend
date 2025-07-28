import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import MainModal from '../../components/MainModal.js';
import AddStock from '../popup/AddStock.js';
import axiosInstance from '../../api/axiosInstance.ts';
import EditStock from '../popup/EditStock.js';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';

const categories = [
    { label: "İlaç", value: 0 },
    { label: "Sarf", value: 1 },
    { label: "Temizlik", value: 2 },
    { label: "Besin", value: 3 },
    { label: "Aşı", value: 5 },
    { label: "Diğer", value: 4 }
];

const units = [
    { label: "Adet", value: 0 },
    { label: "Kutu", value: 1 },
    { label: "ML", value: 2 },
    { label: "Gram", value: 3 },
    { label: "Litre", value: 4 }
];

const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Stok Adı', flex: 1, minWidth: 150 },
    {
        field: 'category',
        headerName: 'Kategori',
        width: 120,
        valueFormatter: (params) => {
            const cat = categories.find(c => c.value === Number(params.value));
            return cat ? cat.label : 'Bilinmiyor';
        }
    },
    {
        field: 'price',
        headerName: 'Fiyat',
        width: 100,
        valueFormatter: (params) => params.value ? `${params.value} ₺` : '',
    },
    {
        field: 'quantity',
        headerName: 'Adet',
        width: 90,
        renderCell: (params) => {
            const quantity = params.value;
            const minStock = params.row.min_stock_level;

            const style = {
                color: quantity < minStock ? 'red' : 'inherit',
                fontWeight: quantity < minStock ? 'bold' : 'normal',
            };

            return <span style={style}>{quantity}</span>;
        }
    },
    {
        field: 'unit',
        headerName: 'Birim',
        width: 100,
        valueFormatter: (params) => {
            const unit = units.find(u => u.value === params.value);
            return unit ? unit.label : params.value || '';
        }
    },
    { field: 'min_stock_level', headerName: 'Min. Stok', width: 110 },
    { field: 'barcode', headerName: 'Barkod', width: 140 },
    {
        field: 'description',
        headerName: 'Açıklama',
        flex: 1,
        minWidth: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                {params.value}
            </div>
        ),
    },
];

const StockList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [materialsList, setMaterialsList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const { confirm } = useConfirm();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/getMaterials');
            if (res.data && res.data.status === 'success' && res.data.data) {
                setMaterialsList(res.data.data);
                setFilteredList(res.data.data);
            } else {
                setMaterialsList([]);
                setFilteredList([]);
            }
        } catch (err) {
            console.error('Malzeme çekme hatası:', err);
            setMaterialsList([]);
            setFilteredList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredList(materialsList);
            return;
        }
        const filtered = materialsList.filter((stock) =>
            stock.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredList(filtered);
    };

    const toggleStockModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
        if (isAddModalOpen) {
            fetchMaterials(); // modal kapanınca listeyi güncelle
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;

        const confirmed = await confirm(
            `"${selectedRow.name}" adlı stoğu silmek istediğinize emin misiniz?`,
            "Evet",
            "Hayır",
            "Silme Onayı"
        );
        if (!confirmed) return;

        try {
            await axiosInstance.delete(`/deleteMaterial/${selectedRow.id}`);
            await fetchMaterials();
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

    const handleEdit = (row) => {
        const latestRow = materialsList.find(item => item.id === row.id);
        setEditData({ ...latestRow });
        setIsEditModalOpen(true);
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px' }}>
            <h4 className="mb-3">📦 Stok Listesi</h4>
            <Row className="mb-3 g-2">
                <Col xs={12} md={4}>
                    <Input
                        placeholder="Stok Ara"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </Col>

                <Col xs={12} md="auto">
                    <div className="d-flex flex-wrap gap-2">
                        <Button color='primary' onClick={handleSearch}>Ara</Button>

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
                            onClick={() => selectedRow && handleEdit(selectedRow)}
                        >
                            Değiştir
                        </Button>
                    </div>
                </Col>

                <Col xs={12} md className="text-md-end text-start">
                    <Button color="success" onClick={() => setIsAddModalOpen(true)}>
                        Stok Ekle
                    </Button>
                </Col>
            </Row>

            <div style={{ width: '100%', height: 620 }}>
                <DataGrid
                    rows={filteredList}
                    columns={columns}
                    pagination
                    disableSelectionOnClick={false}
                    autoHeight={false}
                    loading={loading}
                    getRowId={(row) => row.id || row._id}
                    onSelectionModelChange={(ids) => {
                        const selectedID = ids[0];
                        const selected = filteredList.find(row => row.id === selectedID);
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
                toggle={toggleStockModal}
                title="Stok Ekle"
                content={<AddStock onClose={toggleStockModal} />}
                saveButtonLabel="Ekle"
            />

            <MainModal
                isOpen={isEditModalOpen}
                toggle={() => setIsEditModalOpen(false)}
                title="Stok Güncelle"
                content={<EditStock
                    initialData={editData}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        fetchMaterials();
                    }}
                />}
                saveButtonLabel="Güncelle"
            />
        </div>
    );
};

export default StockList;
