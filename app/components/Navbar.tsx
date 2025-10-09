"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const { isSignedIn, isLoaded } = useUser();

    // Fix body scroll when mobile menu is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;

        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalStyle;
        }

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [mobileMenuOpen]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleNavigation = () => {
        closeMenu();
    };

    useEffect(() => {
        const handleEscKeypress = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && mobileMenuOpen) {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleEscKeypress);
        return () => {
            window.removeEventListener('keydown', handleEscKeypress);
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleRouteChange = () => {
            closeMenu();
        };

        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    return (
        <>
            <header className='relative py-6 px-4'>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center space-x-12">
                        <Link
                            href="/"
                            className="text-black font-bold text-3xl"
                            onClick={handleNavigation}
                        >
                            x Digital.
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <NavLinks />
                        </nav>
                    </div>

                    {/* Right side - Auth buttons */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {!isLoaded ? (
                            // Loading state
                            <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-xl"></div>
                        ) : isSignedIn ? (
                            // Signed in - show user button and dashboard link
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-black transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10"
                                        }
                                    }}
                                />
                            </>
                        ) : (
                            // Not signed in - show login/signup
                            <>
                                <Link
                                    href="/sign-in"
                                    className="text-gray-700 hover:text-black transition-colors font-medium"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="text-black px-6 py-2 rounded-xl shadow-xl hover:bg-black hover:text-gray-100 duration-400 transition-colors font-medium"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden text-black p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md"
                        aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                            aria-hidden="true"
                        >
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 transition-all duration-300"
                    aria-hidden="false"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-menu-heading"
                >
                    <div className="h-full flex flex-col justify-center items-center p-6">
                        <h2 id="mobile-menu-heading" className="sr-only">Mobile navigation menu</h2>

                        <nav className="flex flex-col items-center space-y-8">
                            <NavLinks isMobile={true} closeMenu={closeMenu} />

                            {/* Mobile Auth Buttons */}
                            {isLoaded && (
                                <div className="flex flex-col items-center space-y-6 mt-8">
                                    {isSignedIn ? (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                className="text-white text-2xl font-medium hover:text-gray-300 transition-colors"
                                                onClick={closeMenu}
                                            >
                                                Dashboard
                                            </Link>
                                            <UserButton
                                                afterSignOutUrl="/"
                                                appearance={{
                                                    elements: {
                                                        avatarBox: "w-12 h-12"
                                                    }
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/sign-in"
                                                className="text-white text-2xl font-medium hover:text-gray-300 transition-colors"
                                                onClick={closeMenu}
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href="/sign-up"
                                                className="text-black bg-white px-8 py-3 rounded-xl shadow-xl hover:bg-gray-100 transition-colors font-medium text-xl"
                                                onClick={closeMenu}
                                            >
                                                Sign up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

// Shared navigation links component
interface NavLinksProps {
    isMobile?: boolean;
    closeMenu?: () => void;
}
const NavLinks = ({ isMobile = false, closeMenu = () => { } }: NavLinksProps) => {
    const linkClasses = `
    relative ${isMobile ? 'text-white text-3xl' : 'text-black/85 text-sm'} tracking-wider font-medium transition-colors
    before:absolute before:bottom-0 before:left-0 before:w-0 before:h-0.5 
    before:bg-${isMobile ? 'white' : 'black/85'} before:transition-all before:duration-400 before:ease-out
    hover:before:w-full
    ${isMobile ? 'before:h-1' : 'before:h-0.5'}
  `;

    const links = [
        { name: 'Website', path: '/website' },

        { name: 'SMMA ', path: '/marketing' },
        { name: 'About', path: '/about' },
    ];

    return (
        <>
            {links.map((link) => (
                <Link
                    key={link.name}
                    href={link.path}
                    className={linkClasses}
                    onClick={isMobile ? closeMenu : undefined}
                >
                    {link.name}
                </Link>
            ))}
        </>
    );
};

export default Navbar;