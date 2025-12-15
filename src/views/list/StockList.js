import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import MainModal from '../../components/MainModal.js';
import AddStock from '../popup/AddStock.js';
import axiosInstance from '../../api/axiosInstance.ts';
import EditStock from '../popup/EditStock.js';
import { useConfirm } from '../../components/ConfirmContext';
import { trTR } from '@mui/x-data-grid/locales';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';
import { getStockCategories, normalizeStockCategory } from '../../constants/stockCategories.js';
import './ListTheme.css';

const StockList = () => {
    const { t, lang } = useLanguage();
    const categories = getStockCategories(t);

    const units = [
        { label: t('UnitPiece'), value: 0 },
        { label: t('Box'), value: 1 },
        { label: t('ML'), value: 2 },
        { label: t('Gram'), value: 3 },
        { label: t('Liter'), value: 4 }
    ];

    const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: t('StockName'), flex: 1, minWidth: 150 },
    {
        field: 'category',
        headerName: t('Category'),
        width: 120,
        valueFormatter: (params) => {
            const normalized = normalizeStockCategory(params.value);
            const cat = categories.find(c => c.value === Number(normalized));
            return cat ? cat.label : t('Unknown');
        }
    },
    {
        field: 'price',
        headerName: t('Price'),
        width: 100,
        valueFormatter: (params) => params.value ? `${params.value} ₺` : '',
    },
    {
        field: 'total_quantity',
        headerName: t('UnitPiece'),
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
        headerName: t('Type'),
        width: 100,
        valueFormatter: (params) => {
            const unit = units.find(u => u.value === params.value);
            return unit ? unit.label : params.value || '';
        }
    },
    { field: 'min_stock_level', headerName: 'Min. Stock', width: 110 },
    { field: 'barcode', headerName: 'Barcode', width: 140 },
    {
        field: 'description',
        headerName: t('Notes'),
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
            const res = await axiosInstance.get('/getMaterialsWithQuantity');
            if (res.data && res.data.status === 'success' && res.data.data) {
                setMaterialsList(res.data.data);
                setFilteredList(res.data.data);
            } else {
                setMaterialsList([]);
                setFilteredList([]);
            }
        } catch (err) {
            console.error('Material fetch error:', err);
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
            lang === 'en' ? `Are you sure you want to delete "${selectedRow.name}"?` : `"${selectedRow.name}" adlı stoğu silmek istediğinize emin misiniz?`,
            t('Yes'),
            t('No'),
            t('Warning')
        );
        if (!confirmed) return;

        try {
            await axiosInstance.delete(`/deleteMaterial/${selectedRow.id}`);
            await fetchMaterials();
            setSelectedRow(null);
            toast.success(lang === 'en' ? 'Stock deleted successfully.' : 'Stok başarıyla silindi.');
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

    const handleEdit = (row) => {
        const latestRow = materialsList.find(item => item.id === row.id);
        setEditData({ ...latestRow });
        setIsEditModalOpen(true);
    };

    return (
        <div
            className="list-page"
            style={{
                backgroundColor: 'var(--id-bg-card, #ffffff)',
                color: 'var(--id-text, #0f172a)',
                border: '1px solid var(--id-border, #e2e8f0)',
                padding: '10px',
                borderRadius: '10px',
            }}
        >
            <h4 className="mb-3">📦 {t('StockListTitle')}</h4>
            <Row className="mb-3 g-2">
                <Col xs={12} md={4}>
                    <Input
                        placeholder={t('StockSearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                            onClick={() => selectedRow && handleEdit(selectedRow)}
                        >
                            {t('EditAction')}
                        </Button>
                    </div>
                </Col>

                <Col xs={12} md className="text-md-end text-start">
                    <Button color="primary" onClick={() => setIsAddModalOpen(true)}>
                        {t('AddStock')}
                    </Button>
                </Col>
            </Row>

            <div className="list-data-grid" style={{ width: '100%', height: 620 }}>
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
                            lang === 'en'
                                ? `${count.toLocaleString()} row selected`
                                : `${count.toLocaleString()} satır seçildi`,
                    }}
                />
            </div>

            <MainModal
                isOpen={isAddModalOpen}
                toggle={toggleStockModal}
                title={t('AddStock')}
                content={<AddStock onClose={toggleStockModal} />}
                saveButtonLabel={t('Add')}
            />

            <MainModal
                isOpen={isEditModalOpen}
                toggle={() => setIsEditModalOpen(false)}
                title={lang === 'en' ? 'Update Stock' : 'Stok Güncelle'}
                content={<EditStock
                    initialData={editData}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        fetchMaterials();
                    }}
                />}
                saveButtonLabel={t('Update')}
            />
        </div>
    );
};

export default StockList;
