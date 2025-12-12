import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../context/usercontext.tsx';
import axiosInstance from '../../api/axiosInstance.ts';
import { useConfirm } from '../../components/ConfirmContext';
import { PawPrint, ClipboardList, Calendar, Hash, Trash2 } from 'lucide-react';

const Animals = React.forwardRef((props, ref) => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');

  const [animalsspecies, setanimalsspecies] = useState([]);
  const [selectedanimalsspecies, setSelectedanimalsspecies] = useState('');
  const { userid: contextUserid } = useContext(AuthContext);
  const userid = props.ident_user_id || contextUserid;
  const [birthdate, setBirthdate] = useState('');
  // const [deathdate, setDeathdate] = useState('');
  const [animalIdentNumber, setanimalIdentNumber] = useState('');
  const [animalname, setanimalname] = useState('');
  const { confirm } = useConfirm();
  
  // New states for real-time search
  const [existingAnimalFound, setExistingAnimalFound] = useState(null);
  const [wasAutoFilled, setWasAutoFilled] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [useAutoIdentNumber, setUseAutoIdentNumber] = useState(false);
  const [showIdentityHint, setShowIdentityHint] = useState(false);
  const identityInputRef = useRef(null);
  const isLocked = existingAnimalFound !== null || (!useAutoIdentNumber && !animalIdentNumber);
  const hintTimeoutRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    handleSave
  }));

  const nudgeToIdentity = () => {
    if (useAutoIdentNumber) return;
    setShowIdentityHint(true);
    if (hintTimeoutRef.current) {
      try { clearTimeout(hintTimeoutRef.current); } catch {}
    }
    if (identityInputRef.current) {
      try {
        identityInputRef.current.focus();
        identityInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
    }
    hintTimeoutRef.current = setTimeout(() => setShowIdentityHint(false), 4000);
  };

  const handleSave = async () => {
    try {
      if (!useAutoIdentNumber && (!animalIdentNumber || !animalIdentNumber.trim())) {
        await confirm("Kimlik numarası giriniz veya 'Otomatik al' seçiniz.", "Tamam", "", "Uyarı");
        return;
      }
      if (!selectedAnimal || !selectedanimalsspecies || !animalname) {
        await confirm("Lütfen hayvan, tür ve ad alanlarını doldurun.", "Tamam", "", "Uyarı");
        return;
      }
      // If animal identity number is provided, check if this animal already belongs to this user
      if (animalIdentNumber && animalIdentNumber.trim()) {
        try {
          const searchRes = await axiosInstance.get('/getanimalsearch', {
            params: { tc: animalIdentNumber.trim(), IsAnimalId: 1 }
          });
          
          const owners = searchRes.data.data || [];
          
          // Check if any owner is the current user
          if (owners && owners.length > 0) {
            const alreadyWithSameOwner = owners.some(o => {
              const ownerId = o.user_id || o.id || o.data_id || o.userId || null;
              return ownerId && userid && ownerId.toString() === userid.toString();
            });
            
            if (alreadyWithSameOwner) {
              // Animal already belongs to this user
              await confirm(
                "İşlem iptal edildi. Bu hayvan zaten seçili kullanıcıya kayıtlı.",
                "Tamam",
                "",
                "Bilgi"
              );
              return;
            }
            
            // Animal belongs to different user - confirm attachment
            const shouldContinue = await confirm(
              "Sistemde kayıtlı hayvanı başka kullanıcıyada kaydediceksiniz. Kayda devam edilsinmi?",
              "Evet",
              "Hayır",
              "Uyarı"
            );
            
            if (!shouldContinue) {
              return;
            }
          }
        } catch (searchError) {
          console.error('Animal search error:', searchError);
          // If search fails, continue with save (animal might be new)
        }
      }
      
      const response = await axiosInstance.post('/animalpost', {
        user_id: userid,
        animal_id: selectedAnimal,
        animal_species_id: selectedanimalsspecies,
        birthdate: birthdate,
        deathdate: null,
        animalidentnumber: useAutoIdentNumber ? null : animalIdentNumber,
        isdeath: false,
        animalname: animalname,
        picture: ''
      });

      const newAnimalData = response.data; 
      if (props.onSave) props.onSave(newAnimalData); 

      props.onClose();
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await axiosInstance.get('/animals');
        const animalData = response.data.response;
        setAnimals(animalData);
      } catch (error) {
        console.error('API error:', error);
      }
    };

    fetchAnimals();
  }, []);

  const handleanimalchange = async (e) => {
    const animal_id = e.target.value;
    setSelectedAnimal(animal_id);
    if (animal_id === "") {
      setanimalsspecies([]);
      return;
    }
    try {
      const response = await axiosInstance.get('/animalsspecies', {
        params: {
          animal_id: animal_id
        }
      });
      const animalData = response.data.response;
      setanimalsspecies(animalData);
    } catch (error) {
      console.error('API error:', error);
    }
  };

  // Real-time search handler for animal identity number
  const handleAnimalIdentNumberChange = async (e) => {
    const id = e.target.value;
    setanimalIdentNumber(id);
    if (id && id.length > 0) {
      if (showIdentityHint) setShowIdentityHint(false);
      if (hintTimeoutRef.current) { try { clearTimeout(hintTimeoutRef.current); } catch {} hintTimeoutRef.current = null; }
    }

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Real-time search as user types with debounce
    const timeout = setTimeout(async () => {
      if (id.trim()) {
        try {
          const res = await axiosInstance.get('/getanimalsearch', {
            params: { tc: id, IsAnimalId: 1 }
          });
          const owners = res.data.data || [];
          const animal = res.data.animal || null;

          if (owners.length === 1 && !animal) {
            // Single owner match
            const owner = owners[0];
            const animalId = owner.animal_id || owner.id || '';
            const speciesName = owner.species_name || owner.species || '';

            // Fetch species list to get correct species ID
            if (animalId) {
              try {
                const speciesRes = await axiosInstance.get('/animalsspecies', {
                  params: { animal_id: animalId }
                });
                const speciesList = speciesRes.data.response || [];
                const matchedSpecies = speciesList.find(
                  s => s.species_name === speciesName
                );
                const speciesId = matchedSpecies ? matchedSpecies.id : '';

                // Auto-populate and lock fields
                setSelectedAnimal(animalId);
                setanimalsspecies(speciesList);
                setSelectedanimalsspecies(speciesId);
                setanimalname(owner.animal_name || owner.animalname || '');
                setBirthdate(owner.birthdate || '');
                setExistingAnimalFound(owner);
                setWasAutoFilled(true);
              } catch (e) {
                console.error('Species fetch error:', e);
                setExistingAnimalFound(owner);
                setWasAutoFilled(true);
              }
            }
          } else if (animal) {
            // Animal result
            const animalId = animal.animal_id || animal.id || '';
            const speciesName = animal.species_name || animal.species || '';

            if (animalId) {
              try {
                const speciesRes = await axiosInstance.get('/animalsspecies', {
                  params: { animal_id: animalId }
                });
                const speciesList = speciesRes.data.response || [];
                const matchedSpecies = speciesList.find(
                  s => s.species_name === speciesName
                );
                const speciesId = matchedSpecies ? matchedSpecies.id : '';

                setSelectedAnimal(animalId);
                setanimalsspecies(speciesList);
                setSelectedanimalsspecies(speciesId);
                setanimalname(animal.animal_name || animal.animalname || '');
                setBirthdate(animal.birthdate || '');
                setExistingAnimalFound(animal);
                setWasAutoFilled(true);
              } catch (e) {
                console.error('Species fetch error:', e);
                setExistingAnimalFound(animal);
                setWasAutoFilled(true);
              }
            }
          } else if (owners.length > 1) {
            // Multiple owners - auto-select first
            const firstOwner = owners[0];
            const animalId = firstOwner.animal_id || firstOwner.id || '';
            const speciesName = firstOwner.species_name || firstOwner.species || '';

            if (animalId) {
              try {
                const speciesRes = await axiosInstance.get('/animalsspecies', {
                  params: { animal_id: animalId }
                });
                const speciesList = speciesRes.data.response || [];
                const matchedSpecies = speciesList.find(
                  s => s.species_name === speciesName
                );
                const speciesId = matchedSpecies ? matchedSpecies.id : '';

                setSelectedAnimal(animalId);
                setanimalsspecies(speciesList);
                setSelectedanimalsspecies(speciesId);
                setanimalname(firstOwner.animal_name || firstOwner.animalname || '');
                setBirthdate(firstOwner.birthdate || '');
                setExistingAnimalFound(firstOwner);
                setWasAutoFilled(true);
              } catch (e) {
                console.error('Species fetch error:', e);
                setExistingAnimalFound(firstOwner);
                setWasAutoFilled(true);
              }
            }
          } else {
            // No match - clear auto-filled fields if previous search found something
            if (wasAutoFilled) {
              setSelectedAnimal('');
              setanimalsspecies([]);
              setSelectedanimalsspecies('');
              setanimalname('');
              setBirthdate('');
              setExistingAnimalFound(null);
              setWasAutoFilled(false);
            }
          }
        } catch (e) {
          console.error('Search error:', e);
          // Clear on error if previous was auto-filled
          if (wasAutoFilled) {
            setSelectedAnimal('');
            setanimalsspecies([]);
            setSelectedanimalsspecies('');
            setanimalname('');
            setBirthdate('');
            setExistingAnimalFound(null);
            setWasAutoFilled(false);
          }
        }
      } else {
        // Empty input - clear all
        setSelectedAnimal('');
        setanimalsspecies([]);
        setSelectedanimalsspecies('');
        setanimalname('');
        setBirthdate('');
        setExistingAnimalFound(null);
        setWasAutoFilled(false);
      }
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);
  };

  return (
    <div className="identity-modal">
      <div className="identity-section-card compact">
        <div className="identity-panel-banner">
          <div>
            <div className="identity-panel-title">Hayvan Ekle</div>
            <div className="identity-panel-sub">Hızlı kayıt</div>
          </div>
          <div className="identity-segment">
            <div className={`option ${!useAutoIdentNumber ? 'active' : ''}`} onClick={() => setUseAutoIdentNumber(false)}>Kimlik Gir</div>
            <div className={`option ${useAutoIdentNumber ? 'active' : ''}`} onClick={() => { setUseAutoIdentNumber(true); setanimalIdentNumber(''); setExistingAnimalFound(null); setWasAutoFilled(false); }}>Otomatik Al</div>
          </div>
        </div>

        <div className="identity-modal-body">
      <div className="identity-owner-grid compact">
        {!useAutoIdentNumber && (
          <div className="identity-owner-field full">
            <label className="identity-owner-label">Hayvan Kimlik Numarası</label>
            <div className="identity-input-group">
              <Hash className="identity-input-icon" size={14} />
              <input
                type="text"
                className="identity-owner-input"
                name="animalIdentNumber"
                placeholder="Kimlik numarası"
                value={animalIdentNumber}
                onChange={handleAnimalIdentNumberChange}
                ref={identityInputRef}
              />
            </div>
            {showIdentityHint && (
              <div className="identity-hint">Önce kimlik bilgilerini giriniz</div>
            )}
          </div>
        )}

        <div className="identity-owner-field">
          <label className="identity-owner-label">Hayvan</label>
          <div className="identity-input-group" onClick={() => { if (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) nudgeToIdentity(); }} style={{ cursor: (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) ? 'not-allowed' : 'auto' }}>
            <PawPrint className="identity-input-icon" size={14} />
            <select
              className="identity-owner-select"
              value={selectedAnimal}
              onChange={handleanimalchange}
              disabled={existingAnimalFound !== null || (!useAutoIdentNumber && !animalIdentNumber)}
              style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
            >
              <option value=""></option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>{animal.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="identity-owner-field">
          <label className="identity-owner-label">Tür</label>
          <div className="identity-input-group" onClick={() => { if (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) nudgeToIdentity(); }} style={{ cursor: (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) ? 'not-allowed' : 'auto' }}>
            <ClipboardList className="identity-input-icon" size={14} />
            <select
              className="identity-owner-select"
              value={selectedanimalsspecies}
              onChange={(e) => setSelectedanimalsspecies(e.target.value)}
              disabled={existingAnimalFound !== null || (!useAutoIdentNumber && !animalIdentNumber)}
              style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
            >
              <option value=""></option>
              {animalsspecies.map((s) => (
                <option key={s.id} value={s.id}>{s.species_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="identity-owner-field full">
          <label className="identity-owner-label">Hayvan Adı</label>
          <div className="identity-input-group" onClick={() => { if (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) nudgeToIdentity(); }} style={{ cursor: (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) ? 'not-allowed' : 'auto' }}>
            <PawPrint className="identity-input-icon" size={14} />
            <input
              type="text"
              className="identity-owner-input"
              name="animalname"
              value={animalname}
              onChange={(e) => setanimalname(e.target.value)}
              disabled={existingAnimalFound !== null || (!useAutoIdentNumber && !animalIdentNumber)}
              style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
            />
          </div>
        </div>

        <div className="identity-owner-field">
          <label className="identity-owner-label">Doğum Tarihi</label>
          <div className="identity-input-group" onClick={() => { if (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) nudgeToIdentity(); }} style={{ cursor: (!useAutoIdentNumber && !animalIdentNumber && existingAnimalFound === null) ? 'not-allowed' : 'auto' }}>
            <Calendar className="identity-input-icon" size={14} />
            <input
              type="date"
              className="identity-owner-input"
              name="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              disabled={existingAnimalFound !== null || (!useAutoIdentNumber && !animalIdentNumber)}
              style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
            />
          </div>
        </div>

        {/* result card removed per request */}
      </div>

      <div className="identity-owner-actions">
        {existingAnimalFound && (
          <button
            type="button"
            className="identity-btn identity-btn-danger"
            onClick={() => {
              setExistingAnimalFound(null);
              setanimalIdentNumber('');
              setSelectedAnimal('');
              setanimalsspecies([]);
              setSelectedanimalsspecies('');
              setanimalname('');
              setBirthdate('');
              setWasAutoFilled(false);
            }}
          >
            <Trash2 size={16} /> Başka Hayvan Ara
          </button>
        )}
      </div>
        </div>
      </div>
    </div>
  );
});

export default Animals;
