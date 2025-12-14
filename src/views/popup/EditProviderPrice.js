import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import axiosInstance from '../../api/axiosInstance.ts';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext.js';

const EditProviderPrice = ({ initialData, onClose }) => {
    const { t } = useLanguage();
    const [pfId, setPfId] = useState(initialData?.pf_id || '');
    const [materialId, setMaterialId] = useState(initialData?.material_id || '');
    const [purchasePrice, setPurchasePrice] = useState(initialData?.purchase_price || '');
    const [vatRate, setVatRate] = useState(initialData?.vat_rate || 0);
    const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
    const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true);

    const [materials, setMaterials] = useState([]);
    const [providers, setProviders] = useState([]);

    const [errors, setErrors] = useState({});

    // Malzeme ve tedarikçi firmaları API'den çek
    useEffect(() => {
        console.log(initialData);
        const fetchMaterials = async () => {
            try {
                const res = await axiosInstance.get('/getMaterials');
                if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
                    setMaterials(res.data.data);
                } else {
                    setMaterials([]);
                }
            } catch (err) {
                console.error('Malzemeler yüklenemedi', err);
                setMaterials([]);
            }
        };

        const fetchProviders = async () => {
            try {
                const res = await axiosInstance.get('/provider-firms');
                if (res.data?.status === 'success' && Array.isArray(res.data.firms)) {
                    setProviders(res.data.firms);
                } else {
                    setProviders([]);
                }
            } catch (err) {
                console.error('Tedarikçi firmalar yüklenemedi', err);
                setProviders([]);
            }
        };

        fetchMaterials();
        fetchProviders();
    }, [initialData]);

    // Validation kontrolü
    const validate = () => {
        const newErrors = {};
        if (!pfId) newErrors.pfId = t('SelectProviderFirm');
        if (!materialId) newErrors.materialId = t('SelectMaterial');
        if (!purchasePrice || purchasePrice <= 0) newErrors.purchasePrice = t('EnterValidPrice');
        if (vatRate < 0) newErrors.vatRate = 'KDV 0 veya pozitif olmalı';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            pf_id: Number(pfId),
            material_id: Number(materialId),
            purchase_price: Number(purchasePrice),
            vat_rate: Number(vatRate),
            is_default: isDefault ? 1 : 0,
            active: active ? 1 : 0,
        };

        try {
            if (initialData?.id) {
                await axiosInstance.put(`/provider-price-update/${initialData.id}`, payload);
            } else {
                await axiosInstance.post('/add-provider-price', payload);
            }
            onClose();
        } catch (err) {
            if (err.__demo_blocked) return; 
            toast.error(err.response?.data?.message || err.message || t('SaveFailed'));
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="providerFirm">{t('ProviderFirms')}</Label>
                <Input
                    type="select"
                    id="providerFirm"
                    value={pfId}
                    onChange={(e) => setPfId(e.target.value)}
                    invalid={!!errors.pfId}
                >
                    <option value="">{t('Select')}</option>
                    {providers.map((pf) => (
                        <option key={pf.id} value={pf.id}>{pf.name}</option>
                    ))}
                </Input>
                <FormFeedback>{errors.pfId}</FormFeedback>
            </FormGroup>

            <FormGroup>
                <Label for="material">{t('Material')}</Label>
                <Input
                    type="select"
                    id="material"
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    invalid={!!errors.materialId}
                >
                    <option value="">{t('Select')}</option>
                    {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </Input>
                <FormFeedback>{errors.materialId}</FormFeedback>
            </FormGroup>

            <FormGroup>
                <Label for="purchasePrice">{t('PricePurchase')}</Label>
                <Input
                    type="number"
                    id="purchasePrice"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    invalid={!!errors.purchasePrice}
                    min="0"
                    step="0.01"
                />
                <FormFeedback>{errors.purchasePrice}</FormFeedback>
            </FormGroup>

            {/* <FormGroup>
                <Label for="vatRate">KDV (%)</Label>
                <Input
                    type="number"
                    id="vatRate"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    invalid={!!errors.vatRate}
                    min="0"
                    step="0.01"
                />
                <FormFeedback>{errors.vatRate}</FormFeedback>
            </FormGroup> */}

            <FormGroup check>
                <Input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={() => setIsDefault(!isDefault)}
                />
                <Label for="isDefault" check>{t('Default')}</Label>
            </FormGroup>

            <FormGroup check className="mt-2">
                <Input
                    type="checkbox"
                    id="active"
                    checked={active}
                    onChange={() => setActive(!active)}
                />
                <Label for="active" check>{t('Active')}</Label>
            </FormGroup>

            <Button type="submit" color="primary" className="mt-3">{t('Save')}</Button>
        </Form>
    );
};

export default EditProviderPrice;
