import React, { useContext, useEffect, useState } from 'react';
import { Input, Label } from 'reactstrap';
import "../scss/_animals.scss";
import { AuthContext } from '../../context/usercontext.tsx';
import axiosInstance from '../../api/axiosInstance.ts';
import { useConfirm } from '../../components/ConfirmContext';

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

  React.useImperativeHandle(ref, () => ({
    handleSave
  }));

  const handleSave = async () => {
    try {
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
        animalidentnumber: animalIdentNumber,
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
    <form>
      {/* Animal Identity Number FIRST - with real-time search */}
      <div className="ani-form-group">
        <Label className="ani-form-label" for="animalIdentNumber">🔑 Hayvan Kimlik Numarası *</Label>
        <Input
          type="text"
          name="animalIdentNumber"
          id="animalIdentNumber"
          placeholder="Hayvan kimlik numarasını giriniz"
          value={animalIdentNumber}
          onChange={handleAnimalIdentNumberChange}
          className="ani-form-select"
        />
      </div>

      {/* Found animal indicator */}
      {existingAnimalFound && (
        <div style={{ padding: 12, borderRadius: 10, border: '1px solid #10b981', background: '#ecfdf5', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#065f46', marginBottom: 8 }}>✓ Hayvan Bulundu</div>
          <div style={{ fontSize: 12, color: '#047857' }}>
            {existingAnimalFound.user_name || existingAnimalFound.animal_name}
          </div>
        </div>
      )}

      <div className="ani-form-group">
        <Label className="ani-form-label" for="exampleSelect">Hayvan Seçin</Label>
        <Input
          id="exampleSelect"
          name="select"
          type="select"
          value={selectedAnimal}
          onChange={(e) => handleanimalchange(e)}
          disabled={existingAnimalFound !== null}
          className="ani-form-select"
          style={{ opacity: existingAnimalFound !== null ? 0.6 : 1, cursor: existingAnimalFound !== null ? 'not-allowed' : 'pointer' }}
        >
          <option value=""></option>
          {animals.map((animal) => (
            <option key={animal.id} value={animal.id}>
              {animal.name}
            </option>
          ))}
        </Input>
      </div>
      <div className="ani-form-group">
        <Label className="ani-form-label" for="exampleSelect2">Hayvan Türü Seçin</Label>
        <Input
          id="exampleSelect2"
          name="select2"
          type="select"
          value={selectedanimalsspecies}
          onChange={(e) => setSelectedanimalsspecies(e.target.value)}
          disabled={existingAnimalFound !== null}
          className="ani-form-select"
          style={{ opacity: existingAnimalFound !== null ? 0.6 : 1, cursor: existingAnimalFound !== null ? 'not-allowed' : 'pointer' }}
        >
          <option value=""></option>
          {animalsspecies.map((animalspec) => (
            <option key={animalspec.id} value={animalspec.id}>
              {animalspec.species_name}
            </option>
          ))}
        </Input>
      </div>
      <div className="ani-form-group">
        <Label className="ani-form-label" for="animalname">Hayvan Adı</Label>
        <Input
          type="text"
          name="animalname"
          id="animalname"
          value={animalname}
          onChange={(e) => setanimalname(e.target.value)}
          readOnly={existingAnimalFound !== null}
          style={{ background: existingAnimalFound !== null ? '#f3f4f6' : '#fff' }}
        />
      </div>
      <div className="ani-form-group">
        <Label className="ani-form-label" for="birthdate">Doğum Tarihi Seçin</Label>
        <Input
          type="date"
          name="birthdate"
          id="birthdate"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          disabled={existingAnimalFound !== null}
          style={{ opacity: existingAnimalFound !== null ? 0.6 : 1, cursor: existingAnimalFound !== null ? 'not-allowed' : 'pointer' }}
        />
      </div>

      {existingAnimalFound && (
        <button
          type="button"
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
          style={{ width: '100%', padding: '10px 14px', background: '#ef4444', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginBottom: 12 }}
        >
          Başka Hayvan Ara
        </button>
      )}
    </form>
  );
});

export default Animals;
