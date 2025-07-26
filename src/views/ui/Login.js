import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import MenuLogo2 from '../../assets/images/logos/vc2.png';
import LoginBack from '../../assets/images/bg/login-bg2.png';
import "../scss/_login.scss";
import axios from 'axios';
import { AuthContext } from '../../context/usercontext.tsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // API'den hr_offices listesini çek
    const fetchOffices = async () => {
      try {
        const res = await axios.get('https://vatcare-backend-production.up.railway.app/api/hr_offices');
        setOffices(res.data);

        // Eğer liste doluysa ilkini seçili yap
        if (res.data.length > 0) {
          setSelectedOffice(res.data[0].id);
        }
      } catch (error) {
        console.error('Ofisler çekilirken hata:', error);
      }
    };

    fetchOffices();
  }, []);

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
        office_id: selectedOffice,  // office id gönderiyoruz
      });

      setMessage(`Giriş başarılı: ${response.data.message}`);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userid', response.data.userid);
      localStorage.setItem('off_id', response.data.off_id);

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      login({
        token: response.data.token,
        username: response.data.username,
        userid: response.data.userid,
        userRole: response.data.userRole,
        offId: response.data.off_id
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

                {/* Office select box */}
                <FormControl fullWidth margin="normal" required sx={{ minWidth: 240 }}>
                  <InputLabel id="office-select-label">Ofis Seçin</InputLabel>
                  <Select
                    labelId="office-select-label"
                    value={selectedOffice}
                    label="Ofis Seçin"
                    onChange={e => setSelectedOffice(e.target.value)}
                  >
                    {offices.map(office => (
                      <MenuItem key={office.id} value={office.id}>
                        {office.name || `Ofis #${office.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
