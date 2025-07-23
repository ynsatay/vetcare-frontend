import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, Table, Button } from "reactstrap";
import user1 from "../../assets/images/users/user1.jpg";
import user2 from "../../assets/images/users/user2.jpg";
import PersonalReg from '../popup/PersonalReg';
import MainModal from '../../components/MainModal';
import '../scss/_login.scss';
import axiosInstance from '../../api/axiosInstance.ts';

const PersonalList = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [personalList, setPersonalList] = useState([]);
    const personalFormRef = useRef(null);

    const togglePersonaldModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
        if (isAddModalOpen === true) {
            fetchPersonalList();
        }
    };

    const handleSave = async () => {
        await personalFormRef.current.handleSave();
    }

    const fetchPersonalList = useCallback(async () => {
        const response = axiosInstance.get('/getpersonel');
        response.then((res) => {
            if (res.data.status === 'success') {
                setPersonalList(res.data.users);
            } else {
                console.error('Personel Listesi çekilemedi.', res.data.error);
            }
        }).catch((error) => {
            console.error('Personel Listesi çekilemedi.', error);
        });
    }, []);

    useEffect(() => {
        fetchPersonalList();
    }, [fetchPersonalList]);

    return (
        <div>
            <Card>
                <CardBody>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <CardTitle tag="h5">Personel Yönetim Ekranı</CardTitle>
                            <CardSubtitle className="mb-2 text-muted" tag="h6">
                                Personel Listesi
                            </CardSubtitle>
                        </div>
                        <div>
                            <Button
                                className='login'
                                onClick={togglePersonaldModal}>Yeni Personel Ekle</Button>
                        </div>
                    </div>
                    <Table className="no-wrap mt-3 align-middle" responsive borderless>
                        <thead>
                            <tr>
                                <th>Adı Soyadı</th>
                                <th>Kullanıcı Adı</th>
                                <th>Telefon Numarası</th>
                                <th>Doğum Tarihi</th>
                                <th>Personel Rolü</th>
                                <th>Cinsiyet</th>
                                <th>Adres</th>
                                <th>Aktiflik Durumu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalList.map((tdata, index) => (

                                <tr key={index} className="border-top">
                                    <td>
                                        <div className="d-flex align-items-center p-2">
                                            <img
                                                src={tdata.sexuality?.trim().toLowerCase() === "kadın" ? user1 : user2}
                                                className="rounded-circle"
                                                alt="avatar"
                                                width="45"
                                                height="45"
                                            />
                                            <div className="ms-3">
                                                <h6 className="mb-0">{tdata.name} {tdata.surname} </h6>
                                                <span className="text-muted">{tdata.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{tdata.username}</td>
                                    <td>{tdata.phone}</td>
                                    <td>{new Date(tdata.birthdate).toLocaleDateString("tr-TR")}</td>
                                    <td>{tdata.role}</td>
                                    <td>{tdata.sexuality.trim().toUpperCase()}</td>
                                    <td>{tdata.address}</td>
                                    <td>
                                        {tdata.active === 0 ? (
                                            <span className="p-2 bg-danger rounded-circle d-inline-block ms-3" />
                                        ) : tdata.active === 1 ? (
                                            <span className="p-2 bg-success rounded-circle d-inline-block ms-3" />
                                        ) : (
                                            <span className="p-2 bg-warning rounded-circle d-inline-block ms-3" />
                                        )}
                                    </td>
                                    <td>{tdata.weeks}</td>
                                    <td>{tdata.budget}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <MainModal
                isOpen={isAddModalOpen}
                toggle={togglePersonaldModal}
                title="Personel Ekle"
                content={<PersonalReg onClose={togglePersonaldModal} />}
                onSave={handleSave}
                saveButtonLabel="Ekle" />


        </div>
    );
};

export default PersonalList;
