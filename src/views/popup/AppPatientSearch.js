import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance.ts';

const AppPatientSearch = ({ onSelect, onClose }) => {
  const [searchByAnimalId, setSearchByAnimalId] = useState(false);
  const [tc, setTc] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setError('');
    setResults([]);
    setLoading(true);
    try {
      let response;
      if (searchByAnimalId) {
        if (!animalId) {
          setError('Lütfen bir Hayvan ID giriniz.');
          setLoading(false);
          return;
        }
        response = await axiosInstance.get('/getanimalsearch', { params: { tc: animalId, IsAnimalId : 1 } });
        setResults(response.data?.data || []);
      } else {
        if (!tc) {
          setError('Lütfen bir TC giriniz.');
          setLoading(false);
          return;
        }
        response = await axiosInstance.get('/getanimalsearch', { params: { tc : tc, IsAnimalId : 0 } });
        setResults(response.data?.data || []);
      }
    } catch (err) {
      setError('Hasta bulunamadı.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#f9f9ff',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ color: '#5E2CA5', marginBottom: '20px' }}>Hasta Arama Formu</h2>

      <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', alignItems: 'left' }}>
        <input
          type="checkbox"
          checked={searchByAnimalId}
          onChange={() => {
            setSearchByAnimalId(!searchByAnimalId);
            setError('');
            setResults([]);
            setTc('');
            setAnimalId('');
          }}
          style={{ marginRight: '6px' }}
        />
        Hayvan ID ile ara
      </label>

      {!searchByAnimalId ? (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', textAlign: 'left', fontSize: '14px', marginBottom: '4px' }}>
            TC Kimlik No:
          </label>
          <input
            type="text"
            value={tc}
            onChange={(e) => setTc(e.target.value)}
            maxLength={11}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
            }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', textAlign: 'left', fontSize: '14px', marginBottom: '4px' }}>
            Hayvan ID Numarası:
          </label>
          <input
            type="text"
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
            }}
          />
        </div>
      )}

      <button
        onClick={search}
        disabled={loading}
        style={{
          backgroundColor: '#6a1b9a',
          color: 'white',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Aranıyor...' : 'Ara'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {results.length > 0 && (
        <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {results.map((item, index) => (
            <li
              key={index}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
              }}
              onClick={() =>
                onSelect &&
                onSelect({
                  id: item.id,
                  name: item.animalname,
                })
              }
            >
              {`Hayvan: ${item.animalname} | Sahip: ${item.user_name}`}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: '16px',
          backgroundColor: 'transparent',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Kapat
      </button>
    </div>
  );
};

export default AppPatientSearch;
