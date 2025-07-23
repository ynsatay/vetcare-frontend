import React, { useState } from 'react';
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
                ? new Date(params.value).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
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
                ? new Date(params.value).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '',
    },
    {
        field: 'end_time',
        headerName: 'Bitiş Zamanı',
        flex: 1.5,
        valueFormatter: (params) =>
            params.value
                ? new Date(params.value).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
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

export default function VisitsAndAppointmentsTabs({ visitList, appointmentList }) {
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box style={{ width: '100%', backgroundColor: 'white', borderRadius: '10px', height: '450px' }} >
            <Tabs value={tabIndex} onChange={handleChange} aria-label="Geliş ve Randevu Sekmeleri">
                <Tab label="Geliş Dosyası" />
                <Tab label="Randevu Listesi" />
            </Tabs>

            <TabPanel value={tabIndex} index={0}>
                <DataGrid
                    rows={visitList}
                    columns={visitColumns(navigate)}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => row.id || row.ctime}
                    disableSelectionOnClick
                    localeText={{
                        noRowsLabel: 'Kayıt bulunamadı',
                    }}
                />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
                <DataGrid
                    rows={appointmentList}
                    columns={appointmentColumns}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => row.id || row.start_time}
                    disableSelectionOnClick
                    localeText={{
                        noRowsLabel: 'Kayıt bulunamadı',
                    }}
                />
            </TabPanel>
        </Box>
    );
}
