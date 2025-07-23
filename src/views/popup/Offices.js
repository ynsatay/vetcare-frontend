import React, { useContext, useState } from 'react';
import { Input, Label } from 'reactstrap';
import '../scss/_animals.scss';
import { AuthContext } from '../../context/usercontext.tsx';
import axiosInstance from '../../api/axiosInstance.ts';


const Office = React.forwardRef((props, ref) => {
    const [clinicId, setClinicId] = useState(''); // Başlangıç değeri '' olarak ayarlandı
    const [packageType, setPackageType] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const { userid } = useContext(AuthContext);

    React.useImperativeHandle(ref, () => ({
        handleSave
    }));

    const handleSave = async () => {
        try {

            const response = await axiosInstance.post('/officepost', {
                clinic_id: parseInt(clinicId),
                package_type: parseInt(packageType),
                email: email,
                phone: phone,
                user_id: userid
            });
            props.onClose();
            console.log('Response:', response.data);
            if (props.onSave) props.onSave();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form >
            <div className="ani-form-group">
                <Label className="ani-form-label" for="exampleSelect">Klinik Seçin</Label>
                <Input
                    id="exampleSelect"
                    name="select"
                    type="select"
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                    className="ani-form-select"
                >
                    <option value="0">Seçiniz</option> {0}
                    <option value="1">klinik</option> {1}
                </Input>
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="packageType">Paket Tipi</Label>
                <Input
                    type="text"
                    name="packageType"
                    id="packageType"
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="email">Email</Label>
                <Input
                    type="text"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="phone">Telefon</Label>
                <Input
                    type="text"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
        </form>
    );
});

export default Office;
