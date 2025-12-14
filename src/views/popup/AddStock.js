import React, {
    useState,
    useImperativeHandle,
    forwardRef
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';

const AddStock = forwardRef(({ onClose }, ref) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        //quantity: '', //Stok Alım Ekanı için kaldırıldı. 
        unit: "",
        category: 0,
        min_stock_level: 0,
        barcode: 0,
        description: ''
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const categories = [
        { label: t('Medicine'), value: 0 },
        { label: t('Consumable'), value: 1 },
        { label: t('Cleaning'), value: 2 },
        { label: t('Food'), value: 3 },
        { label: t('Vaccine'), value: 5 },
        { label: t('Other'), value: 4 }
    ];

    const units = [
        { label: t('UnitPiece'), value: 0 },
        { label: t('Box'), value: 1 },
        { label: t('ML'), value: 2 },
        { label: t('Gram'), value: 3 },
        { label: t('Liter'), value: 4 }
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
                { label: `${t('StockName')}*`, name: "name" },
                { label: t('Price'), name: "price", type: "number" },
                //{ label: "Adet*", name: "quantity", type: "number" }, //Stok Alım Ekanı için kaldırıldı.
                { label: t('MinStock'), name: "min_stock_level", type: "number" },
                { label: t('Barcode'), name: "barcode" },
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

            {/* UNIT Dropdown */}
            <FormGroup>
                <Row>
                    <Col md={4}><Label>{t('Type')}*</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}

                        >
                            <option value="">{t('Select')}</option>
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

            {/* Uyarı Penceresi */}
            <ConfirmDialog
                isOpen={showConfirm}
                toggle={() => setShowConfirm(false)}
                onConfirm={() => setShowConfirm(false)}
                message={t('FillRequiredFields')}
                answerTrue={t('Ok')}
                toggleMessage={t('Warning')}
                answerFalse=""
            />
        </>
    );
});

export default AddStock;
