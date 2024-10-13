import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface ModalProps {
    children: React.ReactNode;
    dismissable: boolean;
    className: string | null;
    toggleModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, toggleModal, dismissable, className }) => {
    return (
        <div className={`modal ${className}`}>
            <div className="modal-content p-3">
                {
                dismissable ? (
                    <button onClick={toggleModal} className="btn modal-close"><FontAwesomeIcon icon={faX}/></button>
                ) : null
                }
                
                {children}
            </div>
        </div>
    );
};

export default Modal;