import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
const AccountSettingsModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState({ name: '', surname: '', username: '', email: '', phone: '', language: 'tr' });
  useEffect(() => {
    setForm({
      name: initial?.name || '',
      surname: initial?.surname || '',
      username: initial?.username || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      language: initial?.language || (typeof window !== 'undefined' ? (localStorage.getItem('language') || 'tr') : 'tr')
    });
  }, [initial, open]);
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#a5b4fc)', boxShadow: '0 8px 20px rgba(102,126,234,0.35)' }}>
            <Typography sx={{ fontSize: 22 }}>⚙️</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>Hesap Ayarları</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Ad" value={form.name} onChange={set('name')} InputProps={{ startAdornment: <Box sx={{ mr: 1.5, fontSize: 18 }}>👤</Box> }} />
            <TextField fullWidth label="Soyad" value={form.surname} onChange={set('surname')} InputProps={{ startAdornment: <Box sx={{ mr: 1.5, fontSize: 18 }}>👥</Box> }} />
          </Stack>
          <TextField fullWidth label="Kullanıcı Adı" value={form.username} onChange={set('username')} InputProps={{ startAdornment: <Box sx={{ mr: 1.5, fontSize: 16 }}>@</Box> }} />
          <TextField fullWidth label="E-posta" value={form.email} onChange={set('email')} InputProps={{ startAdornment: <Box sx={{ mr: 1.5, fontSize: 18 }}>✉️</Box> }} />
          <TextField fullWidth label="Telefon" value={form.phone} onChange={set('phone')} InputProps={{ startAdornment: <Box sx={{ mr: 1.5, fontSize: 18 }}>📞</Box> }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, alignItems: 'center', gap: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'linear-gradient(180deg,#fff,#f8fafc)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</Box>
              <Typography fontWeight={600}>Dil</Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              value={form.language}
              onChange={(e, v) => { if (v) setForm(prev => ({ ...prev, language: v })); }}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            >
              <ToggleButton value="tr" sx={{ px: 2.5, py: 1.25, borderRadius: 2 }}>🇹🇷 Türkçe</ToggleButton>
              <ToggleButton value="en" sx={{ px: 2.5, py: 1.25, borderRadius: 2 }}>🇬🇧 English</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary" sx={{ borderRadius: 2 }}>İptal</Button>
        <Button onClick={() => onSave?.(form)} variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#667eea,#a5b4fc)' }}>Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};
export default AccountSettingsModal;
