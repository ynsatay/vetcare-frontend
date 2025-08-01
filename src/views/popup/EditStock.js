import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog.js';
import axiosInstance from '../../api/axiosInstance.ts';

const EditStock = forwardRef(({ onClose, initialData }, ref) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        //quantity: '', //Stok Alım Ekanı için kaldırıldı
        quantity: 0,
        unit: '',
        category: '',
        min_stock_level: '',
        barcode: '',
        supplier_name: '',
        description: ''
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const categories = [
        { label: "İlaç", value: 1 },
        { label: "Sarf", value: 2 },
        { label: "Temizlik", value: 3 },
        { label: "Besin", value: 4 },
        { label: "Aşı", value: 5 },
        { label: "Diğer", value: 0 }
    ];

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
        handleSave: async () => {
            if (!formData.name ||  
                //formData.quantity === '' || //Stok Alım Ekanı için kaldırıldı
                formData.unit === '' || formData.unit === null || formData.unit === undefined
            ) {
                setShowConfirm(true);
                return;
            }
            try {
                await axiosInstance.put(`/updateMaterial/${formData.id}`, formData);
                onClose();
            } catch (error) {
                console.error("Güncelleme hatası:", error);
            }
        }
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            {[
                { label: "Malzeme Adı*", name: "name" },
                { label: "Fiyat", name: "price", type: "number" },
                //{ label: "Adet*", name: "quantity", type: "number" },  //Stok Alım Ekanı için kaldırıldı
                { label: "Min. Stok", name: "min_stock_level", type: "number" },
                { label: "Barkod", name: "barcode" },
                // { label: "Tedarikçi", name: "supplier_name" },
            ].map(({ label, name, type = "text" }) => (
                <FormGroup key={name}>
                    <Row>
                        <Col md={4}><Label>{label}</Label></Col>
                        <Col md={8}>
                            <Input
                                type={type}
                                name={name}
                                value={formData[name] || ''}
                                onChange={handleChange}
                                min={type === "number" ? 0 : undefined}
                            />
                        </Col>
                    </Row>
                </FormGroup>
            ))}

            <FormGroup>
                <Row>
                    <Col md={4}><Label>Kategori</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="category"
                            value={formData.category ?? ''}
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
                    <Col md={4}><Label>Birim*</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="unit"
                            value={formData.unit ?? ''}  // null/undefined güvenliği
                            onChange={handleChange}
                        >
                            <option value="">Seçiniz</option>
                            <option value="0">Adet</option>
                            <option value="1">Kutu</option>
                            <option value="2">ML</option>
                            <option value="3">Gram</option>
                            <option value="4">Litre</option>
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
                            value={formData.description || ''}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            </FormGroup>

            <ConfirmDialog
                isOpen={showConfirm}
                toggle={() => setShowConfirm(false)}
                onConfirm={() => setShowConfirm(false)}
                message="Lütfen zorunlu alanları doldurunuz."
                answerTrue="Tamam"
                toggleMessage="Uyarı"
                answerFalse=""
            />
        </>
    );
});

export default EditStock;
