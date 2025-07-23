import React, {
    useState,
    useImperativeHandle,
    forwardRef
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance.ts';

const AddService = forwardRef(({ service, onClose }, ref) => {
    const [formData, setFormData] = useState({
        name: service?.name || '',
        price: service?.price || '',
        category: service?.category || '',
        description: service?.description || ''
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const categories = [
        { label: "Muayene", value: 1 },
        { label: "Aşılama", value: 2 },
        { label: "Operasyon", value: 3 },
        { label: "Tedavi", value: 4 },
        { label: "Diğer", value: 0 }
    ];

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
        setFormData(prev => ({
            ...prev,
            [name]: name === 'category' ? parseInt(value) : value
        }));
    };
    
    return (
        <>
            <FormGroup>
                <Row>
                    <Col md={4}><Label>Hizmet Adı*</Label></Col>
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
                    <Col md={4}><Label>Fiyat</Label></Col>
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
                    <Col md={4}><Label>Kategori</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Seçiniz</option>
                            {categories.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Input>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={4}><Label>Açıklama</Label></Col>
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
                message="Lütfen zorunlu alanları doldurunuz (Hizmet Adı)."
                answerTrue="Tamam"
                toggleMessage="Uyarı"
                answerFalse=""
            />
        </>
    );
});

export default AddService;
