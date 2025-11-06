import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="text-gray-400 mb-6">{message}</div>
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
