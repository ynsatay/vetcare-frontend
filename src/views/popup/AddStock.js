import React, {
    useState,
    useImperativeHandle,
    forwardRef
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';
import { getStockCategories } from '../../constants/stockCategories.js';

const AddStock = forwardRef(({ onClose }, ref) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        //quantity: '', //Stok Alım Ekanı için kaldırıldı. 
        unit: "",
        category: '',
        min_stock_level: 0,
        barcode: 0,
        description: ''
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const categories = getStockCategories(t);

    const units = [
        { label: t('UnitPiece'), value: 1 },
        { label: t('Box'), value: 2 },
        { label: t('ML'), value: 3 },
        { label: t('Gram'), value: 4 },
        { label: t('Liter'), value: 5 }
    ];


    useImperativeHandle(ref, () => ({
        handleSave: async () => {
            // if (!formData.name || !formData.quantity || !formData.unit) {  //Stok Alım Ekanı için kaldırıldı
            //     setShowConfirm(true);
            //     return;
            // }

                 // unit=0 (Adet) geçerli bir seçim; bu yüzden falsy kontrolü kullanmayalım
                 if (
                     !formData.name ||
                     formData.category === '' || formData.category === null || formData.category === undefined ||
                     formData.unit === '' || formData.unit === null || formData.unit === undefined
                 ) {
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
        const numericFields = new Set(["price", "min_stock_level", "barcode", "category", "unit"]);
        const nextValue = numericFields.has(name)
            ? (value === "" ? "" : Number(value))
            : value;
        setFormData(prev => ({ ...prev, [name]: nextValue }));
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
                    <Col md={4}><Label>{`${t('Category')}*`}</Label></Col>
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
