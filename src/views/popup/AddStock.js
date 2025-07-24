import React, {
    useState,
    useImperativeHandle,
    forwardRef
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance.ts';

const AddStock = forwardRef(({ onClose }, ref) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        //quantity: '', //Stok Alım Ekanı için kaldırıldı. 
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
        { label: "İlaç", value: 0 },
        { label: "Sarf", value: 1 },
        { label: "Temizlik", value: 2 },
        { label: "Besin", value: 3 },
        { label: "Aşı", value: 5 },
        { label: "Diğer", value: 4 }
    ];

    const units = [
    { label: "Adet", value: 0 },
    { label: "Kutu", value: 1 },
    { label: "ML", value: 2 },
    { label: "Gram", value: 3 },
    { label: "Litre", value: 4 }
];


    useImperativeHandle(ref, () => ({
        handleSave: async () => {
            // if (!formData.name || !formData.quantity || !formData.unit) {  //Stok Alım Ekanı için kaldırıldı
            //     setShowConfirm(true);
            //     return;
            // }

             if (!formData.name || !formData.unit) {
                setShowConfirm(true);
                return;
            }

            try {
                await axiosInstance.post('/addMaterial', formData);
                onClose(); // modal kapat
            } catch (error) {
                console.error("Kayıt hatası:", error);
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
                //{ label: "Adet*", name: "quantity", type: "number" }, //Stok Alım Ekanı için kaldırıldı.
                { label: "Min. Stok", name: "min_stock_level", type: "number" },
                { label: "Barkod", name: "barcode" },
                { label: "Tedarikçi", name: "supplier_name" },
            ].map(({ label, name, type = "text" }) => (
                <FormGroup key={name}>
                    <Row>
                        <Col md={4}><Label>{label}</Label></Col>
                        <Col md={8}>
                            <Input
                                type={type}
                                name={name}
                                value={formData[name]}
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

            {/* UNIT Dropdown */}
            <FormGroup>
                <Row>
                    <Col md={4}><Label>Birim*</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                        >
                            <option value="">Seçiniz</option>
                            {units.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Input>
                    </Col>
                </Row>
            </FormGroup>

            {/* Açıklama */}
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

            {/* Uyarı Penceresi */}
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

export default AddStock;
