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
import { useLanguage } from '../../context/LanguageContext.js';


const Login = () => {
  const { t, setLanguage, lang } = useLanguage();
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
  const [fpStatusType, setFpStatusType] = useState('error');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const m = document.cookie.match(new RegExp('(^| )vetcare_lang=([^;]+)'));
      const saved = m ? m[2] : null;
      if (saved && (saved === 'en' || saved === 'tr') && saved !== lang) {
        setLanguage(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/public_hr_offices`);
        setOffices(res.data);

        if (res.data.length > 0) {
          setSelectedOffice(res.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
      }
    };

    fetchOffices();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (username === '' || password === '') {
      setMessage(t('UsernameAndPasswordRequired'));
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

      try {
        document.cookie = `vetcare_lang=;path=/;max-age=0`;
        document.cookie = `vetcare_lang=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        localStorage.removeItem('language');
        const rawLang =
          response?.data?.language ??
          response?.data?.lang ??
          response?.data?.userLanguage ??
          response?.data?.i18nLanguage ??
          response?.data?.settings?.language ??
          response?.data?.user?.language;
        let accLang = null;
        if (typeof rawLang === 'string') {
          accLang = rawLang.toLowerCase();
        } else if (typeof rawLang === 'number') {
          accLang = rawLang === 1 ? 'en' : 'tr';
        }
        if (accLang === 'en' || accLang === 'tr') {
          document.cookie = `vetcare_lang=${accLang};path=/;max-age=31536000`;
          localStorage.setItem('language', accLang);
          setLanguage(accLang);
        }
      } catch {}

      setMessage(t('LoginSuccessful'));
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
        setMessage(`${t('ErrorLabel')}: ${error.response.data.error}`);
      } else {
        setMessage(t('ErrorTryAgain'));
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
        setFpStatus(t('EmailNotRegistered'));
        setFpStatusType('error');
        return;
      }
    } catch (error) {
      console.error('Mail control error:', error);
      setFpStatus(t('EmailVerificationError'));
      setFpStatusType('error');
      return;
    }
    try {
      await axios.post(`${BASE_URL}/forgot-password-request`, {
        email: fpEmail,
        phone: fpPhone,
        note: fpNote,
      });
      setFpStatus(t('RequestReceived'));
      setFpStatusType('success');
      setFpEmail('');
      setFpPhone('');
      setFpNote('');
      setTimeout(() => setForgotOpen(false), 2000);
    } catch (error) {
      console.error('Forgot password request error:', error);
      setFpStatus(t('RequestFailedTryLater'));
      setFpStatusType('error');
    }
  };

  const features = [
    { icon: faHeartbeat, text: t('LoginFeaturePatientTracking'), color: '#ff6b6b' },
    { icon: faCalendarCheck, text: t('LoginFeatureAppointmentManagement'), color: '#4ecdc4' },
    { icon: faFileMedical, text: t('LoginFeatureDigitalFile'), color: '#45b7d1' },
    { icon: faChartLine, text: t('LoginFeatureReporting'), color: '#f9ca24' },
    { icon: faShieldAlt, text: t('LoginFeatureSecureSystem'), color: '#6c5ce7' },
    { icon: faUsers, text: t('LoginFeatureTeamManagement'), color: '#a29bfe' }
  ];

  const stats = [
    { number: '10K+', label: t('ActivePatients') },
    { number: '500+', label: t('Veterinarians') },
    { number: '50+', label: t('Clinics') },
    { number: '99%', label: t('Satisfaction') }
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
                  {t('VeterinaryManagementSystem')}
                </Typography>
                <Typography variant="body1" className='features-subtitle'>
                  {t('FeaturesHeroSubtitle')}
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
                  <span>{t('SecuredAndEncrypted')}</span>
                </div>
                <div className='trust-badge'>
                  <FontAwesomeIcon icon={faClock} className='trust-icon' />
                  <span>{t('Support247')}</span>
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
                  {t('Welcome')}
                </Typography>
                <Typography variant="body2" className='login-subtitle'>
                  {t('LoginSubtitle')}
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
                    <InputLabel id="office-select-label">{t('SelectOffice')}</InputLabel>
                    <Select
                      labelId="office-select-label"
                      value={selectedOffice}
                      label={t('SelectOffice')}
                      onChange={e => setSelectedOffice(e.target.value)}
                    >
                      {offices.map(office => (
                        <MenuItem key={office.id} value={office.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {office.name || `${t('Office')} #${office.id}`}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  className='login-form-field'
                  label={t('Username')}
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
                  label={t('Password')}
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
                      {t('LoggingIn')}
                    </>
                  ) : (
                    t('Login')
                  )}
                </Button>

                <div className='login-forgot-password'>
                  <Button
                    variant="text"
                    size="small"
                  onClick={() => setForgotOpen(true)}
                  className='forgot-password-button'
                >
                  {t('ForgotPassword')}
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
              {t('PasswordResetRequest')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent className='forgot-dialog-content'>
          <Typography variant="body2" className='forgot-dialog-description'>
            {t('ForgotDialogDescription')}
          </Typography>
          <form id="forgot-form" onSubmit={handleForgotSubmit} className='forgot-form'>
            <TextField
              label={t('Email')}
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
              label={t('PhoneOptional')}
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
              label={t('NoteOptional')}
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
                severity={fpStatusType}
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
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            form="forgot-form"
            variant="contained"
            className='forgot-submit-button'
          >
            {t('SubmitRequest')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
