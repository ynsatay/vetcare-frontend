import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect
} from 'react';
import { Row, Col, FormGroup, Label, Input } from 'reactstrap';
import axiosInstance from '../../api/axiosInstance.ts';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog.js';

const PatientFileReg = forwardRef(({ pat_id, pat_name, animal_id, animal_name }, ref) => {
    const userId = localStorage.getItem('userid');
    const [vets, setVets] = useState([]);
    const [formData, setFormData] = useState({
        vet_u_id: userId || '',
        type: '',
        notes: '',
        arrival_reason: '',
        diagnosis: '',
        treatment_plan: ''
    });

    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);

    // Vet listesini al
    useEffect(() => {
        axiosInstance.get('/getpersonel')
            .then(res => {
                if (res.data.status === 'success') {
                    setVets(res.data.users);  // çünkü backend'de "users" olarak dönüyor
                } else {
                    console.error("Personel alınamadı:", res.data.error);
                }
            })
            .catch(err => console.error("Veteriner listesi alınamadı", err));

    }, []);

    useImperativeHandle(ref, () => ({
        handleSave: async () => {
            const finalData = {
                ...formData,
                pat_id,
                animal_id
            };

            if (!finalData.animal_id || !finalData.pat_id || !finalData.vet_u_id || !finalData.type) {
                console.log(finalData.animal_id, finalData.pat_id, finalData.vet_u_id, finalData.type);
                setShowConfirm(true);
                return;
            }

            try {
                const response = await axiosInstance.post('/AddPatientfile', {
                    u_id: finalData.pat_id,
                    animal_id: finalData.animal_id,
                    vet_u_id: finalData.vet_u_id,
                    type: finalData.type,
                    status: 0,
                    notes: finalData.notes,
                    is_discharge: 0,
                    arrival_reason: finalData.arrival_reason,
                    diagnosis: finalData.diagnosis,
                    treatment_plan: finalData.treatment_plan

                });

                navigate(`/patientFile/${response.data.patFileId}`, {
                   state : response.data.patFileId  
                });

                return response.data;

            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }
    }));


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <FormGroup>
                <Row>
                    <Col md={3}><Label>Hasta Adı</Label></Col>
                    <Col md={9}><Input value={pat_name} disabled /></Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Hayvan Adı</Label></Col>
                    <Col md={9}><Input value={animal_name} disabled /></Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Geliş Tipi*</Label></Col>
                    <Col md={9}>
                        <Input type="select" name="type" value={formData.type} onChange={handleChange}>
                            <option value="">Seçiniz</option>
                            <option value="1">Kontrol</option>
                            <option value="2">Acil</option>
                            <option value="3">Aşı</option>
                        </Input>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Veteriner*</Label></Col>
                    <Col md={9}>
                        <Input
                            type="select"
                            name="vet_u_id"
                            value={formData.vet_u_id}
                            onChange={handleChange}
                        >
                            <option value="">Seçiniz</option>
                            {vets.map(vet => (
                                <option key={vet.id} value={vet.id}>{vet.name + " " + vet.surname}</option>
                            ))}
                        </Input>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Notlar</Label></Col>
                    <Col md={9}>
                        <Input type="text" name="notes" value={formData.notes} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Geliş Nedeni</Label></Col>
                    <Col md={9}>
                        <Input type="text" name="arrival_reason" value={formData.arrival_reason} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Tanı</Label></Col>
                    <Col md={9}>
                        <Input type="textarea" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col md={3}><Label>Tedavi Planı</Label></Col>
                    <Col md={9}>
                        <Input type="textarea" name="treatment_plan" value={formData.treatment_plan} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <ConfirmDialog
                isOpen={showConfirm}
                toggle={() => setShowConfirm(false)}
                onConfirm={() => setShowConfirm(false)}
                message="Zorunlu alanları doldurunuz"
                answerTrue="Tamam"
                toggleMessage="Uyarı"
                answerFalse=""
            />

        </>
    );
});

export default PatientFileReg;
