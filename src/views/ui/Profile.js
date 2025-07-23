import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, CardTitle, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Autocomplete, FormGroup, TextField } from '@mui/material';
import AuthContext from '../../context/usercontext.tsx';
import "../scss/_profile.scss";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import ChangePassword from '../popup/ChangePassword.js';
import { Grid } from '@material-ui/core';
import axiosInstance from '../../api/axiosInstance.ts';
import { toast } from 'react-toastify';


dayjs.locale('tr');
function Profile() {
  const [localimage, setLocalimage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { userName, userid, profileImage, setProfileImage } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurmame] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(dayjs());
  const [sex, setSex] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (profileImage) {
      setLocalimage(profileImage);
      setLoading(false);
    }
    if (userid) {
      GetCountry();
      axiosInstance.get(`/getUser`, { params: { id: userid } })
        .then(response => {
          const user = response.data.user;
          if (user) {
            setName(user.name);
            setSurmame(user.surname);
            setPhone(user.phone);
            setBirthDate(dayjs(user.birthDate));
            setSex(user.sex);
            setEmail(user.email);
            if (user.address) setAddress(user.address);
          }
        })
        .catch(error => {
          console.error('Kullanıcı bilgileri getirilirken bir hata oluştu:', error);
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
  formData.append('picture', selectedFile);
  formData.append('userId', userid);
  formData.append('name', name);
  formData.append('surname', surname);
  formData.append('phone', phone);
  formData.append('birthDate', birthDate);
  formData.append('sex', sex);
  formData.append('email', email);
  formData.append('address', address);

  try {
    const response = await axiosInstance.post('/update-profile', formData);
    console.log("Profil güncelleme yanıtı:", response.data?.status);

    if (response.data?.status === 'success') {
      setProfileImage(localimage);
      toast.success("Profil bilgileri başarıyla güncellendi!", {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      throw new Error(response.data?.error || "Sunucu hatası");
    }

  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    toast.error('Profil bilgileri güncellenirken bir hata oluştu!', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
};


  const togglePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

  const GetCountry = async () => {
    try {
      const response = await axiosInstance.get('/getCountry');
      const countryList = response.data.countries || [];
      setCountries(countryList);
    } catch (error) {
      console.error('Ülke listesi alınırken hata oluştu:', error);
    }
  };


  if (loading) {
    return <></>;
  }

  return (
    <div>
      <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0">
          <h4>Profilim</h4>
        </CardTitle>
        <CardBody>
          <div className='pro-main-div'>
            <div className='pro-alt-div'>
              <div className='pro-image-div'>
                <img src={localimage} alt="Profil Resmi" />
              </div>
              <div style={{ marginTop: '20px' }}>
                <FormGroup>
                  <Label style={{ width: '100%', display: 'flex', justifyContent: 'center', fontSize: '20px' }} >{userName}</Label>
                  <input
                    type="file"
                    id="exampleFile"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleChangeProfileImage}
                  />
                  <Button
                    color='success'
                    onClick={handleFileSelect} >Dosya Seç</Button>
                  <Button
                    color="primary"
                    className="mt-3"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={togglePasswordModal}>Şifre Değiştir</Button>
                </FormGroup>
              </div>
            </div>
            <div className='pro-alt-form-div'>
              <form>
                <div display="flex" flexDirection="row">
                  <TextField
                    style={{ width: '50%', marginRight: '1%' }}
                    label="Adın"
                    variant="outlined"
                    margin="normal"
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField
                    style={{ width: '49%', marginleft: '1%' }}
                    label="Soyadın"
                    variant="outlined"
                    margin="normal"
                    value={surname}
                    onChange={(e) => setSurmame(e.target.value)}
                  />
                </div>
                <div display="flex" flexDirection="row">
                  <TextField
                    style={{ width: '50%', marginRight: '1%' }}
                    label="Telefon Numarası"
                    variant="outlined"
                    type='number'
                    margin="normal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <TextField
                    style={{ width: '49%', marginleft: '1%' }}
                    label="E-Posta Adresi"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div display="flex" flexDirection="row">
                  <TextField
                    style={{ width: '50%', marginRight: '1%' }}
                    label="Tc No"
                    variant="outlined"
                    type='number'
                    margin="normal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <TextField
                    style={{ width: '49%', marginleft: '1%' }}
                    label="Pasaport No"
                    variant="outlined"
                    margin="normal"
                    type='number'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Grid container spacing={2} border="1px solid black">
                  <TextField
                    style={{ width: '49%', marginLeft: '1%' }}
                    label="Kullanıcı Adı"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div style={{ width: '48%', marginRight: '1%', marginLeft: "1%", marginTop: "15px" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}   >
                      <DatePicker
                        label="Doğum Tarihi"
                        sx={{ width: '100%' }}
                        value={birthDate}
                        onChange={(e) => setBirthDate(e)} />
                    </LocalizationProvider>
                  </div>
                </Grid>


                <Autocomplete
                  style={{ width: '50%', marginRight: '1%', marginTop: "15px" }}
                  margin="normal"
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Ülke Seçin" />}
                />


                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <Label
                    for="exampleSelect"

                    style={{ position: 'absolute', top: '-10px', left: '10px', background: 'white', padding: '0 5px', fontSize: '13px', color: '#666666' }}>Cinsiyet </Label>

                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '10px' }} className='pro-form-sex-div'>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                      <Input
                        name="radio1"
                        type="radio"
                        style={{ width: '25px', height: '25px', marginRight: '5px' }}
                        checked={sex === 'Erkek'}
                        onChange={(e) => setSex('Erkek')}
                      />
                      <Label className='pro-label2' style={{ fontSize: '18px' }}>Erkek</Label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        name="radio1"
                        type="radio"
                        style={{ width: '25px', height: '25px', marginRight: '5px' }}
                        checked={sex === 'Kadın'}
                        onChange={(e) => setSex('Kadın')}
                      />
                      <Label className='pro-label2' style={{ fontSize: '18px' }}>Kadın</Label>
                    </div>
                  </div>
                </div>



                <TextField
                  id="outlined-multiline-flexible"
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


                <Button
                  color="primary"
                  className="mt-3"
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={handleSaveProfile}
                >Kaydet
                </Button>
              </form>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Şifre değiştirme ekranı Modal açılması */}
      <Modal isOpen={isPasswordModalOpen} toggle={togglePasswordModal}>
        <ModalHeader toggle={togglePasswordModal}>Şifre Değiştir</ModalHeader>
        <ModalBody>
          <ChangePassword />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={togglePasswordModal}>Kapat</Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}

export default Profile;