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
import { useLanguage } from "../../context/LanguageContext.js";

const MaterialSelectModal = ({ open, onClose, onSelect }) => {
    const { t, lang } = useLanguage();
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
        { label: t('UnitPiece'), value: 0 },
        { label: t('Box'), value: 1 },
        { label: t('ML'), value: 2 },
        { label: t('Gram'), value: 3 },
        { label: t('Liter'), value: 4 }
    ];

    const columns = [
        { field: "id", headerName: "#", width: 70 },
        { field: "name", headerName: t('StockName'), flex: 1 },
        {
            field: "unit",
            headerName: t('Type'),
            width: 100,
            valueGetter: (params) => {
                const unitObj = units.find((u) => u.value === params.value);
                return unitObj ? unitObj.label : "-";
            }
        },
        {
            field: "price",
            headerName: `${t('UnitPrice')}`,
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
            <DialogTitle>{t('StockSelect')}</DialogTitle>
            <DialogContent>
                {materials.length === 0 ? (
                    <Typography sx={{ p: 2 }}>{t('NoResults')}</Typography>
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
                                lang === 'en'
                                    ? `${count.toLocaleString()} row selected`
                                    : `${count.toLocaleString()} satır seçildi`,
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('Cancel')}</Button>
                <Button variant="contained" onClick={handleAdd} disabled={!selected.length}>
                    {t('Add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MaterialSelectModal;
