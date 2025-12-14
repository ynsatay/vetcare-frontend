import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography } from '@mui/material';
import MenuLogo from '../../assets/images/logos/vc2.png';
import "../scss/_register.scss";
import axios from 'axios';
import { AuthContext } from '../../context/usercontext.tsx';
import { BASE_URL } from "../../config.js";
import { useLanguage } from '../../context/LanguageContext.js';

// import { AuthContext } from '../../context/usercontext.tsx';

const Register = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [surname, setSurmame] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useContext(AuthContext)
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (name === '' || surname === '' || username === '' || password === '' || passwordAgain === '' || email === '') {
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
                email
            });

            // LOGIN
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
                setMessage(`${t('Error')}: ${error.response.data.error}`);
            } else {
                setMessage(t('Error'));
            }
            console.error('Error:', error);
        }
    };

    return (
        <div className='reg-maindiv'>
            <div className='reg-altdiv'>
                <div className='reg-altdiv2'>
                    <div className='reg-form-div'>
                        <div className='reg-form-image-div'>
                            <div className='reg-alt-form-image-div'>
                                <img src={MenuLogo} alt="Logo" className='reg-form-image' />
                            </div>

                            <Typography variant="h4" component="h1" gutterBottom>
                                {t('Register')}
                            </Typography>

                            <form className='reg-form' onSubmit={handleRegister}>
                                <div display="flex" flexDirection="row">
                                    <TextField
                                        style={{ width: '50%', marginRight: '1%' }}
                                        label={t('Name')}
                                        variant="outlined"
                                        margin="normal"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <TextField
                                        style={{ width: '49%', marginleft: '1%' }}
                                        label={t('Surname')}
                                        variant="outlined"
                                        margin="normal"
                                        value={surname}
                                        onChange={(e) => setSurmame(e.target.value)}
                                    />
                                </div>

                                <TextField
                                    label={t('Username')}
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <div display="flex" flexDirection="row">
                                    <TextField
                                        style={{ width: '50%', marginRight: '1%', }}
                                        type="password"
                                        label={t('Password')}
                                        variant="outlined"
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <TextField
                                        style={{ width: '49%', marginleft: '1%', marginRight: '0%' }}
                                        type="password"
                                        label={t('RepeatNewPassword')}
                                        variant="outlined"
                                        margin="normal"
                                        value={passwordAgain}
                                        onChange={(e) => setPasswordAgain(e.target.value)}
                                    />
                                </div>

                                {/* <Input 
                                  style={{ height: '56px', marginTop: '16px' }}
                                  id="exampleSelect"
                                  name="select"
                                  type="select" 
                                  margin="normal"  
                                  value={sex}
                                  onChange={(e) => setSex(e.target.value)}
                                  >
                                    <option>Cinsiyet</option>
                                    <option>Erkek</option>
                                    <option>Kadın</option>
                                </Input> */}

                                <TextField
                                    label={t('Email')}
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    style={{ marginTop: '16px' }}
                                    className='login'
                                    type="submit"
                                >
                                    {t('Register')}
                                </Button>

                            </form>
                            {message && <Typography color="error" style={{ marginTop: '16px' }}>{message}</Typography>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
