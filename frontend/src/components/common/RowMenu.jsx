import { useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

const RowMenu = ({ isOpen, onToggle, onEdit, onDelete }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onToggle(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onToggle]);

    return (
        <div ref={containerRef} className="relative inline-block">
            <button
                type="button"
                onClick={() => onToggle(!isOpen)}
                className="rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                ⋯
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onEdit}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                    >
                        <Pencil size={14} strokeWidth={1.8} />
                        Edit
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onDelete}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={14} strokeWidth={1.8} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default RowMenu;
