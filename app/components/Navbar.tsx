'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-8 py-8">
            <nav className="max-w-7xl mx-auto grid grid-cols-3 items-center gap-8">
                {/* Left Navigation */}
                <div className="flex items-center gap-10 justify-end">
                    <button className="text-[15px] text-gray-400 hover:text-white transition-colors">
                        About
                    </button>
                    <button
                        className="flex items-center gap-1.5 text-[15px] text-gray-400 hover:text-white transition-colors"
                        onMouseEnter={() => setIsServicesOpen(true)}
                        onMouseLeave={() => setIsServicesOpen(false)}
                    >
                        Services
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Center Logo */}
                <div className="flex justify-center">
                    <div className="w-14 h-14 bg-white/70 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-slate-900">A</span>
                    </div>
                </div>

                {/* Right Navigation */}
                <div className="flex items-center  gap-10">
                    <button className="text-[15px] text-gray-400 hover:text-white transition-colors">
                        Work
                    </button>
                    <button className="text-[15px] text-gray-400 hover:text-white px-6 py-2.5 border border-gray-700/40 rounded-full hover:border-gray-500/60 transition-all">
                        Contact us
                    </button>
                </div>
            </nav>
        </header>
    );
}