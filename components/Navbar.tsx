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
import { useUser, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { StaggeredMenu } from '@/components/StaggeredMenu';
import type { StaggeredMenuItem, StaggeredMenuSocialItem } from '@/components/StaggeredMenu';

export default function Navbar() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [hasBackground, setHasBackground] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { isSignedIn, user } = useUser();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);

        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                setHasBackground(true);
            } else {
                setHasBackground(false);
            }

            if (currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
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

    // Menu items for authenticated users
    const authenticatedMenuItems: StaggeredMenuItem[] = [
        { label: 'Dashboard', ariaLabel: 'Go to Dashboard', link: '/dashboard' },
        { label: 'Projects', ariaLabel: 'View Projects', link: '/dashboard/projects' },
        { label: 'Analytics', ariaLabel: 'View Analytics', link: '/dashboard/analytics' },
        { label: 'Settings', ariaLabel: 'Go to Settings', link: '/dashboard/settings' },
    ];

    // Menu items for public users
    const publicMenuItems: StaggeredMenuItem[] = [
        { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
        { label: 'Web Dev', ariaLabel: 'Web Development Services', link: '/web' },
        { label: 'Social Media', ariaLabel: 'Social Media Marketing', link: '/socialmedia' },
        { label: 'Digital Solutions', ariaLabel: 'Digital Solutions', link: '/digitalsolution' },
    ];

    // Social media links (optional)
    const socialItems: StaggeredMenuSocialItem[] = [
        { label: 'Sign In', link: '/sign-in' },
        { label: 'Sign Up', link: '/sign-up' },
    ];

    // Don't render auth-dependent content until mounted
    if (!mounted) {
        return (
            <header
                className={`fixed top-0 left-0 right-0 z-50 px-8 py-0.5 transition-all duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    } ${hasBackground ? 'bg-gray-500/10 backdrop-blur-xl shadow-lg' : ''}`}
            >
                <nav className="max-w-7xl mx-auto h-16" />
            </header>
        );
    }

    // Mobile view with StaggeredMenu
    if (isMobile) {
        return (
            <div className="absolute inset-0 z-50 pointer-events-none">
                <StaggeredMenu
                    position="right"
                    items={isSignedIn ? authenticatedMenuItems : publicMenuItems}
                    socialItems={socialItems}
                    displaySocials={true}
                    displayItemNumbering={true}
                    logoUrl={Logo.src}
                    menuButtonColor="#ffffff"
                    openMenuButtonColor="#000000"
                    accentColor="#ffffff"
                    isFixed={false}
                    changeMenuColorOnOpen={true}
                />
            </div>
        );
    }

    // Desktop view - Authenticated user navbar
    if (isSignedIn) {
        return (
            <header className='relative py-6 px-4'>
                <nav className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-10 justify-between">
                        <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                            Dashboard
                        </Link>
                        <Link href="/dashboard/projects" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                            Projects
                        </Link>
                        <Link href="/dashboard/analytics" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                            Analytics
                        </Link>
                    </div>

                    <div className="flex items-center gap-10 justify-end">
                        <Link href="/dashboard/settings" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                            Settings
                        </Link>
                        <UserButton
                            afterSignOutUrl='/'
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                }
                            }}
                        />
                    </div>
                </nav>
            </header>
        );
    }

    // Desktop view - Public/Unauthenticated user navbar
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 px-8 py-0.5 transition-all duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
                } ${hasBackground ? 'bg-gray-500/10 backdrop-blur-xl shadow-lg' : ''}`}
        >
            <nav className="max-w-7xl mx-auto grid grid-cols-3 items-center gap-8">
                <div className="flex items-center gap-10 justify-end">
                    <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                        About
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 text-sm hover:cursor-pointer text-gray-300 hover:text-white transition-colors duration-200 outline-none">
                                Services
                                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="center"
                            className="w-64 bg-black/30 rounded-xl backdrop-blur-sm border border-gray-800/50 shadow-2xl mt-2"
                        >
                            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <Link href="/web">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Web Development</span>
                                        <span className="text-xs text-gray-500">Full-stack solutions</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <Link href="/socialmedia">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Social Media Marketing</span>
                                        <span className="text-xs text-gray-500">Strategic social media management</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5 cursor-pointer py-3 px-4 transition-all duration-200 rounded-md">
                                <Link href="/digitalsolution">
                                    <div className="flex flex-col">
                                        <span className="font-medium">Digital Solutions</span>
                                        <span className="text-xs text-gray-500">Comprehensive consulting</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex justify-center">
                    <Link href="/" className="text-3xl font-extrabold text-white">
                        <Image src={Logo} alt="Logo" className="w-18 h-18" />
                    </Link>
                </div>

                <div className="flex items-center gap-10">
                    <Link href="/sign-in" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                        Sign In
                    </Link>
                    <Link href="/sign-up" className="text-sm text-gray-300 hover:text-white px-6 py-2.5 border border-gray-300/50 rounded-full hover:border-gray-300/80 hover:bg-white/5 transition-all duration-300">
                        Sign Up
                    </Link>
                </div>
            </nav>
        </header>
    );
}