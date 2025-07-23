import React, { useEffect, useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';

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
                const res = await axiosInstance.get('/getMaterials');
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
        { field: 'quantity', headerName: 'Mevcut Miktar', width: 130 },
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
        <Box sx={{ height: 400, width: '100%' }}>
            <TextField
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
                autoHeight={false}
                style={{ height: 290 }}  // burada yüksekliği sabit veriyoruz
            />

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    label="Miktar"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={quantity}
                    onChange={handleQuantityChange}
                    size="small"
                    sx={{ width: 100 }}
                    disabled={!selectedRow}  // Satır seçilmediyse pasif
                />
                <Button
                    variant="contained"
                    onClick={handleAddClick}
                    disabled={!selectedRow || quantity < 1} // Satır yoksa veya miktar <1 pasif
                >
                    Ekle
                </Button>
                <Button variant="outlined" onClick={onClose} alignItems="right">
                    Vazgeç
                </Button>
            </Box>
        </Box>
    );
};

export default AddPatStock;
