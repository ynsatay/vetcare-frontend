import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect
} from 'react';
import { Hash, ClipboardList, PawPrint, Calendar, User } from 'lucide-react';
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
        <div className="identity-modal">
            <div className="identity-section-card compact">
                <div className="identity-panel-banner">
                    <div>
                        <div className="identity-panel-title">Geliş Dosyası Oluştur</div>
                        <div className="identity-panel-sub">Hızlı kayıt</div>
                    </div>
                </div>

                <div className="identity-modal-body">
                    <div className="identity-owner-grid compact">
                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Hasta Adı</label>
                            <div className="identity-input-group">
                                <User className="identity-input-icon" size={14} />
                                <input type="text" className="identity-owner-input" value={pat_name} disabled />
                            </div>
                        </div>

                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Hayvan Adı</label>
                            <div className="identity-input-group">
                                <PawPrint className="identity-input-icon" size={14} />
                                <input type="text" className="identity-owner-input" value={animal_name} disabled />
                            </div>
                        </div>

                        <div className="identity-owner-field">
                            <label className="identity-owner-label">Geliş Tipi*</label>
                            <div className="identity-input-group">
                                <ClipboardList className="identity-input-icon" size={14} />
                                <select className="identity-owner-select" name="type" value={formData.type} onChange={handleChange}>
                                    <option value="">Seçiniz</option>
                                    <option value="1">Kontrol</option>
                                    <option value="2">Acil</option>
                                    <option value="3">Aşı</option>
                                </select>
                            </div>
                        </div>

                        <div className="identity-owner-field">
                            <label className="identity-owner-label">Veteriner*</label>
                            <div className="identity-input-group">
                                <Hash className="identity-input-icon" size={14} />
                                <select className="identity-owner-select" name="vet_u_id" value={formData.vet_u_id} onChange={handleChange}>
                                    <option value="">Seçiniz</option>
                                    {vets.map(vet => (
                                        <option key={vet.id} value={vet.id}>{vet.name + " " + vet.surname}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Notlar</label>
                            <div className="identity-input-group">
                                <ClipboardList className="identity-input-icon" size={14} />
                                <input type="text" className="identity-owner-input" name="notes" value={formData.notes} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Geliş Nedeni</label>
                            <div className="identity-input-group">
                                <ClipboardList className="identity-input-icon" size={14} />
                                <input type="text" className="identity-owner-input" name="arrival_reason" value={formData.arrival_reason} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Tanı</label>
                            <div className="identity-input-group">
                                <ClipboardList className="identity-input-icon" size={14} />
                                <textarea className="identity-owner-input" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="identity-owner-field full">
                            <label className="identity-owner-label">Tedavi Planı</label>
                            <div className="identity-input-group">
                                <Calendar className="identity-input-icon" size={14} />
                                <textarea className="identity-owner-input" name="treatment_plan" value={formData.treatment_plan} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <ConfirmDialog
                        isOpen={showConfirm}
                        toggle={() => setShowConfirm(false)}
                        onConfirm={() => setShowConfirm(false)}
                        message="Zorunlu alanları doldurunuz"
                        answerTrue="Tamam"
                        toggleMessage="Uyarı"
                        answerFalse=""
                    />
                </div>
            </div>
        </div>
    );
});

export default PatientFileReg;
