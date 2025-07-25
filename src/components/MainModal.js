import React, { useRef } from 'react';
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
    <Modal isOpen={isOpen} toggle={toggle} style={modalStyle}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody style={{ maxHeight: modalStyle.maxHeight || 'none', overflowY: 'auto' }}>
        {React.cloneElement(content, { ref: contentRef })}
      </ModalBody>
      {ShowFooter && (
        <ModalFooter>
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
