import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, FormControlLabel, Switch, Box, Typography } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext.js';
const SecurityModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '', twofa: false });
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const strength = Math.min(100, (form.next?.length || 0) * 10);
  const { t } = useLanguage();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f5576c,#f093fb)', boxShadow: '0 8px 20px rgba(245,87,108,0.35)' }}>
            <Typography sx={{ fontSize: 22 }}>🔒</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>{t('Security')}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <TextField type="password" label="Current Password" value={form.current} onChange={set('current')} fullWidth />
          <TextField type="password" label="New Password" value={form.next} onChange={set('next')} fullWidth />
          {form.next && (
            <Box sx={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ width: `${strength}%`, height: '100%', background: strength < 40 ? '#f5576c' : strength < 70 ? '#f59e0b' : '#10b981', transition: 'width 0.2s ease' }} />
            </Box>
          )}
          <TextField type="password" label="Confirm New Password" value={form.confirm} onChange={set('confirm')} fullWidth />
          <FormControlLabel control={<Switch checked={form.twofa} onChange={(e) => setForm(p => ({ ...p, twofa: e.target.checked }))} />} label="Two-Factor Authentication" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary" sx={{ borderRadius: 2 }}>{t('Cancel')}</Button>
        <Button onClick={() => onSave?.(form)} variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#f5576c,#f093fb)' }}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default SecurityModal;
