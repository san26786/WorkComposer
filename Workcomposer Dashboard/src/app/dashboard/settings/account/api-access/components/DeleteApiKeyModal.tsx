"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteApiKeyModal({
  open,
  onClose,
  onDelete,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold">
          Delete API key
        </h2>

        <p className="mt-6 text-gray-600">
          Please confirm that you want to delete this API key.
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-6 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}