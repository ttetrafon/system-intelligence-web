import React, { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="items-stretch m-auto p-6 bg-basis rounded-lg shadow-xl backdrop:bg-background/50"
      onCancel={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      contentEditable='false'
      suppressContentEditableWarning
    >
      {children}
    </dialog>
  );
}
