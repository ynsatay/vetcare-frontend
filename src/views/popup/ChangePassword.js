import { TextField, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { Button } from 'reactstrap'
import AuthContext from '../../context/usercontext.tsx'
import axiosInstance from '../../api/axiosInstance.ts'
import { useLanguage } from '../../context/LanguageContext.js'

function ChangePassword() {
  const { userid} = useContext(AuthContext);
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const handlePasswordChange = () => {
    axiosInstance.post('change-password', {
      userid,
      oldPassword,
      password,
      passwordAgain 
    }).then((response) => {
      setMessage(response.data.message)
      setMessageColor('green')
    }).catch((error) => {
      setMessage(error.response.data.message)
      setMessageColor('red')
    })
  }

  return (
    <>
    <div>  
        <TextField
          type="password"
          label={t('CurrentPassword')}
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          type="password"
          label={t('NewPassword')}
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          type="password"
          label={t('RepeatNewPassword')}
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={(e) => setPasswordAgain(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            >{t('UpdatePassword')}</Button>
        </div>
        {message && <Typography color={messageColor} style={{ marginTop: '16px' }}>{message}</Typography>}
     
    </div>
    </>
  )
}

export default ChangePassword
