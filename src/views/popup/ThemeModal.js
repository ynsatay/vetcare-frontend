import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton, Box, Typography } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext.js';
const ThemeModal = ({ open, onClose, onSave, initial }) => {
  const [dark, setDark] = useState(false);
  const [primary, setPrimary] = useState('indigo');
  useEffect(() => {
    setDark(initial?.dark ?? false);
    setPrimary(initial?.primary || 'indigo');
  }, [initial, open]);
  const palettePreview = {
    home: ['#59018b', '#764ba2', '#532c80ff'],
    indigo: ['#6366F1', '#8B5CF6', '#A5B4FC'],
    emerald: ['#10B981', '#34D399', '#6EE7B7'],
    rose: ['#F43F5E', '#FB7185', '#FDA4AF'],
    sky: ['#0EA5E9', '#38BDF8', '#7DD3FC']
  }[primary] || ['#6366F1', '#8B5CF6', '#A5B4FC'];
  const { t } = useLanguage();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
      <DialogTitle sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#4facfe,#00f2fe)', boxShadow: '0 8px 20px rgba(79,172,254,0.35)' }}>
            <Typography sx={{ fontSize: 22 }}>🎨</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>{t('Theme')}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <FormControlLabel control={<Switch checked={dark} onChange={(e) => setDark(e.target.checked)} />} label={t('DarkMode')} />
          <ToggleButtonGroup exclusive value={primary} onChange={(e, v) => v && setPrimary(v)} size="small">
            <ToggleButton value="home">Home</ToggleButton>
            <ToggleButton value="indigo">Indigo</ToggleButton>
            <ToggleButton value="emerald">Emerald</ToggleButton>
            <ToggleButton value="rose">Rose</ToggleButton>
            <ToggleButton value="sky">Sky</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 8, p: 2, borderRadius: 2, border: '1px solid var(--id-border, #e2e8f0)', background: 'var(--id-bg-card, linear-gradient(180deg,#fff,#f8fafc))' }}>
            {palettePreview.map((c, i) => (
              <Box key={i} sx={{ width: 48, height: 32, borderRadius: 1.5, background: c, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)' }} />
            ))}
            <Box sx={{ flex: 1, textAlign: 'right', color: 'var(--id-text-secondary, text.secondary)' }}>{primary.toUpperCase()}</Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="secondary" sx={{ borderRadius: 2 }}>{t('Cancel')}</Button>
        <Button onClick={() => onSave?.({ dark, primary })} variant="contained" sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>{t('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};
export default ThemeModal;
