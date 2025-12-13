import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog'; // senin dialog bileşenin

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    message: '',
    title: 'Onay',
    answerTrue: 'Evet',
    answerFalse: '',
    resolve: () => {},
  });

  const confirm = useCallback((message, answerTrue = 'Evet', answerFalse = '', title = 'Onay') => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        message,
        title,
        answerTrue,
        answerFalse,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }
  }, [state.isOpen]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={state.isOpen}
        toggle={handleCancel}
        onConfirm={handleConfirm}
        message={state.message}
        toggleMessage={state.title}
        answerTrue={state.answerTrue}
        answerFalse={state.answerFalse}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
