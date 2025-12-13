import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Fade,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faBuilding,
  faUser,
  faLock,
  faEnvelope,
  faPhone,
  faStickyNote,
  faShieldAlt,
  faChartLine,
  faUsers,
  faClock,
  faCheckCircle,
  faHeartbeat,
  faCalendarCheck,
  faFileMedical
} from '@fortawesome/free-solid-svg-icons';
import MenuLogo2 from '../../assets/images/logos/vc2.png';
import LoginBack from '../../assets/images/bg/login-bg2.png';
import "../scss/_login.scss";
import axios from 'axios';
import { AuthContext } from '../../context/usercontext.tsx';
import { BASE_URL } from "../../config.js";


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpPhone, setFpPhone] = useState('');
  const [fpNote, setFpNote] = useState('');
  const [fpStatus, setFpStatus] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/public_hr_offices`);
        setOffices(res.data);

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
    setMessage('');
    setLoading(true);

    if (username === '' || password === '') {
      setMessage('Kullanıcı adı ve şifre gereklidir');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
        office_id: selectedOffice,
      });

      setMessage(`Giriş başarılı: ${response.data.message}`);
      setMessageType('success');
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

      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (error) {
      localStorage.setItem('token', '');
      setLoading(false);
      if (error.response) {
        setMessage(`Hata: ${error.response.data.error}`);
      } else {
        setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
      setMessageType('error');
      console.error('Error:', error);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFpStatus('');

    //mailControl apisi ile mail veri tabanında var mı kontrol et
    try {
      const mailCheckRes = await axios.get(`${BASE_URL}/mailControl`, {
        params: {
          email: fpEmail
        }
      });
      if (!mailCheckRes.data.exists) {
        setFpStatus('Bu e-posta adresi kayıtlı değil.');
        return;
      }
    } catch (error) {
      console.error('Mail kontrol hatası:', error);
      setFpStatus('E-posta doğrulama sırasında bir hata oluştu.');
      return;
    }
    try {
      await axios.post(`${BASE_URL}/forgot-password-request`, {
        email: fpEmail,
        phone: fpPhone,
        note: fpNote,
      });
      setFpStatus('Talebiniz alındı. Kısa sürede dönüş yapılacaktır.');
      setFpEmail('');
      setFpPhone('');
      setFpNote('');
      setTimeout(() => setForgotOpen(false), 2000);
    } catch (error) {
      console.error('Forgot password request error:', error);
      setFpStatus('Gönderilemedi, lütfen daha sonra tekrar deneyin.');
    }
  };

  const features = [
    { icon: faHeartbeat, text: 'Hasta Takibi', color: '#ff6b6b' },
    { icon: faCalendarCheck, text: 'Randevu Yönetimi', color: '#4ecdc4' },
    { icon: faFileMedical, text: 'Dijital Dosya', color: '#45b7d1' },
    { icon: faChartLine, text: 'Raporlama', color: '#f9ca24' },
    { icon: faShieldAlt, text: 'Güvenli Sistem', color: '#6c5ce7' },
    { icon: faUsers, text: 'Ekip Yönetimi', color: '#a29bfe' }
  ];

  const stats = [
    { number: '10K+', label: 'Aktif Hasta' },
    { number: '500+', label: 'Veteriner Hekim' },
    { number: '50+', label: 'Klinik' },
    { number: '99%', label: 'Memnuniyet' }
  ];

  return (
    <div className='login-container'>
      <div className='login-background'>
        <div className='login-background-overlay'></div>
        <div className='login-background-image'>
          <img src={LoginBack} alt="Background" />
        </div>
        <div className='login-background-pattern'></div>
        <div className='login-background-shapes'>
          <div className='shape shape-1'></div>
          <div className='shape shape-2'></div>
          <div className='shape shape-3'></div>
        </div>
      </div>

      <div className='login-wrapper'>
        {/* Left Side - Features & Stats */}
        <Fade in={true} timeout={1000}>
          <div className='login-features-section'>
            <div className='login-features-content'>
              <div className='login-features-header'>
                <img src={MenuLogo2} alt="Vetcare Logo" className='features-logo' />
                <Typography variant="h2" className='features-title'>
                  Veteriner Hekimlik Yönetim Sistemi
                </Typography>
                <Typography variant="body1" className='features-subtitle'>
                  Modern teknoloji ile hayvan sağlığını yönetin
                </Typography>
              </div>

              <div className='features-grid'>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className='feature-card'
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className='feature-icon-wrapper' style={{ backgroundColor: `${feature.color}15` }}>
                      <FontAwesomeIcon
                        icon={feature.icon}
                        className='feature-icon'
                        style={{ color: feature.color }}
                      />
                    </div>
                    <Typography variant="body2" className='feature-text'>
                      {feature.text}
                    </Typography>
                  </div>
                ))}
              </div>

              <div className='stats-section'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='stat-card'
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <Typography variant="h4" className='stat-number'>
                      {stat.number}
                    </Typography>
                    <Typography variant="caption" className='stat-label'>
                      {stat.label}
                    </Typography>
                  </div>
                ))}
              </div>

              <div className='features-footer'>
                <div className='trust-badge'>
                  <FontAwesomeIcon icon={faShieldAlt} className='trust-icon' />
                  <span>Güvenli ve Şifrelenmiş</span>
                </div>
                <div className='trust-badge'>
                  <FontAwesomeIcon icon={faClock} className='trust-icon' />
                  <span>7/24 Destek</span>
                </div>
              </div>
            </div>
          </div>
        </Fade>

        {/* Right Side - Login Form */}
        <div className='login-content'>
          <Fade in={true} timeout={800}>
            <Box className='login-card'>
              <div className='login-header'>
                <div className='login-logo-wrapper'>
                  <img src={MenuLogo2} alt="Vetcare Logo" className='login-logo' />
                </div>
                <Typography variant="h3" className='login-title'>
                  Hoş Geldiniz
                </Typography>
                <Typography variant="body2" className='login-subtitle'>
                  Hesabınıza giriş yaparak devam edin
                </Typography>
              </div>

              <form className='login-form' onSubmit={handleLogin}>
                <Box sx={{ position: 'relative', mb: 2.5 }} className='office-select-wrapper'>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className='office-select-icon'
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: 20,
                      zIndex: 1,
                      color: '#59018b',
                      pointerEvents: 'none',
                      transition: 'top 0.2s ease',
                      fontSize: '18px'
                    }}
                  />
                  <FormControl fullWidth className='login-form-field' required>
                    <InputLabel id="office-select-label">Ofis Seçin</InputLabel>
                    <Select
                      labelId="office-select-label"
                      value={selectedOffice}
                      label="Ofis Seçin"
                      onChange={e => setSelectedOffice(e.target.value)}
                    >
                      {offices.map(office => (
                        <MenuItem key={office.id} value={office.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {office.name || `Ofis #${office.id}`}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  className='login-form-field'
                  label="Kullanıcı Adı"
                  variant="outlined"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faUser} style={{ color: '#59018b' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  className='login-form-field'
                  label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faLock} style={{ color: '#59018b' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#59018b' }}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {message && (
                  <Alert
                    severity={messageType}
                    className='login-message'
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    {message}
                  </Alert>
                )}

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  className='login-button'
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </Button>

                <div className='login-forgot-password'>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setForgotOpen(true)}
                    className='forgot-password-button'
                  >
                    Şifremi Unuttum
                  </Button>
                </div>
              </form>
            </Box>
          </Fade>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle className='forgot-dialog-title'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon icon={faLock} style={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Şifre Sıfırlama Talebi
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent className='forgot-dialog-content'>
          <Typography variant="body2" className='forgot-dialog-description'>
            Lütfen kayıtlı e-posta adresinizi ve iletişim numaranızı girin. Talebiniz ekibimize iletilecek ve kısa sürede size dönüş yapılacaktır.
          </Typography>
          <form id="forgot-form" onSubmit={handleForgotSubmit} className='forgot-form'>
            <TextField
              label="E-Posta"
              type="email"
              fullWidth
              required
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#59018b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Telefon (opsiyonel)"
              fullWidth
              value={fpPhone}
              onChange={(e) => setFpPhone(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faPhone} style={{ color: '#59018b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Not (opsiyonel)"
              multiline
              minRows={3}
              fullWidth
              value={fpNote}
              onChange={(e) => setFpNote(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignItems: 'flex-start', pt: 1 }}>
                    <FontAwesomeIcon icon={faStickyNote} style={{ color: '#59018b' }} />
                  </InputAdornment>
                ),
              }}
            />
            {fpStatus && (
              <Alert
                severity={fpStatus.includes('alındı') ? 'success' : 'error'}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                {fpStatus}
              </Alert>
            )}
          </form>
        </DialogContent>
        <DialogActions className='forgot-dialog-actions'>
          <Button
            onClick={() => setForgotOpen(false)}
            variant="outlined"
            sx={{
              borderColor: '#59018b',
              color: '#59018b',
              '&:hover': {
                borderColor: '#490272',
                backgroundColor: 'rgba(89, 1, 139, 0.04)'
              }
            }}
          >
            İptal
          </Button>
          <Button
            type="submit"
            form="forgot-form"
            variant="contained"
            className='forgot-submit-button'
          >
            Talep Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
