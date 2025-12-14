import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Paper, Box } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/usercontext.tsx';
import MenuLogo from '../../assets/images/logos/vc2.png';
import { BASE_URL } from "../../config.js";
import { useLanguage } from '../../context/LanguageContext.js';

const Register = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [clinicName, setClinicName] = useState('');
    const [clinicPhone, setClinicPhone] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const selectedPlan = location.state?.selectedPlan;

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !surname || !username || !password || !passwordAgain || !email ||
            !cardName || !cardNumber || !expiryDate || !cvc) {
            setMessage(t('PleaseFillRequiredFields'));
            return;
        }
        try {
            await axios.post(`${BASE_URL}/register`, {
                name,
                surname,
                username,
                password,
                passwordAgain,
                email,
                selectedPlan,
            });
            const responseLogin = await axios.post(`${BASE_URL}/login`, {
                username,
                password,
            });

            axios.defaults.headers.common['Authorization'] = `Bearer ${responseLogin.data.token}`;
            localStorage.setItem('token', responseLogin.data.token);
            localStorage.setItem('userid', responseLogin.data.userid);

            login({
                token: responseLogin.data.token,
                username: responseLogin.data.username,
                userid: responseLogin.data.userid,
                userRole: responseLogin.data.userRole,
            });

            navigate('/');
        } catch (error) {
            localStorage.setItem('token', '');
            if (error.response) {
                setMessage(`Hata: ${error.response.data.error}`);
            } else {
                setMessage('Bir hata oluştu');
            }
            console.error('Error:', error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: 2,
            }}
        >
            <Paper elevation={6} sx={{ maxWidth: 500, width: '100%', p: 4 }}>
                <Box textAlign="center" mb={3}>
                    <img src={MenuLogo} alt="Logo" style={{ height: 80 }} />
                    <Typography variant="h5" mt={2}>{t('Register')}</Typography>
                    {selectedPlan && (
                        <Typography variant="subtitle1" color="primary">
                            {t('SelectedPlan')}: {selectedPlan}
                        </Typography>
                    )}
                </Box>

                <form onSubmit={handleRegister}>
                    <Grid container spacing={2}>

                        {/* Klinik Bilgileri */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold">{t('ClinicInformation')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={t('ClinicName')} value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('Phone')} value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('Address')} value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                        </Grid>

                        {/* Kullanıcı Bilgileri */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold">{t('UserInformation')}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('Name')} value={name} onChange={(e) => setName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('Surname')} value={surname} onChange={(e) => setSurname(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={t('Username')} value={username} onChange={(e) => setUsername(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('Password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label={t('RepeatNewPassword')} type="password" value={passwordAgain} onChange={(e) => setPasswordAgain(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={t('Email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Grid>

                        {/* Ödeme Bilgileri */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold">{t('PaymentInformation')}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={t('CardName')} value={cardName} onChange={(e) => setCardName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label={t('CardNumber')} placeholder="**** **** **** ****" inputProps={{ maxLength: 19 }} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth size="small" label={t('ExpiryDate')} placeholder="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth size="small" label={t('CVC')} placeholder="123" inputProps={{ maxLength: 4 }} value={cvc} onChange={(e) => setCvc(e.target.value)} />
                        </Grid>

                        {/* Hata mesajı ve buton */}
                        {message && (
                            <Grid item xs={12}>
                                <Typography color="error">{message}</Typography>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                {t('Register')}
                            </Button>
                        </Grid>

                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default Register;
