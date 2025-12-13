import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import user1 from '../../assets/images/users/user1.jpg';
import user2 from '../../assets/images/users/user2.jpg';
import PersonalReg from '../popup/PersonalReg';
import MainModal from '../../components/MainModal';
import axiosInstance from '../../api/axiosInstance.ts';
import { trTR } from '@mui/x-data-grid/locales';

const PersonalList = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [personalList, setPersonalList] = useState([]);
    const personalFormRef = useRef(null);

    const togglePersonaldModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
        if (isAddModalOpen) {
            fetchPersonalList();
        }
    };

    const handleSave = async () => {
        await personalFormRef.current?.handleSave?.();
    };

    const fetchPersonalList = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/getpersonel');
            if (response.data.status === 'success') {
                setPersonalList(response.data.users);
            } else {
                console.error('Personel Listesi çekilemedi.', response.data.error);
            }
        } catch (error) {
            console.error('Personel Listesi çekilemedi.', error);
        }
    }, []);

    useEffect(() => {
        fetchPersonalList();
    }, [fetchPersonalList]);

    const columns = [
        {
            field: 'fullName',
            headerName: 'Adı Soyadı',
            width: 230,
            renderCell: (params) => {
                const person = params.row;
                const avatar = person.sexuality?.trim().toLowerCase() === 'kadın' ? user1 : user2;
                return (
                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={avatar}
                            alt="avatar"
                            width="35"
                            height="35"
                            className="rounded-circle"
                        />
                        <div>
                            <div>{person.name} {person.surname}</div>
                            <small className="text-muted">{person.email}</small>
                        </div>
                    </div>
                );
            }
        },
        { field: 'username', headerName: 'Kullanıcı Adı', width: 150 },
        { field: 'phone', headerName: 'Telefon', width: 140 },
        {
            field: 'birthdate',
            headerName: 'Doğum Tarihi',
            width: 130,
            valueFormatter: (params) =>
                new Date(params.value).toLocaleDateString('tr-TR')
        },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 1,
            valueFormatter: (params) => {
                const roleMap = {
                    2: 'Veteriner Hekim',
                    3: 'Klinik Yöneticisi'
                };
                return roleMap[params.value] || 'Bilinmiyor';
            },
        },
        {
            field: 'sexuality',
            headerName: 'Cinsiyet',
            width: 110,
            valueFormatter: (params) =>
                params.value?.trim().toUpperCase()
        },
        { field: 'address', headerName: 'Adres', width: 200 },
        {
            field: 'active',
            headerName: 'Durum',
            width: 90,
            renderCell: (params) => (
                <span
                    className={`p-2 rounded-circle d-inline-block ${params.value === 1
                        ? 'bg-success'
                        : params.value === 0
                            ? 'bg-danger'
                            : 'bg-warning'
                        }`}
                />
            )
        }
    ];

    return (
        <div>
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <CardTitle tag="h5">👥 Personel Yönetim Ekranı</CardTitle>
                            <CardSubtitle className="text-muted" tag="h6">
                                Tüm personel listesi
                            </CardSubtitle>
                        </div>
                        <Button className="login" onClick={togglePersonaldModal}>
                            Yeni Personel Ekle
                        </Button>
                    </div>

                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={personalList}
                            columns={columns}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            sx={{
                                border: '1px solid #ccc',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #ddd',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #ccc',
                                },
                            }}
                            localeText={{
                                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                                footerRowSelected: (count) =>
                                    count > 1
                                        ? `${count.toLocaleString()} satır seçildi`
                                        : `${count.toLocaleString()} satır seçildi`,
                            }}
                        />
                    </div>
                </CardBody>
            </Card>

            <MainModal
                isOpen={isAddModalOpen}
                toggle={togglePersonaldModal}
                title="Personel Ekle"
                content={<PersonalReg ref={personalFormRef} onClose={togglePersonaldModal} />}
                onSave={handleSave}
                saveButtonLabel="Ekle"
            />
        </div>
    );
};

export default PersonalList;
