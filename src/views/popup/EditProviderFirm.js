import React, { useState, useEffect } from 'react';
import { Button, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import axiosInstance from '../../api/axiosInstance.ts';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';

const EditProviderFirm = ({ initialData = null, onClose }) => {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [active, setActive] = useState(true);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setContactPerson(initialData.contact_person || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
    } else {
      // Yeni kayıt için formu sıfırla
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setActive(true);
      setErrors({});
    }
  }, [initialData]);

  // Basit doğrulama
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t('FirmNameRequired');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('EnterValidEmail');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name,
      contact_person: contactPerson,
      phone,
      email,
      address,
      active,
    };

    try {
      if (initialData && initialData.id) {
        // Güncelle
        await axiosInstance.put(`/upd-provider-firms/${initialData.id}`, payload);
        toast.success(lang === 'en' ? t('FirmUpdatedSuccess') : t('FirmUpdatedSuccess'));
      } else {
        // Yeni kayıt
        await axiosInstance.post('/add-provider-firms', payload);
        toast.success(lang === 'en' ? t('FirmAddedSuccess') : t('FirmAddedSuccess'));
      }
      onClose();
    } catch (error) {
      if (error.__demo_blocked) return; 
      
      console.error('Firma kaydetme hatası:', error);
      toast.error(lang === 'en' ? t('FirmSaveError') : t('FirmSaveError'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="firmName">{t('CompanyName')} *</Label>
        <Input
          id="firmName"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          invalid={!!errors.name}
          placeholder={t('EnterCompanyName')}
        />
        <FormFeedback>{errors.name}</FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for="contactPerson">{t('ContactPerson')}</Label>
        <Input
          id="contactPerson"
          type="text"
          value={contactPerson}
          onChange={e => setContactPerson(e.target.value)}
          placeholder={t('EnterContactPerson')}
        />
      </FormGroup>

      <FormGroup>
        <Label for="phone">{t('Phone')}</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder={t('EnterPhoneNumber')}
        />
      </FormGroup>

      <FormGroup>
        <Label for="email">{t('Email')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          invalid={!!errors.email}
          placeholder={t('EnterEmailAddress')}
        />
        <FormFeedback>{errors.email}</FormFeedback>
      </FormGroup>

      <FormGroup>
        <Label for="address">{t('Address')}</Label>
        <Input
          id="address"
          type="textarea"
          rows={3}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder={t('EnterCompanyAddress')}
        />
      </FormGroup>

      <FormGroup check>
        <Input
          id="active"
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        <Label for="active" check>{t('Active')}</Label>
      </FormGroup>

      <div className="mt-3 d-flex justify-content-end gap-2">
        <Button color="secondary" type="button" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button color="primary" type="submit">
          {initialData ? t('Update') : t('Add')}
        </Button>
      </div>
    </form>
  );
};

export default EditProviderFirm;
