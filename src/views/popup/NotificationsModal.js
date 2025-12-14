import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControlLabel, Switch, Select, MenuItem, Box, Typography } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext.js';
const NotificationsModal = ({ open, onClose, onSave, initial }) => {
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true, frequency: 'daily' });
  const { t } = useLanguage();
  useEffect(() => {
    setPrefs({
      email: initial?.email ?? true,
      sms: initial?.sms ?? false,
      push: initial?.push ?? true,
      frequency: initial?.frequency || 'daily'
    });
  }, [initial, open]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f093fb,#667eea)', boxShadow: '0 8px 20px rgba(240,147,251,0.35)' }}>
            <Typography sx={{ fontSize: 22 }}>🔔</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>{t('Notifications')}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ p: 2, border: '1px solid var(--id-border, #e2e8f0)', borderRadius: 2, background: 'var(--id-bg-card, linear-gradient(180deg,#fff,#f8fafc))' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✉️</Box>
                <Typography fontWeight={600} sx={{ color: 'var(--id-text, #0f172a)' }}>E-posta</Typography>
              </Box>
              <FormControlLabel control={<Switch checked={prefs.email} onChange={(e) => setPrefs(p => ({ ...p, email: e.target.checked }))} />} label="Active" />
            </Box>
            <Box sx={{ p: 2, border: '1px solid var(--id-border, #e2e8f0)', borderRadius: 2, background: 'var(--id-bg-card, linear-gradient(180deg,#fff,#f8fafc))' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,87,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</Box>
                <Typography fontWeight={600} sx={{ color: 'var(--id-text, #0f172a)' }}>SMS</Typography>
              </Box>
              <FormControlLabel control={<Switch checked={prefs.sms} onChange={(e) => setPrefs(p => ({ ...p, sms: e.target.checked }))} />} label="Active" />
            </Box>
            <Box sx={{ p: 2, border: '1px solid var(--id-border, #e2e8f0)', borderRadius: 2, background: 'var(--id-bg-card, linear-gradient(180deg,#fff,#f8fafc))' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📲</Box>
                <Typography fontWeight={600} sx={{ color: 'var(--id-text, #0f172a)' }}>Push</Typography>
              </Box>
              <FormControlLabel control={<Switch checked={prefs.push} onChange={(e) => setPrefs(p => ({ ...p, push: e.target.checked }))} />} label="Active" />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ minWidth: 110, color: 'var(--id-text, #0f172a)' }} color="text.secondary">{t('Frequency')}</Typography>
            <Select value={prefs.frequency} onChange={(e) => setPrefs(p => ({ ...p, frequency: e.target.value }))} fullWidth>
              <MenuItem value="instant">{t('Instant')}</MenuItem>
              <MenuItem value="hourly">{t('Hourly')}</MenuItem>
              <MenuItem value="daily">{t('Daily')}</MenuItem>
              <MenuItem value="weekly">{t('Weekly')}</MenuItem>
            </Select>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary" sx={{ borderRadius: 2 }}>{t('Cancel')}</Button>
        <Button onClick={() => onSave?.(prefs)} variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#f093fb,#667eea)' }}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default NotificationsModal;
