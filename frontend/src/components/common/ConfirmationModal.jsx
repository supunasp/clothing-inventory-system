import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({
                               isOpen,
                               title = "Confirm Update",
                               message = "Are you sure you want to continue?",
                               confirmText = "Confirm",
                               cancelText = "Cancel",
                               isLoading = false,
                               onConfirm,
                               onCancel,
                           }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
                            <AlertTriangle size={20} strokeWidth={1.8} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                {title}
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Confirmation required
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed"
                        aria-label="Close confirmation modal"
                    >
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <div className="px-5 py-5">
                    <p className="text-sm leading-6 text-gray-600">
                        {message}
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-md border border-gray-200 px-5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-md bg-emerald-600 px-5 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Updating..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;