import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { trTR } from '@mui/x-data-grid/locales';
import "./AddPatStock.css";
import { useLanguage } from '../../context/LanguageContext.js';

const AddPatStock = ({ onClose, onSelect }) => {
    const { t } = useLanguage();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const res = await axiosInstance.get('/getMaterialsWithQuantity');
                setStocks(res.data.data || []);
            } catch (err) {
                setError(t('Error'));
            } finally {
                setLoading(false);
            }
        };
        fetchStocks();
    }, []);

    // Filtreleme
    const filteredStocks = stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { field: 'id', headerName: '#', width: 70 },
        { field: 'name', headerName: t('StockName'), flex: 1 },
        { field: 'total_quantity', headerName: t('AvailableQuantity'), width: 130 },
        {
            field: 'price',
            headerName: t('UnitPrice'),
            width: 130,
            valueFormatter: (params) => `${params.value} ₺`,
        },
    ];

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setQuantity(val === '' ? '' : Math.max(1, parseInt(val)));
        }
    };

    const handleAddClick = () => {
        if (selectedRow && quantity > 0) {
            onSelect({ ...selectedRow, count: quantity });
            onClose();
        }
    };

    if (loading) return <div>{t('Loading')}</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="select-modal">
            <div className="select-card">
                <div className="select-header">
                    <h3>{t('StockSelect')}</h3>
                </div>

                <TextField
                    className="select-search"
                    label={t('SearchPlaceholder')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedRow(null);
                        setQuantity(1);
                    }}
                />

                <div className="select-data-grid">
                    <DataGrid
                        rows={filteredStocks}
                        columns={columns}
                        hideFooter={true}
                        loading={loading}
                        disableSelectionOnClick={false}
                        onRowClick={(params) => {
                            setSelectedRow(params.row);
                            setQuantity(1);
                        }}
                        selectionModel={selectedRow ? [selectedRow.id] : []}
                        sx={{
                            cursor: 'pointer',
                            '& .MuiDataGrid-row.Mui-selected': {
                                backgroundColor: '#d0f0fd !important',
                            },
                        }}
                        autoHeight
                        localeText={{
                            ...trTR.components.MuiDataGrid.defaultProps.localeText,
                            footerRowSelected: (count) =>
                                count > 1
                                    ? `${count.toLocaleString()} satır seçildi`
                                    : `${count.toLocaleString()} satır seçildi`,
                        }}
                    />
                </div>

                <div className="select-footer">
                    <TextField
                        label={t('Quantity')}
                        type="number"
                        inputProps={{ min: 1 }}
                        value={quantity}
                        onChange={handleQuantityChange}
                        size="small"
                        disabled={!selectedRow}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddClick}
                        disabled={!selectedRow || quantity < 1}
                    >
                        {t('Add')}
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        {t('Cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddPatStock;
