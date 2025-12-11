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
    <div style={{ padding: 0, borderRadius: 16, background: '#fff', overflow: 'hidden', minWidth: 380 }}>
      {/* Header - same stil as PatientReg */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px 20px',
          borderRadius: '16px 16px 0 0',
          marginBottom: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              🐾 Hasta Arama
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              TC veya Hayvan ID ile hızlı arama
            </div>
          </div>

          {/* Toggle TC / Hayvan ID */}
          <div
            onClick={() => {
              setSearchByAnimalId(!searchByAnimalId);
              setError('');
              setResults([]);
              setTc('');
              setAnimalId('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              background: 'rgba(255,255,255,0.25)',
              padding: '6px',
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                background: !searchByAnimalId ? '#fff' : 'transparent',
                color: !searchByAnimalId ? '#667eea' : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms ease',
              }}
            >
              <span>🆔</span> TC
            </div>
            <div
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                background: searchByAnimalId ? '#fff' : 'transparent',
                color: searchByAnimalId ? '#667eea' : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms ease',
              }}
            >
              <span>🐾</span> Hayvan ID
            </div>
          </div>
        </div>
      </div>

      {/* Arama Alanı */}
      <div style={{ padding: '20px 20px 8px 20px', background: '#fff' }}>
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              display: 'block',
              marginBottom: 6,
              textAlign: 'left',
            }}
          >
            {searchByAnimalId ? '🐾 Hayvan ID Numarası' : '🆔 TC Kimlik No'}
          </label>
          <input
            type="text"
            value={searchByAnimalId ? animalId : tc}
            onChange={(e) =>
              searchByAnimalId ? setAnimalId(e.target.value) : setTc(e.target.value)
            }
            maxLength={searchByAnimalId ? undefined : 11}
            placeholder={
              searchByAnimalId ? 'Hayvan ID giriniz...' : 'TC kimlik numarasını girin...'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') search();
            }}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #e6e9f2',
              fontSize: 14,
              outline: 'none',
              background: '#f8f9fc',
              transition: 'all 200ms ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#667eea')}
            onBlur={(e) => (e.target.style.borderColor = '#e6e9f2')}
          />
        </div>

        <button
          onClick={search}
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 0',
            background: loading
              ? '#9ca3af'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: 10,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 200ms ease',
          }}
        >
          {loading ? 'Aranıyor…' : '🔍 Ara'}
        </button>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div
          style={{
            padding: '8px 20px 0 20px',
            color: '#b91c1c',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {/* Sonuçlar */}
      <div
        style={{
          padding: '12px 20px 16px 20px',
          maxHeight: 260,
          overflowY: 'auto',
        }}
      >
        {results.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 8px',
              fontSize: 12,
              color: '#9ca3af',
            }}
          >
            🔍 Arama yaparak sonuçları burada görebilirsiniz.
          </div>
        )}

        {results.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {results.map((item, index) => (
              <li
                key={index}
                onClick={() =>
                  onSelect &&
                  onSelect({
                    id: item.id,
                    name: item.animalname,
                  })
                }
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  marginBottom: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 180ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef2ff';
                  e.currentTarget.style.borderColor = '#c7d2fe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  🐾 {item.animalname}
                </span>
                <span style={{ color: '#4b5563' }}>👤 Sahip: {item.user_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Alt Kapat Butonu */}
      <div
        style={{
          padding: '10px 20px 16px 20px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          textAlign: 'right',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '8px 18px',
            background: '#ffffff',
            borderRadius: 999,
            border: '1px solid #d1d5db',
            fontSize: 13,
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default AppPatientSearch;
