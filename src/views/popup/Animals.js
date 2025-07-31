import React, { useContext, useEffect, useState } from 'react';
import { Input, Label } from 'reactstrap';
import "../scss/_animals.scss";
import { AuthContext } from '../../context/usercontext.tsx';
import axiosInstance from '../../api/axiosInstance.ts';

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

  React.useImperativeHandle(ref, () => ({
    handleSave
  }));

  const handleSave = async () => {
    try {
      const response = await axiosInstance.post('/animalpost', {
        user_id: userid,
        animal_id: selectedAnimal,
        animal_species_id: selectedanimalsspecies,
        birthdate: birthdate,
        // deathdate: deathdate,
        deathdate: null,
        animalidentnumber: animalIdentNumber,
        // isdeath: deathdate ? true : false,
        isdeath: false, 
        animalname: animalname,
        picture: ''
      });
      props.onClose();
      console.log('Response:', response.data);
      if (props.onSave) props.onSave();
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

  return (
    <form>
      <div className="ani-form-group">
        <Label className="ani-form-label" for="exampleSelect">Hayvan Seçin</Label>
        <Input
          id="exampleSelect"
          name="select"
          type="select"
          value={selectedAnimal}
          onChange={(e) => handleanimalchange(e)}
          className="ani-form-select"
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
          className="ani-form-select"
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
        />
      </div>
      {/* <div className="ani-form-group">
        <Label className="ani-form-label" for="deathdate">Ölüm Tarihi Seçin</Label>
        <Input
          type="date"
          name="deathdate"
          id="deathdate"
          value={deathdate}
          onChange={(e) => setDeathdate(e.target.value)}
        />
      </div> */}
      <div className="ani-form-group">
        <Label className="ani-form-label" for="animalIdentNumber">Hayvan Kimlik Numarası</Label>
        <Input
          type="text"
          name="animalIdentNumber"
          id="animalIdentNumber"
          value={animalIdentNumber}
          onChange={(e) => setanimalIdentNumber(e.target.value)}
        />
      </div>
      {/* <div className="ani-form-group">
        <Label className="ani-form-label" for="animalPicture">Hayvan Resmi Seçin</Label>
        <Input
          type="file"
          name="animalPicture"
          id="animalPicture"
        // onChange={(e) => setAnimalPicture(e.target.files[0])}
        />
      </div> */}
    </form>
  );
});

export default Animals;
