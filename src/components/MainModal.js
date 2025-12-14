import React, { useRef, useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import '../views/scss/_login.scss';

const MainModal = ({
  isOpen,
  toggle,
  title,
  content,
  onSave,
  saveButtonLabel = 'Kaydet',
  ShowFooter = true,
  modalStyle = {},
}) => {
  const contentRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const themePrefs = localStorage.getItem('theme_prefs');
      if (themePrefs) {
        const prefs = JSON.parse(themePrefs);
        setIsDark(prefs.dark);
      }
    };
    checkDarkMode();

    const handleThemeChange = () => {
      checkDarkMode();
    };
    window.addEventListener('themechange', handleThemeChange);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  const handleSaveClick = async () => {
    if (contentRef.current?.handleSave) {
      try {
        const result = await contentRef.current.handleSave();
        if (result && onSave) {
          onSave(result);
        }
      } catch (error) {
        console.error("handleSave error:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} style={modalStyle} contentClassName={isDark ? 'dark-mode-modal' : ''}>
      <ModalHeader toggle={toggle} style={{ 
        background: isDark ? '#1f2937' : '#fff',
        color: isDark ? '#e5e7eb' : '#000',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        transition: 'all 0.3s ease'
      }}>{title}</ModalHeader>
      <ModalBody style={{ 
        maxHeight: modalStyle.maxHeight || 'none', 
        overflowY: 'auto',
        background: isDark ? '#111827' : '#fff',
        color: isDark ? '#e5e7eb' : '#000',
        transition: 'all 0.3s ease'
      }}>
        {React.cloneElement(content, { ref: contentRef })}
      </ModalBody>
      {ShowFooter && (
        <ModalFooter style={{
          background: isDark ? '#1f2937' : '#fff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
          transition: 'all 0.3s ease'
        }}>
          <Button className="login" onClick={handleSaveClick}>
            {saveButtonLabel}
          </Button>
          <Button style={{ marginBottom: '7px' }} color="secondary" onClick={toggle}>
            İptal
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default MainModal;
