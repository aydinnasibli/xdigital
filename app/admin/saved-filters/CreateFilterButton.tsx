// app/admin/saved-filters/CreateFilterButton.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateFilterModal from './CreateFilterModal';

export default function CreateFilterButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Create Filter
            </button>

            {isModalOpen && (
                <CreateFilterModal onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}
