import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import { Col, Input, Label, Row } from 'reactstrap';
import "../scss/_animals.scss";
import { AuthContext } from '../../context/usercontext.tsx';
import Animalslist from '../list/Animallist.js';

const Animals = () => {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState('');

    const [animalsspecies, setanimalsspecies] = useState([]);
    const [selectedanimalsspecies, setSelectedanimalsspecies] = useState('');
    const { userid } = useContext(AuthContext);
    const [birthdate, setBirthdate] = useState('');
    const [deathdate, setDeathdate] = useState('');
    const [animalIdentNumber, setanimalIdentNumber] = useState('');

    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                const response = await axios.get('http://31.40.198.64:3001/api/animals');
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
            const response = await axios.get('http://31.40.198.64:3001/api/animalsspecies', {
                params: {
                    animal_id: animal_id
                }
            });
            const animalData = response.data.response;
            setanimalsspecies(animalData);
        } catch (error) {
            console.error('API error:', error);
        }
    }
    let isDeathValue;
    if (deathdate) {
        isDeathValue = true;
    } else {
        isDeathValue = false;
    }
    const animalpost = async () => {
        try {
            const response = await axios.post('http://31.40.198.64:3001/api/animalpost', {
                user_id: userid,
                animal_id: selectedAnimal,
                animal_species_id: selectedanimalsspecies,
                birthdate: birthdate,
                deathdate: deathdate,
                animalidentnumber: animalIdentNumber,
                isdeath: deathdate ? true : false,
                picture: ''
            });

            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
      
        <form >
             <Row>
      <Col lg="12">
      <Animalslist/>
      </Col>
      </Row>
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
                <Label className="ani-form-label" for="exampleSelect2">Doğum Tarihi Seçin</Label>
                <Input
                    type="date"
                    name="birthdate"
                    id="birthdate"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" for="exampleSelect2">Ölüm Tarihi Seçin</Label>
                <Input
                    type="date"
                    name="deathdate"
                    id="deathdate"
                    value={deathdate}
                    onChange={(e) => setDeathdate(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" for="exampleSelect2">Hayvan Kimlik Nuamrası</Label>
                <Input
                    type="text"
                    name="animalIdentNumber"
                    id="animalIdentNumber"
                    value={animalIdentNumber}
                    onChange={(e) => setanimalIdentNumber(e.target.value)}
                />
            </div>
            <div className="ani-form-group">
                <Label className="ani-form-label" for="exampleSelect2">Hayvan Resmi Seçin</Label>
                <Input
                    type="file"
                    name="animalPicture"
                    id="animalPicture"
                // onChange={(e) => setAnimalPicture(e.target.files[0])}
                />
            </div>
            <Button
                fullWidth
                size="large"
                variant="contained"
                style={{ marginTop: '16px' }}
                className='login'
                type="submit"
                onClick={animalpost}
            >
                Kaydet
            </Button>
        </form>
    );
};


export default Animals;
