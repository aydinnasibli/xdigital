'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const { isSignedIn } = useUser();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || !footerRef.current || !contentRef.current) {
            if (contentRef.current) gsap.set(contentRef.current, { opacity: 1, y: 0 });
            return;
        }

        const ctx = gsap.context(() => {
            if (contentRef.current) {
                gsap.fromTo(
                    contentRef.current.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.05,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: contentRef.current,
                            start: 'top 90%',
                            once: true,
                        },
                    }
                );
            }
        }, footerRef);

        return () => ctx.revert();
    }, [mounted, isSignedIn]);

    // Don't render footer until mounted to prevent hydration issues
    if (!mounted) {
        return null;
    }

    // Don't render footer for authenticated users
    if (isSignedIn) {
        return null;
    }

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        services: [
            { name: 'Web Development', href: '/web' },
            { name: 'Social Media Marketing', href: '/socialmedia' },
            { name: 'Digital Solutions', href: '/digitalsolution' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Careers', href: '#' },
            { name: 'Contact', href: '#' },
        ],
        social: [
            { name: 'Instagram', href: '#' },
            { name: 'LinkedIn', href: '#' },
            { name: 'Twitter', href: '#' },
        ],
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer ref={footerRef} className="relative w-full ">
            <div className="max-w-7xl mx-auto px-8 py-16">
                <div ref={contentRef}>
                    {/* Main Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-[1fr,auto] gap-12 lg:gap-20 mb-12">
                        {/* Left - Brand & Contact */}
                        <div className="space-y-6">
                            <motion.button
                                onClick={scrollToTop}
                                className="text-2xl font-light text-white/80 hover:text-white hover:cursor-pointer transition-colors duration-300 tracking-tight"
                            >
                                xDigital
                            </motion.button>
                            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                                Digital agency focused on craft. Building products that matter.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <a
                                    href="mailto:hello@xdigital.com"
                                    className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300"
                                >
                                    hello@xdigital.com
                                </a>
                            </div>
                        </div>

                        {/* Right - Links Grid */}
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-white/30 uppercase tracking-widest text-[10px] mb-4 font-mono">
                                    Services
                                </h3>
                                <ul className="space-y-2.5">
                                    {footerLinks.services.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300 font-light"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white/30 uppercase tracking-widest text-[10px] mb-4 font-mono">
                                    Company
                                </h3>
                                <ul className="space-y-2.5">
                                    {footerLinks.company.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300 font-light"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white/30 uppercase tracking-widest text-[10px] mb-4 font-mono">
                                    Social
                                </h3>
                                <ul className="space-y-2.5">
                                    {footerLinks.social.map((link) => (
                                        <li key={link.name}>
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300 font-light inline-flex items-center gap-1 group"
                                            >
                                                {link.name}
                                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-white/5">
                        <div className="text-[11px] text-white/30 font-mono">
                            © {currentYear} xDigital. All rights reserved.
                        </div>

                        <div className="flex items-center gap-6 text-[11px] text-white/30 font-mono">
                            <Link href="#" className="hover:text-white/60 transition-colors duration-300">
                                Privacy
                            </Link>
                            <Link href="#" className="hover:text-white/60 transition-colors duration-300">
                                Terms
                            </Link>
                            <Link href="#" className="hover:text-white/60 transition-colors duration-300">
                                FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}