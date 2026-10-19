import { createContext, useContext } from 'react';

// Lets ModalCard (or anything inside a modal) close it and label it,
// without passing refs down.
export const ModalContext = createContext({
	titleId: undefined,
	position: 'center',
	close: () => {},
});

export const useModal = () => useContext(ModalContext);
