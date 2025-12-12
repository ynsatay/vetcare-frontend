import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { trTR } from '@mui/x-data-grid/locales';
import "./AddPatStock.css";

const AddPatStock = ({ onClose, onSelect }) => {
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
                setError('Stoklar alınamadı');
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
        { field: 'name', headerName: 'Stok Adı', flex: 1 },
        { field: 'total_quantity', headerName: 'Mevcut Miktar', width: 130 },
        {
            field: 'price',
            headerName: 'Birim Fiyat',
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

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="select-modal">
            <div className="select-card">
                <div className="select-header">
                    <h3>Stok Seç</h3>
                </div>

                <TextField
                    className="select-search"
                    label="Ara..."
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
                        label="Miktar"
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
                        Ekle
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Vazgeç
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddPatStock;
