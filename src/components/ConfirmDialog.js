import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';

const ConfirmDialog = ({
  isOpen,
  toggle,
  onConfirm,
  message,
  answerTrue = 'Evet',
  answerFalse = '',
  toggleMessage = 'Onay'
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{toggleMessage}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onConfirm}>
          {answerTrue}
        </Button>
        {answerFalse && (
          <Button color="secondary" onClick={toggle}>
            {answerFalse}
          </Button>
        )}     
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;
