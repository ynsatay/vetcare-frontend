import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../api/axiosInstance.ts";
import { trTR } from '@mui/x-data-grid/locales';

const MaterialSelectModal = ({ open, onClose, onSelect }) => {
    const [materials, setMaterials] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (open) {
            axiosInstance.get("/getMaterialsWithPrice").then((res) => {
                // API'den gelen data içinde fiyat purchase_price
                const dataWithPrice = (res.data.data || []).map(item => ({
                    ...item,
                    price: Number(item.purchase_price) || 0, // price olarak ekle
                }));
                setMaterials(dataWithPrice);
            });
        }
    }, [open]);

    const units = [
        { label: "Adet", value: 0 },
        { label: "Kutu", value: 1 },
        { label: "ML", value: 2 },
        { label: "Gram", value: 3 },
        { label: "Litre", value: 4 }
    ];

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        { field: "name", headerName: "Stok Adı", flex: 1 },
        {
            field: "unit",
            headerName: "Birim",
            width: 100,
            valueGetter: (params) => {
                const unitObj = units.find((u) => u.value === params.value);
                return unitObj ? unitObj.label : "-";
            }
        },
        {
            field: "price",
            headerName: "Fiyat (₺)",
            width: 110,
            type: "number",
            valueFormatter: (params) => `${params.value?.toFixed(2) || "0.00"} ₺`
        }
    ];

    const handleAdd = () => {
        const selectedMaterials = materials.filter((m) => selected.includes(m.id));
        if (selectedMaterials.length > 0) {
            onSelect(selectedMaterials);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Stok Seç</DialogTitle>
            <DialogContent>
                {materials.length === 0 ? (
                    <Typography sx={{ p: 2 }}>Stok bulunamadı.</Typography>
                ) : (
                    <DataGrid
                        rows={materials}
                        columns={columns}
                        autoHeight
                        pageSizeOptions={[5]}
                        checkboxSelection
                        rowSelectionModel={selected}
                        onSelectionModelChange={(ids) => {
                            setSelected(ids.map(id => Number(id)));
                        }}
                        localeText={{
                            ...trTR.components.MuiDataGrid.defaultProps.localeText,
                            footerRowSelected: (count) =>
                                count > 1
                                    ? `${count.toLocaleString()} satır seçildi`
                                    : `${count.toLocaleString()} satır seçildi`,
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" onClick={handleAdd} disabled={!selected.length}>
                    Ekle
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MaterialSelectModal;
