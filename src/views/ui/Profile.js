import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
// Icons will be replaced with emoji for now since @mui/icons-material is not available
import AuthContext from '../../context/usercontext.tsx';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import axiosInstance from '../../api/axiosInstance.ts';
import { toast } from 'react-toastify';
import defaultAvatar from '../../assets/images/users/user5.jpg';

dayjs.locale('tr');

function Profile() {
  const { userid, profileImage, setProfileImage } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    phone: '',
    birthdate: null,
    sex: '',
    address: '',
    identity: '',
    pass_number: ''
  });

  const [original, setOriginal] = useState(null);
  const [localimage, setLocalimage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profileImage) setLocalimage(profileImage);
  }, [profileImage]);

  useEffect(() => {
    if (!(userid && userid > 0)) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        await axiosInstance.get('/getCountry').catch(() => null);
        const userRes = await axiosInstance.get('/getUser', { params: { id: userid } });
        const user = userRes.data?.user || userRes.data || null;
        if (user) {
          const mapped = {
            name: user.name || '',
            surname: user.surname || '',
            username: user.username || user.uname || '',
            email: user.email || '',
            phone: user.phone || '',
            birthdate: user.birthdate ? dayjs(user.birthdate) : null,
            sex: user.sex || '',
            address: user.address || '',
            identity: user.identity ? user.identity.toString() : '',
            pass_number: user.pass_number ? user.pass_number.toString() : ''
          };
          setValues(mapped);
          setOriginal(mapped);
          if (user.picture) setLocalimage(`data:image/png;base64,${user.picture}`);
        }
      } catch (err) {
        console.error('Profil verisi alınırken hata:', err);
        toast.error('Profil verileri alınırken bir hata oluştu', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userid]);

  const onSelectFile = () => fileInputRef.current && fileInputRef.current.click();
  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setLocalimage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (key) => (e) => {
    const val = e && e.target ? e.target.value : e;
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const resetProfile = () => {
    if (original) {
      setValues(original);
      setSelectedFile(null);
      setLocalimage(profileImage || defaultAvatar);
    }
  };

  const isDirty = useMemo(() => {
    if (!original) return false;
    const keys = Object.keys(original);
    for (const k of keys) {
      const a = original[k] instanceof dayjs ? original[k].format() : original[k];
      const b = values[k] instanceof dayjs ? values[k].format() : values[k];
      if ((a || '') !== (b || '')) return true;
    }
    if (selectedFile) return true;
    return false;
  }, [original, values, selectedFile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('picture', selectedFile);
      formData.append('userId', userid);
      formData.append('name', values.name);
      formData.append('surname', values.surname);
      formData.append('phone', values.phone);
      formData.append('birthDate', values.birthdate ? values.birthdate.format('YYYY-MM-DD') : '');
      formData.append('sex', values.sex);
      formData.append('email', values.email);
      formData.append('address', values.address);
      formData.append('identity', values.identity);
      formData.append('pass_number', values.pass_number);
      formData.append('uname', values.username);

      const response = await axiosInstance.post('/update-profile', formData);
      if (response.data?.status === 'success') {
        setProfileImage(localimage);
        setOriginal({ ...values });
        setSelectedFile(null);
        toast.success('Profil başarıyla güncellendi', { autoClose: 2500 });
      } else {
        throw new Error(response.data?.error || 'Güncelleme başarısız');
      }
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      toast.error('Profil güncellenirken hata oluştu', { autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #ffffff 2px, transparent 2px),
            radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px',
          animation: 'float 20s ease-in-out infinite'
        }} />

        <Box sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          {/* Creative loading animation */}
          <Box sx={{
            position: 'relative',
            width: 120,
            height: 120,
            mb: 3
          }}>
            {/* Outer ring */}
            <Box sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTop: '3px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 2s linear infinite'
            }} />

            {/* Inner ring */}
            <Box sx={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              width: '90px',
              height: '90px',
              border: '2px solid rgba(255,255,255,0.1)',
              borderBottom: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin-reverse 1.5s linear infinite'
            }} />

            {/* Center dot */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '20px',
              height: '20px',
              background: 'linear-gradient(45deg, #ffffff, rgba(255,255,255,0.8))',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px rgba(255,255,255,0.5)',
              animation: 'pulse 1s ease-in-out infinite'
            }} />
          </Box>

          <Typography variant="h4" sx={{
            color: 'white',
            fontWeight: 700,
            mb: 1,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            Profilin Hazırlanıyor
          </Typography>

          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 400,
            mb: 2
          }}>
            Kişisel bilgilerin yükleniyor...
          </Typography>

          {/* Progress dots */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
                }}
              />
            ))}
          </Box>
        </Box>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(5px) rotate(-1deg); }
          }

          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 15% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 10%, rgba(240, 147, 251, 0.08) 0%, transparent 45%),
        linear-gradient(180deg, #f7f9fc 0%, #fefefe 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header removed as requested */}

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 4 }, pb: 6 }}>
        <Grid container spacing={4} sx={{ mt: { xs: 2, md: 3 } }}>
          {/* Creative Profile Card */}
          <Grid item xs={12} md={4}>
            <Zoom in timeout={600}>
              <Card sx={{
                borderRadius: 4,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                position: 'sticky',
                top: 24,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.08)'
                }
              }}>
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  {/* Profile Image Section */}
                  <Box sx={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #fdf2f8 100%)',
                    height: 140,
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      position: 'relative',
                      zIndex: 2,
                      textAlign: 'center'
                    }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={localimage || defaultAvatar}
                          sx={{
                            width: 120,
                            height: 120,
                            border: '4px solid rgba(255,255,255,0.9)',
                            boxShadow: `
                              0 10px 40px rgba(0,0,0,0.3),
                              0 0 0 1px rgba(255,255,255,0.2),
                              inset 0 1px 0 rgba(255,255,255,0.3)
                            `,
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: `
                                0 15px 60px rgba(0,0,0,0.4),
                                0 0 0 1px rgba(255,255,255,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.4)
                              `
                            }
                          }}
                        />

                        {/* Creative Upload Button */}
                        <Box
                          onClick={onSelectFile}
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: -8,
                            width: 44,
                            height: 44,
                            background: 'linear-gradient(135deg, #667eea 0%, #a5b4fc 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 12px 28px rgba(102, 126, 234, 0.35)'
                            },
                            '&:active': {
                              transform: 'scale(0.96)'
                            }
                          }}
                        >
                          <Typography sx={{
                            fontSize: 20,
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          }}>
                            📷
                          </Typography>
                        </Box>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={onFileChange}
                          style={{ display: 'none' }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Profile Info */}
                  <Box sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{
                      mb: 1,
                      background: 'linear-gradient(135deg, #1a202c 0%, #4a5568 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      {values.name} {values.surname}
                    </Typography>

                    <Typography variant="body1" sx={{
                      color: '#718096',
                      mb: 3,
                      fontWeight: 500,
                      opacity: 0.8
                    }}>
                      @{values.username}
                    </Typography>

                    {/* Creative Contact Info */}
                    <Stack spacing={2}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'center',
                        p: 2,
                        background: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(102,126,234,0.08)'
                        }
                      }}>
                        <Box sx={{
                          color: '#667eea',
                          fontSize: 20,
                          p: 1,
                          background: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          ✉️
                        </Box>
                        <Box sx={{ textAlign: 'left', flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                            E-posta
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                            {values.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'center',
                        p: 2,
                        background: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(240,147,251,0.08)'
                        }
                      }}>
                        <Box sx={{
                          color: '#f093fb',
                          fontSize: 20,
                          p: 1,
                          background: 'rgba(240, 147, 251, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          📞
                        </Box>
                        <Box sx={{ textAlign: 'left', flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                            Telefon
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                            {values.phone || 'Belirtilmemiş'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'center',
                        p: 2,
                        background: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(245,87,108,0.08)'
                        }
                      }}>
                        <Box sx={{
                          color: '#f5576c',
                          fontSize: 20,
                          p: 1,
                          background: 'rgba(245, 87, 108, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          📅
                        </Box>
                        <Box sx={{ textAlign: 'left', flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                            Doğum Tarihi
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                            {values.birthdate ? values.birthdate.format('DD/MM/YYYY') : 'Belirtilmemiş'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.1)' }} />

                    {/* Creative Quick Actions */}
                    <Typography variant="h6" fontWeight="bold" sx={{
                      mb: 3,
                      color: '#2d3748',
                      textAlign: 'center'
                    }}>
                      ⚡ Hızlı İşlemler
                    </Typography>

                    <Stack spacing={1.5}>
                      {[
                        { icon: '⚙️', label: 'Hesap Ayarları', color: '#667eea' },
                        { icon: '🔔', label: 'Bildirimler', color: '#f093fb' },
                        { icon: '🔒', label: 'Güvenlik', color: '#f5576c' },
                        { icon: '🎨', label: 'Tema', color: '#4facfe' }
                      ].map((action, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          startIcon={
                            <Box sx={{
                              fontSize: 16,
                              background: `${action.color}20`,
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1
                            }}>
                              {action.icon}
                            </Box>
                          }
                          sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            p: 2,
                            border: `1px solid ${action.color}30`,
                            color: action.color,
                            background: `${action.color}08`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: `${action.color}15`,
                              borderColor: `${action.color}50`,
                              transform: 'translateX(4px)',
                              boxShadow: `0 4px 12px ${action.color}20`
                            }
                          }}
                        >
                          <Typography variant="body2" fontWeight="500">
                            {action.label}
                          </Typography>
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                </CardContent>

                <style>{`
                  @keyframes backgroundShift {
                    0%, 100% { background-position: 0% 0%; }
                    50% { background-position: 100% 100%; }
                  }

                  @keyframes rotateSlow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }

                  @keyframes buttonPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(245, 87, 108, 0.6); }
                  }
                `}</style>
              </Card>
            </Zoom>
          </Grid>

          {/* Creative Main Content */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Personal Information Card */}
              <Fade in timeout={800}>
                <Card sx={{
                  borderRadius: 4,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #667eea 0%, #f093fb 50%, #f5576c 100%)'
                  },
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08)'
                  }
                }}>
                  <CardHeader
                    title={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative'
                      }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                          animation: 'iconFloat 3s ease-in-out infinite'
                        }}>
                          <Typography sx={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                            👤
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h5" fontWeight="bold" sx={{
                            color: '#1a202c',
                            mb: 0.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            Kişisel Bilgiler
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.9rem' }}>
                            Temel bilgilerinizi düzenleyin
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      background: 'rgba(248, 250, 252, 0.8)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                      pb: 3
                    }}
                  />

                  <CardContent sx={{ p: 4 }}>
                    {/* Creative Form Layout */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 3,
                      mb: 3
                    }}>
                      {/* Name & Surname Row */}
                      <Box sx={{
                        gridColumn: { xs: '1', md: '1 / -1' },
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 3
                      }}>
                        <TextField
                          fullWidth
                          label="Ad"
                          value={values.name}
                          onChange={handleChange('name')}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <Box sx={{
                                mr: 1.5,
                                color: '#667eea',
                                fontSize: 20,
                                animation: 'labelPulse 2s ease-in-out infinite'
                              }}>
                                👤
                              </Box>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(255,255,255,0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(102, 126, 234, 0.1)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.9)',
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255,255,255,0.95)',
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                transform: 'translateY(-2px)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: '#718096',
                              fontWeight: 500,
                              '&.Mui-focused': { color: '#667eea' }
                            }
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Soyad"
                          value={values.surname}
                          onChange={handleChange('surname')}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <Box sx={{
                                mr: 1.5,
                                color: '#f093fb',
                                fontSize: 20,
                                animation: 'labelPulse 2s ease-in-out infinite 0.5s'
                              }}>
                                👥
                              </Box>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: 'rgba(255,255,255,0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(240, 147, 251, 0.1)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.9)',
                                borderColor: 'rgba(240, 147, 251, 0.3)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.15)'
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255,255,255,0.95)',
                                borderColor: '#f093fb',
                                boxShadow: '0 0 0 3px rgba(240, 147, 251, 0.1)',
                                transform: 'translateY(-2px)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: '#718096',
                              fontWeight: 500,
                              '&.Mui-focused': { color: '#f093fb' }
                            }
                          }}
                        />
                      </Box>

                      {/* Username & Email */}
                      <TextField
                        fullWidth
                        label="Kullanıcı Adı"
                        value={values.username}
                        onChange={handleChange('username')}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{
                              mr: 1.5,
                              color: '#4facfe',
                              fontSize: 18,
                              animation: 'labelPulse 2s ease-in-out infinite 1s'
                            }}>
                              @
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(74, 172, 254, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.9)',
                              borderColor: 'rgba(74, 172, 254, 0.3)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(74, 172, 254, 0.15)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255,255,255,0.95)',
                              borderColor: '#4facfe',
                              boxShadow: '0 0 0 3px rgba(74, 172, 254, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                            fontWeight: 500,
                            '&.Mui-focused': { color: '#4facfe' }
                          }
                        }}
                        disabled
                      />

                      <TextField
                        fullWidth
                        label="E-posta"
                        type="email"
                        value={values.email}
                        onChange={handleChange('email')}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{
                              mr: 1.5,
                              color: '#f5576c',
                              fontSize: 18,
                              animation: 'labelPulse 2s ease-in-out infinite 1.5s'
                            }}>
                              ✉️
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(245, 87, 108, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.9)',
                              borderColor: 'rgba(245, 87, 108, 0.3)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(245, 87, 108, 0.15)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255,255,255,0.95)',
                              borderColor: '#f5576c',
                              boxShadow: '0 0 0 3px rgba(245, 87, 108, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                            fontWeight: 500,
                            '&.Mui-focused': { color: '#f5576c' }
                          }
                        }}
                      />

                      {/* Phone & Birth Date */}
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={values.phone}
                        onChange={handleChange('phone')}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{
                              mr: 1.5,
                              color: '#00d4aa',
                              fontSize: 18,
                              animation: 'labelPulse 2s ease-in-out infinite 2s'
                            }}>
                              📞
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 212, 170, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.9)',
                              borderColor: 'rgba(0, 212, 170, 0.3)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255,255,255,0.95)',
                              borderColor: '#00d4aa',
                              boxShadow: '0 0 0 3px rgba(0, 212, 170, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                            fontWeight: 500,
                            '&.Mui-focused': { color: '#00d4aa' }
                          }
                        }}
                      />

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Doğum Tarihi"
                          value={values.birthdate}
                          onChange={(d) => setValues(prev => ({ ...prev, birthdate: d }))}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputProps: {
                                startAdornment: (
                                  <Box sx={{
                                    mr: 1.5,
                                    color: '#ff9500',
                                    fontSize: 18,
                                    animation: 'labelPulse 2s ease-in-out infinite 2.5s'
                                  }}>
                                    📅
                                  </Box>
                                )
                              },
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  background: 'rgba(255,255,255,0.8)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 149, 0, 0.1)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.9)',
                                    borderColor: 'rgba(255, 149, 0, 0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(255, 149, 0, 0.15)'
                                  },
                                  '&.Mui-focused': {
                                    background: 'rgba(255,255,255,0.95)',
                                    borderColor: '#ff9500',
                                    boxShadow: '0 0 0 3px rgba(255, 149, 0, 0.1)',
                                    transform: 'translateY(-2px)'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  color: '#718096',
                                  fontWeight: 500,
                                  '&.Mui-focused': { color: '#ff9500' }
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>

                    {/* Gender Selection - Creative Design */}
                    <Box sx={{
                      mb: 3,
                      p: 3,
                      background: '#f8fafc',
                      borderRadius: 3,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{
                        mb: 2,
                        color: '#2d3748',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{ color: '#667eea', fontSize: 20 }}>⚧️</Box>
                        Cinsiyet
                      </Typography>

                      <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap'
                      }}>
                        {[
                          { value: '', label: 'Belirtmek İstemiyorum', emoji: '🤷‍♂️', color: '#718096' },
                          { value: 'Erkek', label: 'Erkek', emoji: '👨', color: '#667eea' },
                          { value: 'Kadın', label: 'Kadın', emoji: '👩', color: '#f093fb' },
                          { value: 'Diğer', label: 'Diğer', emoji: '🧑', color: '#4facfe' }
                        ].map((option) => (
                          <Box
                            key={option.value}
                            onClick={() => setValues(prev => ({ ...prev, sex: option.value }))}
                            sx={{
                              flex: '1',
                              minWidth: '140px',
                              p: 2,
                              borderRadius: 3,
                              border: `2px solid ${values.sex === option.value ? option.color : 'rgba(255,255,255,0.3)'}`,
                              background: values.sex === option.value
                                ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)`
                                : 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              textAlign: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${option.color}20, transparent)`,
                                transition: 'left 0.5s ease'
                              },
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: `0 8px 25px ${option.color}20`,
                                borderColor: option.color,
                                '&::before': { left: '100%' }
                              },
                              ...(values.sex === option.value && {
                                boxShadow: `0 4px 15px ${option.color}30`,
                                transform: 'translateY(-2px)'
                              })
                            }}
                          >
                            <Typography sx={{
                              fontSize: 24,
                              mb: 1,
                              opacity: values.sex === option.value ? 1 : 0.7
                            }}>
                              {option.emoji}
                            </Typography>
                            <Typography variant="body2" fontWeight="500" sx={{
                              color: values.sex === option.value ? option.color : '#4a5568'
                            }}>
                              {option.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Address Field - Creative Design */}
                    <Box sx={{
                      position: 'relative',
                      '& .MuiTextField-root': {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          minHeight: '120px',
                          alignItems: 'flex-start',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.9)',
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                          },
                          '&.Mui-focused': {
                            background: 'rgba(255,255,255,0.95)',
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                            transform: 'translateY(-2px)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#718096',
                          fontWeight: 500,
                          '&.Mui-focused': { color: '#667eea' }
                        }
                      }
                    }}>
                      <TextField
                        fullWidth
                        label="Adres"
                        multiline
                        rows={4}
                        value={values.address}
                        onChange={handleChange('address')}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <Box sx={{
                              mr: 1.5,
                              mt: 1.5,
                              color: '#667eea',
                              fontSize: 20,
                              animation: 'labelPulse 2s ease-in-out infinite 3s'
                            }}>
                              📍
                            </Box>
                          )
                        }}
                      />
                    </Box>
                  </CardContent>

                  <style>{`
                    @keyframes iconFloat {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      50% { transform: translateY(-5px) rotate(5deg); }
                    }

                    @keyframes labelPulse {
                      0%, 100% { transform: scale(1); opacity: 0.8; }
                      50% { transform: scale(1.1); opacity: 1; }
                    }
                  `}</style>
                </Card>
              </Fade>

              {/* Identity & Security Card */}
              <Fade in timeout={1000}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0'
                }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: '#667eea' }}>🆔</Box>
                        <Typography variant="h6" fontWeight="bold">
                          Kimlik & Güvenlik
                        </Typography>
                      </Box>
                    }
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      '& .MuiCardHeader-title': { fontSize: '1.1rem' }
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="TC Kimlik No"
                          value={values.identity}
                          onChange={handleChange('identity')}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Pasaport No"
                          value={values.pass_number}
                          onChange={handleChange('pass_number')}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Action Buttons */}
              <Fade in timeout={1200}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  position: 'sticky',
                  bottom: 24,
                  zIndex: 10
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isDirty && (
                          <Typography variant="body2" sx={{ color: '#718096', fontStyle: 'italic' }}>
                            Kaydedilmemiş değişiklikler var
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={resetProfile}
                          disabled={!isDirty || saving}
                          startIcon={<span>❌</span>}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            '&:hover': { backgroundColor: '#f7fafc' }
                          }}
                        >
                          İptal
                        </Button>

                        <Button
                          variant="contained"
                          onClick={handleSaveProfile}
                          disabled={!isDirty || saving}
                          startIcon={saving ? undefined : <span>💾</span>}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease',
                            fontWeight: 600
                          }}
                        >
                          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Profile;
