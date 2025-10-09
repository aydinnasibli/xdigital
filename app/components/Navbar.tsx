'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
            <nav className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left Navigation */}
                <div className="flex items-center gap-8">
                    <button className="text-sm text-gray-400 hover:text-white transition-colors">
                        About
                    </button>
                    <button
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        onMouseEnter={() => setIsServicesOpen(true)}
                        onMouseLeave={() => setIsServicesOpen(false)}
                    >
                        Services
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Center Logo */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">A</span>
                    </div>
                </div>

                {/* Right Navigation */}
                <div className="flex items-center gap-8">
                    <button className="text-sm text-gray-400 hover:text-white transition-colors">
                        Work
                    </button>
                    <button className="text-sm text-gray-400 hover:text-white  px-6 py-2 border border-gray-700/50 rounded-full hover:border-gray-500 transition-all">
                        Contact us
                    </button>
                </div>
            </nav>
        </header>
    );
}