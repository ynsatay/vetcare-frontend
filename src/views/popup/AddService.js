import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';
import { getServiceCategories, normalizeServiceCategory } from '../../constants/serviceCategories.js';

const AddService = forwardRef(({ service, onClose }, ref) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: service?.name || '',
        price: service?.price || '',
        category: normalizeServiceCategory(service?.category) ?? '',
        description: service?.description || ''
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const categories = getServiceCategories(t);

    useEffect(() => {
        setFormData({
            name: service?.name || '',
            price: service?.price || '',
            category: normalizeServiceCategory(service?.category) ?? '',
            description: service?.description || ''
        });
    }, [service]);

    useImperativeHandle(ref, () => ({
        handleSave: async () => {
            if (!formData.name) {
                setShowConfirm(true);
                return;
            }

            try {
                if (service && service.id) {
                    await axiosInstance.put(`/updateService/${service.id}`, formData);
                } else {
                    await axiosInstance.post('/addService', formData);
                }
                onClose(); // modal kapat
            } catch (error) {
                console.error("Kayıt hatası:", error);
            }
        }
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData(prev => ({ ...prev, category: value === '' ? '' : Number(value) }));
            return;
        }
        if (name === 'price') {
            setFormData(prev => ({ ...prev, price: value === '' ? '' : Number(value) }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <>
            <FormGroup>
                <Row>
                    <Col md={4}><Label>{`${t('ServiceName')}*`}</Label></Col>
                    <Col md={8}>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={4}><Label>{t('Price')}</Label></Col>
                    <Col md={8}>
                        <Input
                            type="number"
                            name="price"
                            min={0}
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={4}><Label>{t('Category')}</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">{t('Select')}</option>
                            {categories.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Input>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={4}><Label>{t('Notes')}</Label></Col>
                    <Col md={8}>
                        <Input
                            type="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </FormGroup>

            <ConfirmDialog
                isOpen={showConfirm}
                toggle={() => setShowConfirm(false)}
                onConfirm={() => setShowConfirm(false)}
                message={`${t('FillRequiredFields')} (${t('ServiceName')})`}
                answerTrue={t('Ok')}
                toggleMessage={t('Warning')}
                answerFalse=""
            />
        </>
    );
});

export default AddService;
