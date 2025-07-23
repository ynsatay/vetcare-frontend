import React, { useState } from 'react';
import { Button, Modal, TextField, List, ListItem, ListItemText } from '@material-ui/core';
import axios from 'axios';

const CountrySelector = () => {
  const [openModal, setOpenModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleOpenModal = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getCountry');
      const countryList = response.data.user ? [response.data.user] : [];
      setCountries(countryList);
      setOpenModal(true);
    } catch (error) {
      console.error('Ülke listesi alınırken hata oluştu:', error);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setOpenModal(false);
  };

  return (
    <div>
      <Button onClick={handleOpenModal}>...</Button>

      <Modal open={openModal} onClose={handleCloseModal}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          backgroundColor: 'white',
          padding: 20,
          boxShadow: 24,
          outline: 'none'
        }}>
          <h2>Ülke Seçin</h2>
          <List>
            {countries.length > 0 ? (
              countries.map((country) => (
                <ListItem button key={country.id} onClick={() => handleSelectCountry(country)}>
                  <ListItemText primary={country.name} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Ülke bulunamadı" />
              </ListItem>
            )}
          </List>
        </div>
      </Modal>

      {/* {selectedCountry && ( */}
        <TextField
          style={{ width: '49%', marginRight: '1%' }}
          label="Seçilen Ülke"
          variant="outlined"
          margin="normal"
          value={selectedCountry &&selectedCountry.name}
          InputProps={{
            readOnly: true,
          }}
        />
      {/* // )} */}
    </div>
  );
};

export default CountrySelector;


