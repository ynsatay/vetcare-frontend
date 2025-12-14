import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance.ts';
import { useLanguage } from '../../context/LanguageContext.js';
import { palettes } from '../../utils/theme.js';

const AppPatientSearch = ({ onSelect, onClose }) => {
  const [searchByAnimalId, setSearchByAnimalId] = useState(false);
  const [tc, setTc] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const [themeColor, setThemeColor] = useState('#667eea');
  const [themeLightColor, setThemeLightColor] = useState('#764ba2');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = () => {
      const themePrefs = localStorage.getItem('theme_prefs');
      if (themePrefs) {
        const prefs = JSON.parse(themePrefs);
        const primaryPalette = palettes[prefs.primary] || palettes.indigo;
        
        setIsDark(prefs.dark);
        if (prefs.dark) {
          // Dark mode: koyu ana renk + açık gradient sonı
          setThemeColor(primaryPalette[2]);
          setThemeLightColor(primaryPalette[0]);
        } else {
          // Light mode: normal renkler
          setThemeColor(primaryPalette[0]);
          setThemeLightColor(primaryPalette[1]);
        }
      }
    };
    loadTheme();

    const handleThemeChange = () => {
      loadTheme();
    };
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  const search = async () => {
    setError('');
    setResults([]);
    setLoading(true);
    try {
      let response;
        if (searchByAnimalId) {
          if (!animalId) {
          setError(t('NoResults'));
          setLoading(false);
          return;
          }
          response = await axiosInstance.get('/getanimalsearch', { params: { tc: animalId, IsAnimalId : 1 } });
          setResults(response.data?.data || []);
        } else {
          if (!tc) {
          setError(t('NoResults'));
          setLoading(false);
          return;
          }
          response = await axiosInstance.get('/getanimalsearch', { params: { tc : tc, IsAnimalId : 0 } });
          setResults(response.data?.data || []);
        }
      } catch (err) {
      setError(t('NoResults'));
      console.error(err);
      }
      setLoading(false);
  };

  return (
    <div style={{ 
      padding: 0, 
      borderRadius: 16, 
      background: isDark ? '#1f2937' : '#2e1414ff', 
      overflow: 'hidden', 
      minWidth: 380,
      transition: 'all 0.6s ease',
    }}>
      {/* Header - same stil as PatientReg */}
      <div
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${themeLightColor} 100%)`,
          padding: '24px 20px',
          borderRadius: '16px 16px 0 0',
          marginBottom: 0,
          transition: 'all 0.6s ease',
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
              🐾 {t('PatientSearchTitle')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {t('QuickSearchById')}
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
                color: !searchByAnimalId ? themeColor : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms ease',
              }}
            >
              <span>🆔</span> {t('TC')}
            </div>
            <div
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                background: searchByAnimalId ? '#fff' : 'transparent',
                color: searchByAnimalId ? themeColor : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 200ms ease',
              }}
            >
              <span>🐾</span> {t('AnimalID')}
            </div>
          </div>
        </div>
      </div>

      {/* Arama Alanı */}
      <div style={{ padding: '20px 20px 8px 20px', background: isDark ? '#111827' : '#fff', transition: 'all 0.3s ease' }}>
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? '#d1d5db' : '#6b7280',
              display: 'block',
              marginBottom: 6,
              textAlign: 'left',
              transition: 'all 0.3s ease',
            }}
          >
            {searchByAnimalId ? `🐾 ${t('AnimalIdNumber')}` : `🆔 ${t('IdentityNumber')}`}
          </label>
          <input
            type="text"
            value={searchByAnimalId ? animalId : tc}
            onChange={(e) =>
              searchByAnimalId ? setAnimalId(e.target.value) : setTc(e.target.value)
            }
            maxLength={searchByAnimalId ? undefined : 11}
            placeholder={searchByAnimalId ? t('EnterAnimalId') : t('EnterIdentityNumber')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') search();
            }}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: `1px solid ${isDark ? '#374151' : '#e6e9f2'}`,
              fontSize: 14,
              outline: 'none',
              background: isDark ? '#1f2937' : '#f8f9fc',
              color: isDark ? '#e5e7eb' : '#000',
              transition: 'all 200ms ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = themeColor)}
            onBlur={(e) => (e.target.style.borderColor = isDark ? '#374151' : '#e6e9f2')}
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
              : `linear-gradient(135deg, ${themeColor} 0%, ${themeLightColor} 100%)`,
            color: '#fff',
            borderRadius: 10,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: `0 4px 12px ${themeColor}59`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 200ms ease',
          }}
        >
          {loading ? '...' : `🔍 ${t('Search')}`}
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
          background: isDark ? '#111827' : '#fff',
          transition: 'all 0.3s ease',
        }}
      >
        {results.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 8px',
              fontSize: 12,
              color: isDark ? '#6b7280' : '#9ca3af',
              transition: 'all 0.3s ease',
            }}
          >
            🔍 {t('SearchPlaceholder')}
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
                  border: `1px solid ${themeColor}33`,
                  background: `${themeColor}08`,
                  marginBottom: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 180ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${themeColor}15`;
                  e.currentTarget.style.borderColor = `${themeColor}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${themeColor}08`;
                  e.currentTarget.style.borderColor = `${themeColor}33`;
                }}
              >
                <span style={{ fontWeight: 600, color: isDark ? '#e5e7eb' : '#111827' }}>
                  🐾 {item.animalname}
                </span>
                <span style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>👤 {t('OwnerInfo')}: {item.user_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Alt Kapat Butonu */}
      <div
        style={{
          padding: '10px 20px 16px 20px',
          borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          background: isDark ? '#111827' : '#f9fafb',
          textAlign: 'right',
          transition: 'all 0.3s ease',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '8px 18px',
            background: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 999,
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            fontSize: 13,
            fontWeight: 500,
            color: isDark ? '#d1d5db' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {t('Cancel')}
        </button>
      </div>
    </div>
  );
};

export default AppPatientSearch;
