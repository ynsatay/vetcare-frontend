import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Typography } from '@mui/material';
import MenuLogo2 from '../../assets/images/logos/vc2.png';
import LoginBack from '../../assets/images/bg/login-bg2.png';
import "../scss/_login.scss";
import axios from 'axios';
import { AuthContext } from '../../context/usercontext.tsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setMessage('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    try {
      const response = await axios.post('https://vatcare-backend-production.up.railway.app/api/login', {
        username,
        password,
      });

      setMessage(`Giriş başarılı: ${response.data.message}`);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userid', response.data.userid);

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      login({
        token: response.data.token,
        username: response.data.username,
        userid: response.data.userid,
        userRole: response.data.userRole,
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
    <div className='maindiv'>
      <div className='altdiv'>
        <div className='altdiv2'>
          <div className='imagediv'>
            <div className='alt-image-div'>
              <img src={LoginBack} alt="Background" className='alt-image' />
            </div>
          </div>
          <div className='form-div'>
            <div className='form-image-div'>
              <div className='alt-form-image.div'>
                <img src={MenuLogo2} alt="Logo" className='form-image' />
              </div>
              <Typography variant="h4" component="h1" gutterBottom>
                Hoşgeldiniz!
              </Typography>
              <form className='form' onSubmit={handleLogin}>
                <TextField
                  label="Kullanıcı Adı"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  label="Şifre"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  style={{ marginTop: '16px' }}
                  className='login'
                  type="submit"
                >
                  GİRİŞ
                </Button>
              </form>
              {message && <Typography color="error" style={{ marginTop: '16px' }}>{message}</Typography>}

              <div className='forgot-password-div'>
                <Link to="/forgot-password" className='forgot-password'>Şifremi mi Unuttun?</Link>
              </div>

              {/* <hr className='hr' />

              <Link to="/register"  >
                <Button
                  size="large"
                  variant="contained"
                  style={{ marginTop: '16px' }}
                  className='register'
                  type="submit"
                >
                  YENİ HESAP OLUŞTUR
                </Button> 
              </Link>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
