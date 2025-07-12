import React from 'react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onSave: (notes: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSave,
}) => {
  const [value, setValue] = React.useState(notes);

  React.useEffect(() => {
    setValue(notes);
  }, [notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">📝 Your Notes</h2>
        <textarea
          className="w-full h-40 p-2 border border-gray-300 rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end mt-4 gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              onSave(value);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
