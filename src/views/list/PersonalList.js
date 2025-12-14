import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap';
import { DataGrid } from '@mui/x-data-grid';
import user1 from '../../assets/images/users/user1.jpg';
import user2 from '../../assets/images/users/user2.jpg';
import PersonalReg from '../popup/PersonalReg';
import MainModal from '../../components/MainModal';
import axiosInstance from '../../api/axiosInstance.ts';
import { trTR } from '@mui/x-data-grid/locales';
import { useLanguage } from '../../context/LanguageContext.js';
import './ListTheme.css';

const PersonalList = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [personalList, setPersonalList] = useState([]);
    const personalFormRef = useRef(null);
    const { t, lang } = useLanguage();

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
            headerName: t('FullName'),
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
        { field: 'username', headerName: t('Username'), width: 150 },
        { field: 'phone', headerName: t('Phone'), width: 140 },
        {
            field: 'birthdate',
            headerName: t('BirthDate'),
            width: 130,
            valueFormatter: (params) =>
                new Date(params.value).toLocaleDateString('tr-TR')
        },
        {
            field: 'role',
            headerName: t('Role'),
            flex: 1,
            valueFormatter: (params) => {
                const v = params.value;
                if (v === 2) return t('Veterinarian');
                if (v === 3) return lang === 'en' ? 'Clinic Manager' : 'Klinik Yöneticisi';
                return t('Unknown');
            },
        },
        {
            field: 'sexuality',
            headerName: t('Gender'),
            width: 110,
            valueFormatter: (params) =>
                params.value?.trim().toUpperCase()
        },
        { field: 'address', headerName: t('Address'), width: 200 },
        {
            field: 'active',
            headerName: t('Status'),
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
        <div className="list-page">
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <CardTitle tag="h5">👥 {t('PersonnelManagement')}</CardTitle>
                            <CardSubtitle className="text-muted" tag="h6">
                                {t('AllPersonnelList')}
                            </CardSubtitle>
                        </div>
                        <Button className="login" onClick={togglePersonaldModal}>
                            {t('AddNewPersonnel')}
                        </Button>
                    </div>

                    <div className="list-data-grid" style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={personalList}
                            columns={columns}
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            sx={{
                                border: '1px solid var(--id-border, #e2e8f0)',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid var(--id-border, #e2e8f0)',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'var(--id-bg-elevated, #f1f5f9)',
                                    borderBottom: '1px solid var(--id-border, #e2e8f0)',
                                },
                            }}
                            localeText={{
                                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                                footerRowSelected: (count) =>
                                    lang === 'en'
                                        ? `${count.toLocaleString()} row selected`
                                        : `${count.toLocaleString()} satır seçildi`,
                            }}
                        />
                    </div>
                </CardBody>
            </Card>

            <MainModal
                isOpen={isAddModalOpen}
                toggle={togglePersonaldModal}
                title={t('AddPersonnel')}
                content={<PersonalReg ref={personalFormRef} onClose={togglePersonaldModal} />}
                onSave={handleSave}
                saveButtonLabel={t('Add')}
            />
        </div>
    );
};

export default PersonalList;
