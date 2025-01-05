import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';

interface ModalProps {
    children: React.ReactNode;
    dismissable: boolean;
    className: string | null;
    toggleModal: () => void;
    smallModal?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, toggleModal, dismissable, className, smallModal }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden'; // Prevent scrolling when the modal is open

        // Clean up when the modal is closed
        return () => {
            document.body.style.overflowY = 'auto';
            document.body.style.overflowX = 'hidden';
        };
    }, []);

    return (
        <div className={`modal ${className}`}>
            <div className={`${smallModal ? "modal-sml" : ""} modal-content p-3`}>
                {
                    dismissable ? (
                        <button onClick={toggleModal} className="btn modal-close"><FontAwesomeIcon icon={faX} /></button>
                    ) : null
                }

                {children}
            </div>
        </div>
    );
};

export default Modal;