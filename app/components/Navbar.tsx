"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);



    // Fix body scroll when mobile menu is open
    useEffect(() => {
        // Store original body overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;

        if (mobileMenuOpen) {
            // Prevent scrolling on the body when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scrolling when menu is closed
            document.body.style.overflow = originalStyle;
        }

        return () => {
            // Cleanup on unmount
            document.body.style.overflow = originalStyle;
        };
    }, [mobileMenuOpen]);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Close mobile menu
    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    // Close mobile menu on navigation
    const handleNavigation = () => {
        closeMenu();
    };

    // Close mobile menu on escape key press
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

    // Close menu on route change
    useEffect(() => {
        // This will close the menu when navigation occurs
        const handleRouteChange = () => {
            closeMenu();
        };

        // Add event listener for route changes if you're using Next.js router events
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    return (
        <>
            {/* Fixed header that changes style on scroll */}
            <header className='relative  py-6 px-4   '>
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center space-x-12">
                        {/* Logo */}
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
                        <Link
                            href="/sign-in"
                            className="text-gray-700 hover:text-black transition-colors font-medium"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/sign-up"
                            className=" text-black px-6 py-2 rounded-xl shadow-xl  hover:bg-black hover:text-gray-100 duration-400 transition-colors font-medium"
                        >
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md"
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
            {/* Using conditional rendering for complete accessibility */}
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
    relative text-black/85 tracking-wider font-medium transition-colors
    before:absolute before:bottom-0 before:left-0 before:w-0 before:h-0.5 
    before:bg-black/85 before:transition-all before:duration-400 before:ease-out
    hover:before:w-full
    ${isMobile ? 'text-3xl before:h-1' : 'text-sm before:h-0.5'}
  `;

    const links = [
        { name: 'Social Media', path: '/services' },
        { name: 'Website', path: '/studyabroad' },
        { name: 'Marketing Agency', path: '/preschool' },
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