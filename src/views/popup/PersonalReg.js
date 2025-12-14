import { TextField } from '@mui/material'
import React, { useState } from 'react'
import { Form, Input, Label } from 'reactstrap'
import '../scss/_personalreg.scss'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';

dayjs.locale('tr');
const PersonalReg = React.forwardRef((props, ref) => {
  const { t, lang } = useLanguage();
  React.useEffect(() => { dayjs.locale(lang === 'en' ? 'en' : 'tr'); }, [lang]);
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState(dayjs())
  const [role, setRole] = useState('')
  const [sex, setSex] = useState('')
  const [address, setAddress] = useState('')

  React.useImperativeHandle(ref, () => ({
    handleSave
  }));

  const handleSave = async () => {
    try {
      const response = await axiosInstance.post('/addpersonel', {
        name,
        surname,
        username,
        password,
        email,
        phone,
        birthDate,
        role,
        sex,
        address
      });
      if (response.data.status === 'success') {
        props.onClose(); // modalı kapat
        return true;     // başarıyla kaydedildi
      } else {
        console.log("Kayıt başarısız:", response.data.message);
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <Form>
        <div display="flex" flexDirection="row">
          <TextField
            style={{ width: '50%', marginRight: '1%' }}
            label={t('Name')}
            variant="outlined"
            margin='dense'
            size='small'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            style={{ width: '49%', marginleft: '1%' }}
            label={t('Surname')}
            variant="outlined"
            margin='dense'
            size='small'
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <div display="flex" flexDirection="row">
          <TextField
            margin='dense'
            type="text"
            label={t('Username')}
            variant="outlined"
            style={{ width: '50%', marginRight: '1%' }}
            size='small'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin='dense'
            type="password"
            label={t('Password')}
            variant="outlined"
            style={{ width: '49%', marginleft: '1%' }}
            size='small'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <TextField
          margin='dense'
          type="text"
          label={t('Email')}
          variant="outlined"
          fullWidth
          size='small'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          margin='dense'
          type="number"
          label={t('Phone')}
          variant="outlined"
          fullWidth
          size='small'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className='perreg-date'>
          <LocalizationProvider dateAdapter={AdapterDayjs}  >
            <DatePicker
              label={t('BirthDate')}
              sx={{ width: '100%' }}
              slotProps={{ textField: { size: 'small' } }}
              value={birthDate}
              onChange={(newValue) => {
                setBirthDate(newValue);
              }}
            />
          </LocalizationProvider>
        </div>

        <div className='perreg-relative-container'>
          <Label
            for="exampleSelect"
            className='perreg-custom-label'>{t('Role')} </Label>
          <div className='perreg-form-role-div'>
            <Input
              type="select"
              id="exampleSelect"
              name="select"
              style={{ backgroundColor: '#EEF5F9', width: '100%', height: '100%', border: 'none' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}>
              <option value="0">-</option>
              <option value="2">{t('Veterinarian')}</option>
              {/* <option value="3">Ofis Yönetici</option> */}
              <option value="3" style={{ color: 'red' }}>{t('ClinicManager')}</option>
            </Input>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Label
            for="exampleSelect"
            className='perreg-custom-label-2'>{t('Gender')} </Label>
          <div className='perreg-form-sex-div'>
            <div className='perreg-radio-div'>
              <Input
                name="radio1"
                type="radio"
                style={{ width: '25px', height: '25px', marginRight: '5px' }}
                checked={sex === 'Erkek'}
                onChange={(e) => setSex('Erkek')}
              />
              <Label className='perreg-label2' style={{ fontSize: '18px' }}>{t('Male')}</Label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                name="radio1"
                type="radio"
                style={{ width: '25px', height: '25px', marginRight: '5px' }}
                checked={sex === 'Kadın'}
                onChange={(e) => setSex('Kadın')}
              />
              <Label className='perreg-label2' style={{ fontSize: '18px' }}>{t('Female')}</Label>
            </div>
          </div>
        </div>

        <TextField
          type="text"
          label={t('Address')}
          variant="outlined"
          fullWidth
          size='small'
          rows={2}
          multiline
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Form>
    </div>
  )
});

export default PersonalReg
