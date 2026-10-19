import React from 'react';
import ModalBase from './modal-base';
import ModalCard from './modal-card';

// HM's Modal API, unchanged for callers:
//   const ref = useRef(null);
//   <Modal.Center refName={ref} width="520px" onClose={...}>…</Modal.Center>
//   ref.current.open() / ref.current.close()
// Modal.Right is new (filter drawers). Wrap content in <Modal.Card> for the
// standard header / body / footer.
const Modal = ({ children }) => <>{children}</>;

Modal.Center = (props) => <ModalBase position="center" {...props} />;
Modal.Left = (props) => <ModalBase position="left" {...props} />;
Modal.Right = (props) => <ModalBase position="right" {...props} />;
Modal.Bottom = (props) => <ModalBase position="bottom" {...props} />;
Modal.Card = ModalCard;

Modal.Center.displayName = 'Modal.Center';
Modal.Left.displayName = 'Modal.Left';
Modal.Right.displayName = 'Modal.Right';
Modal.Bottom.displayName = 'Modal.Bottom';

export default Modal;
