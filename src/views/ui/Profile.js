import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
} from 'reactstrap';
import { Autocomplete, TextField, Grid } from '@mui/material';
import AuthContext from '../../context/usercontext.tsx';
import '../scss/_profile.scss';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import ChangePassword from '../popup/ChangePassword.js';
import axiosInstance from '../../api/axiosInstance.ts';
import { toast } from 'react-toastify';
import defaultAvatar from '../../assets/images/users/user5.jpg';

dayjs.locale('tr');

function Profile() {
  const [localimage, setLocalimage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { userName, userid, profileImage, setProfileImage } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Kullanıcı bilgileri
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [sex, setSex] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [username, setUsername] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (profileImage) {
      setLocalimage(profileImage);
      setLoading(false);
    }
    if (userid) {
      GetCountry();
      axiosInstance
        .get(`/getUser`, { params: { id: userid } })
        .then(response => {
          const user = response.data.user;
          if (user) {
            setName(user.name || '');
            setSurname(user.surname || '');
            setPhone(user.phone || '');
            setBirthDate(user.birthdate ? dayjs(user.birthdate) : null);
            setSex(user.sex || '');
            setEmail(user.email || '');
            setAddress(user.address || '');
            setTcNo(user.identity ? user.identity.toString() : '');
            setPassportNo(user.pass_number ? user.pass_number.toString() : '');
            setUsername(user.uname || '');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Kullanıcı bilgileri getirilirken bir hata oluştu:', error);
          setLoading(false);
        });
    }
  }, [userid, profileImage]);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleChangeProfileImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setLocalimage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    if (selectedFile) formData.append('picture', selectedFile);
    formData.append('userId', userid);
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('phone', phone);
    formData.append('birthDate', birthDate ? birthDate.format('YYYY-MM-DD') : '');
    formData.append('sex', sex);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('identity', tcNo);
    formData.append('pass_number', passportNo);
    formData.append('uname', username);

    try {
      const response = await axiosInstance.post('/update-profile', formData);
      if (response.data?.status === 'success') {
        setProfileImage(localimage);
        toast.success('Profil bilgileri başarıyla güncellendi!', { position: 'top-right', autoClose: 3000 });
      } else {
        throw new Error(response.data?.error || 'Sunucu hatası');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil bilgileri güncellenirken bir hata oluştu!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const togglePasswordModal = () => setIsPasswordModalOpen(!isPasswordModalOpen);

  const GetCountry = async () => {
    try {
      const response = await axiosInstance.get('/getCountry');
      setCountries(response.data.countries || []);
    } catch (error) {
      console.error('Ülke listesi alınırken hata oluştu:', error);
    }
  };

  if (loading) return null;

  return (
    <div>
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0">
          <h4>👤 Profilim</h4>
        </CardTitle>
        <CardBody>
          <div className="pro-main-div" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div
              className="pro-alt-div"
              style={{ flex: '1 1 250px', minWidth: 250, maxWidth: 300, textAlign: 'center' }}
            >
              <div className="pro-image-div" style={{ marginBottom: 15 }}>
                <img
                  src={localimage || defaultAvatar}
                  alt="Profil Resmi"
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              </div>
              <FormGroup>
                <Label style={{ fontSize: 20, fontWeight: 'bold' }}>{userName}</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleChangeProfileImage}
                />
                <Button color="success" block onClick={handleFileSelect}>
                  Dosya Seç
                </Button>
                <Button color="primary" block className="mt-3" onClick={togglePasswordModal}>
                  Şifre Değiştir
                </Button>
              </FormGroup>
            </div>

            <div className="pro-alt-form-div" style={{ flex: '2 1 500px', minWidth: 300 }}>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Adın"
                      variant="outlined"
                      margin="normal"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Soyadın"
                      variant="outlined"
                      margin="normal"
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefon Numarası"
                      variant="outlined"
                      type="tel"
                      margin="normal"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-Posta Adresi"
                      variant="outlined"
                      margin="normal"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="TC Kimlik No"
                      variant="outlined"
                      type="text"
                      margin="normal"
                      value={tcNo}
                      onChange={(e) => setTcNo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Pasaport No"
                      variant="outlined"
                      margin="normal"
                      type="text"
                      value={passportNo}
                      onChange={(e) => setPassportNo(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Kullanıcı Adı"
                      variant="outlined"
                      margin="normal"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Doğum Tarihi"
                        value={birthDate}
                        onChange={setBirthDate}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>

                <Autocomplete
                  style={{ width: '100%', marginTop: 15 }}
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Ülke Seçin" variant="outlined" />}
                />

                <div
                  style={{
                    position: 'relative',
                    marginBottom: 20,
                    marginTop: 15,
                  }}
                >
                  <Label
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: 10,
                      background: 'white',
                      padding: '0 5px',
                      fontSize: 13,
                      color: '#666666',
                    }}
                  >
                    Cinsiyet
                  </Label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      padding: 10,
                    }}
                    className="pro-form-sex-div"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 20 }}>
                      <Input
                        name="radio1"
                        type="radio"
                        style={{ width: 25, height: 25, marginRight: 5 }}
                        checked={sex === 'Erkek'}
                        onChange={() => setSex('Erkek')}
                      />
                      <Label className="pro-label2" style={{ fontSize: 18 }}>
                        Erkek
                      </Label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        name="radio1"
                        type="radio"
                        style={{ width: 25, height: 25, marginRight: 5 }}
                        checked={sex === 'Kadın'}
                        onChange={() => setSex('Kadın')}
                      />
                      <Label className="pro-label2" style={{ fontSize: 18 }}>
                        Kadın
                      </Label>
                    </div>
                  </div>
                </div>

                <TextField
                  label="Adres"
                  multiline
                  maxRows={4}
                  fullWidth
                  variant="outlined"
                  rows={4}
                  margin="normal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <Button color="primary" className="mt-3" size="lg" fullWidth onClick={handleSaveProfile}>
                  Kaydet
                </Button>
              </form>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Şifre değiştirme modal */}
      <Modal isOpen={isPasswordModalOpen} toggle={togglePasswordModal}>
        <ModalHeader toggle={togglePasswordModal}>Şifre Değiştir</ModalHeader>
        <ModalBody>
          <ChangePassword />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={togglePasswordModal}>
            Kapat
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Profile;
