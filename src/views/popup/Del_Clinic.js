import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';
import '../scss/_animals.scss';
//import { AuthContext } from '../../context/usercontext.tsx';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';

const Clinic = React.forwardRef((props, ref) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [dbname, setdbName] = useState('');
    const [dbpassword, setdbPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    //const { userid } = useContext(AuthContext);

    React.useImperativeHandle(ref, () => ({
        handleSave
    }));

    const handleSave = async () => {
        try {
            const response = await axiosInstance.post('/clinicpost', {
                name: name,
                dbname: dbname,
                dbpassword: dbpassword,
                email: email,
                phone: phone,
                clinicadmin: 1
                
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
                <Label className="ani-form-label" htmlFor="name">{t('ClinicName')}</Label>
                <Input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="name">{t('DbName')}</Label>
                <Input
                    type="text"
                    name="dbname"
                    id="dbname"
                    value={dbname}
                    onChange={(e) => setdbName(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="name">{t('DbPassword')}</Label>
                <Input
                    type="text"
                    name="dbpassword"
                    id="dbpassword"
                    value={dbpassword}
                    onChange={(e) => setdbPassword(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="email">{t('Email')}</Label>
                <Input
                    type="text"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" htmlFor="phone">{t('Phone')}</Label>
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

export default Clinic;
