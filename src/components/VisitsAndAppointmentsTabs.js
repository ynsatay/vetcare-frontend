import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';  // <-- Bunu ekle

const visitColumns = (navigate) => [
    {
        field: 'id',
        headerName: 'Geliş Numarası',
        flex: 1,
        valueFormatter: (params) => params.value

    },
    {
        field: 'created_at',
        headerName: 'Tarih',
        flex: 1,
        valueFormatter: (params) =>
            params.value
                ? dayjs(params.value).local().format('DD.MM.YYYY HH:mm')
                : '',
    },
    {
        field: 'type',
        headerName: 'Geliş Tipi',
        flex: 1,
        valueFormatter: (params) => {
            switch (params.value) {
                case 1:
                    return "Kontrol";
                case 2:
                    return "Acil";
                case 3:
                    return "Aşı";
                default:
                    return "Bilinmiyor";
            }
        }
    },
    {
        field: 'is_discharge',
        headerName: 'Çıkış Durumu',
        flex: 1,
        valueFormatter: (params) => (params.value ? "Çıkış Yapıldı" : "Açık"),
        cellClassName: (params) =>
            params.value ? 'status-complete' : 'status-open',
    },
    { field: 'arrival_reason', headerName: 'Şikayet / Geliş Nedeni', flex: 2 },
    //{ field: 'status', headerName: 'Durum', flex: 1 },
    {
        field: 'actions',
        headerName: 'İşlemler',
        sortable: false,
        flex: 1,
        renderCell: (params) => (
            <Button
                variant="contained"
                size="small"
                onClick={() => navigate(`/patientFile/${params.row.id}`)} // navigate ile yönlendirme
            >
                Aç
            </Button>
        ),
    },
];

const appointmentColumns = [
    {
        field: 'start_time',
        headerName: 'Başlangıç Zamanı',
        flex: 1.5,
        valueFormatter: (params) =>
            params.value
                ? dayjs(params.value).local().format('DD.MM.YYYY HH:mm')
                : '',
    },
    {
        field: 'end_time',
        headerName: 'Bitiş Zamanı',
        flex: 1.5,
        valueFormatter: (params) =>
            params.value
                ? dayjs(params.value).local().format('DD.MM.YYYY HH:mm')
                : '',
    },
    { field: 'user_name', headerName: 'Sahip', flex: 1 },
];

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

export default function VisitsAndAppointmentsTabs({ visitList, appointmentList, animalId }) {
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box style={{ width: '100%', backgroundColor: 'white', borderRadius: '10px', height: '450px' }}>
            <Tabs value={tabIndex} onChange={handleChange} aria-label="Geliş ve Randevu Sekmeleri">
                <Tab label="Geliş Dosyası" />
                <Tab label="Randevu Listesi" />
            </Tabs>

            <TabPanel value={tabIndex} index={0} sx={{ height: '100%' }}>
                <DataGrid
                    rows={visitList}
                    autoHeight={false}
                    columns={visitColumns(navigate)}
                    sx={{ height: 385 }} 
                    getRowId={(row) => row.id || row.ctime}
                    disableSelectionOnClick
                    hideFooterPagination
                    localeText={{
                        noRowsLabel: 'Kayıt bulunamadı',
                    }}
                />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
                <DataGrid
                    rows={appointmentList}
                    autoHeight={false}
                    columns={appointmentColumns}
                    sx={{ height: 385 }} 
                    getRowId={(row) => row.id || row.start_time}
                    disableSelectionOnClick
                    hideFooterPagination
                    localeText={{
                        noRowsLabel: 'Kayıt bulunamadı',
                    }}
                />
            </TabPanel>
        </Box>

    );
}
