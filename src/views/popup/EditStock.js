import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    useEffect,
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import ConfirmDialog from '../../components/ConfirmDialog.js';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';
import { getStockCategories, normalizeStockCategory } from '../../constants/stockCategories.js';

const EditStock = forwardRef(({ onClose, initialData }, ref) => {
    const { t } = useLanguage();
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

    const categories = getStockCategories(t);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                category: normalizeStockCategory(initialData.category),
            });
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
        const numericFields = new Set(["price", "min_stock_level", "barcode", "category", "unit", "quantity"]);
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
                //{ label: "Adet*", name: "quantity", type: "number" },  //Stok Alım Ekanı için kaldırıldı
                { label: t('MinStock'), name: "min_stock_level", type: "number" },
                { label: t('Barcode'), name: "barcode" },
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
                    <Col md={4}><Label>{t('Category')}</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="category"
                            value={formData.category ?? ''}
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
                    <Col md={4}><Label>{t('Type')}*</Label></Col>
                    <Col md={8}>
                        <Input
                            type="select"
                            name="unit"
                            value={formData.unit ?? ''}  // null/undefined güvenliği
                            onChange={handleChange}
                        >
                            <option value="">{t('Select')}</option>
                            <option value="0">{t('UnitPiece')}</option>
                            <option value="1">{t('Box')}</option>
                            <option value="2">{t('ML')}</option>
                            <option value="3">{t('Gram')}</option>
                            <option value="4">{t('Liter')}</option>
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
                message={t('FillRequiredFields')}
                answerTrue={t('Ok')}
                toggleMessage={t('Warning')}
                answerFalse=""
            />
        </>
    );
});

export default EditStock;
