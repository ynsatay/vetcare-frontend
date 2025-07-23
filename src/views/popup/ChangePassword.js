import { TextField, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { Button } from 'reactstrap'
import AuthContext from '../../context/usercontext.tsx'
import axiosInstance from '../../api/axiosInstance.ts'

function ChangePassword() {
  const { userid} = useContext(AuthContext);
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
          label="Mevcut şifre"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Yeni şifre"
          variant="outlined"
          margin="normal"
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Yeni şifre tekrar"
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
            >Şifre Güncelle</Button>
        </div>
        {message && <Typography color={messageColor} style={{ marginTop: '16px' }}>{message}</Typography>}
     
    </div>
    </>
  )
}

export default ChangePassword