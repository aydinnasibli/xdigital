'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../public/assets/logo.png';

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [hasBackground, setHasBackground] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Add background when scrolled down
            if (currentScrollY > 50) {
                setHasBackground(true);
            } else {
                setHasBackground(false);
            }

            // Show navbar when at top of page
            if (currentScrollY < 10) {
                setIsVisible(true);
            }
            // Hide when scrolling down, show when scrolling up
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);




    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 px-8 py-0.5 transition-all duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
                } ${hasBackground ? 'bg-gray-800/10 backdrop-blur-xl shadow-lg' : ''
                }`}
        >
            <nav className="max-w-7xl mx-auto grid grid-cols-3 items-center gap-8">
                {/* Left Navigation */}
                <div className="flex items-center gap-10 justify-end">
                    <Link href={"/about"} className="text-[15px] text-gray-400 hover:text-white transition-colors duration-200">
                        About
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 text-[15px] hover:cursor-pointer text-gray-400 hover:text-white transition-colors duration-200 outline-none">
                                Services
                                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="center"
                            className="w-64 bg-black/30 rounded-xl backdrop-blur-sm border border-gray-800/50 shadow-2xl mt-2"
                        >
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-medium">Web Development</span>
                                    <span className="text-xs text-gray-500">Full-stack solutions</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-medium">Mobile Apps</span>
                                    <span className="text-xs text-gray-500">iOS & Android</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-medium">UI/UX Design</span>
                                    <span className="text-xs text-gray-500">Beautiful interfaces</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <div className="flex flex-col">
                                    <span className="font-medium">Consulting</span>
                                    <span className="text-xs text-gray-500">Strategic guidance</span>
                                </div>
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Center Logo */}
                <div className="flex justify-center">
                    <Link href={"/"} className='text-3xl font-extrabold text-white ' >
                        <Image src={Logo} alt="Logo" className='w-18 h-18 ' />
                    </Link>
                </div>

                {/* Right Navigation */}
                <div className="flex items-center gap-10">
                    <Link href={'sign-in'} className="text-[15px] text-gray-400 hover:text-white transition-colors duration-200">
                        Sign In
                    </Link>
                    <Link href={'sign-up'} className="text-[15px] text-gray-400 hover:text-white px-6 py-2.5 border border-gray-700/50 rounded-full hover:border-gray-400/80 hover:bg-white/5 transition-all duration-300">
                        Log Up
                    </Link>
                </div>
            </nav>
        </header>
    );
}