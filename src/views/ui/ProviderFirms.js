import React, { useState, useEffect } from 'react';
import { Input, Button, Row, Col } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import MainModal from '../../components/MainModal.js';
import axiosInstance from '../../api/axiosInstance.ts';
import { useConfirm } from '../../components/ConfirmContext';
import EditProviderFirm from '../popup/EditProviderFirm.js'; // Firma düzenleme popup'u
import { trTR } from '@mui/x-data-grid/locales';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';

// columns are defined inside component to access i18n

const ProviderFirmsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [firmsList, setFirmsList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const { confirm } = useConfirm();
    const { t, lang } = useLanguage();
    const columns = [
        { field: 'id', headerName: '#', width: 70 },
        { field: 'name', headerName: t('CompanyName'), flex: 1, minWidth: 150 },
        { field: 'contact_person', headerName: t('ContactPerson'), width: 150 },
        { field: 'phone', headerName: t('Phone'), width: 130 },
        { field: 'email', headerName: t('Email'), width: 180 },
        { field: 'address', headerName: t('Address'), flex: 1, minWidth: 200 },
        {
            field: 'active',
            headerName: t('Status'),
            width: 100,
            valueFormatter: ({ value }) => (value ? t('Active') : t('Inactive')),
        },
    ];

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchFirms = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/provider-firms');
            if (res.data?.status === 'success') {
                setFirmsList(res.data.firms);      
                setFilteredList(res.data.firms);
            } else {
                setFirmsList([]);
                setFilteredList([]);
            }
        } catch (err) {
            console.error('Tedarikçi firmalar çekme hatası:', err);
            setFirmsList([]);
            setFilteredList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFirms();
    }, []);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredList(firmsList);
            return;
        }
        const filtered = firmsList.filter((firm) =>
            firm.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredList(filtered);
    };

    const handleDelete = async () => {
        if (!selectedRow) return;

        const confirmed = await confirm(
            lang === 'en'
                ? `Are you sure you want to delete "${selectedRow.name}"?`
                : `"${selectedRow.name}" adlı firmayı silmek istediğinize emin misiniz?`,
            t('Yes'),
            t('No'),
            t('Warning')
        );
        if (!confirmed) return;

        try {
            await axiosInstance.delete(`/del-provider-firms/${selectedRow.id}`);
            await fetchFirms();
            setSelectedRow(null);
            toast.success(lang === 'en' ? 'Firm deleted successfully.' : 'Firma başarıyla silindi.');
        } catch (error) {
            if (error.__demo_blocked) return; 
            await confirm(
                error.response?.data?.message || error.message || "Bir hata oluştu",
                "Tamam",
                "",
                "Uyarı"
            );
        }
    };

    const handleEdit = (row) => {
        const latestRow = firmsList.find(item => item.id === row.id);
        setEditData({ ...latestRow });
        setIsEditModalOpen(true);
    };

    const toggleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
        if (isEditModalOpen) {
            fetchFirms(); // modal kapanınca listeyi yenile
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px' }}>
            <h4 className="mb-3">🏢 {t('ProviderFirms')}</h4>

            <Row className="mb-3 g-2">
                <Col xs={12} md={4}>
                    <Input
                        placeholder={t('FirmSearchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </Col>

                <Col xs={12} md="auto">
                    <div className="d-flex flex-wrap gap-2">
                        <Button color='primary' onClick={handleSearch}>{t('Search')}</Button>

                        <Button
                            color="danger"
                            disabled={!selectedRow}
                            onClick={handleDelete}
                        >
                            {t('Delete')}
                        </Button>

                        <Button
                            color="success"
                            disabled={!selectedRow}
                            onClick={() => selectedRow && handleEdit(selectedRow)}
                        >
                            {t('EditAction')}
                        </Button>
                    </div>
                </Col>

                <Col xs={12} md className="text-md-end text-start">
                    <Button color="success" onClick={() => {
                        setEditData(null);
                        setIsEditModalOpen(true);
                    }}>
                        {t('FirmAdd')}
                    </Button>
                </Col>
            </Row>

            <div style={{ width: '100%', height: 600 }}>
                <DataGrid
                    rows={Array.isArray(filteredList) ? filteredList : []}
                    columns={columns}
                    pagination
                    pageSizeOptions={[10, 20, 50]}
                    loading={loading}
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
                isOpen={isEditModalOpen}
                toggle={toggleEditModal}
                title={editData ? t('FirmEdit') : t('FirmAdd')}
                content={
                    <EditProviderFirm initialData={editData} onClose={toggleEditModal} />
                }
                ShowFooter={false}
            />
        </div>
    );
};

export default ProviderFirmsList;
