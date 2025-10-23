'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

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
    }, []);

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        services: [
            { name: 'Web Development', href: '#' },
            { name: 'Social Media Marketing', href: '#' },
            { name: 'Digital Solutions', href: '#' },
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
        <footer ref={footerRef} className="relative w-full bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div ref={contentRef}>
                    {/* Main Content - Centered */}
                    <div className="flex flex-col items-center text-center mb-10">
                        {/* CTA */}
                        <div className="mb-12">
                            <h2 className="text-4xl md:text-5xl text-white/90 font-light mb-3 leading-tight">
                                Ready to start?
                            </h2>
                            <p className="text-base text-white/40 mb-6 leading-relaxed max-w-xl mx-auto">
                                Let's create something exceptional together.
                            </p>
                            <Link
                                href="#contact"
                                className="group inline-flex items-center gap-3 text-white/90 hover:text-white transition-colors"
                            >
                                <span className="font-light">Get in touch</span>
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-8">
                            <div>
                                <h3 className="text-white/20 uppercase tracking-wider text-xs mb-4 font-medium">
                                    Services
                                </h3>
                                <ul className="space-y-2">
                                    {footerLinks.services.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-white/50 hover:text-white/90 transition-colors text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white/20 uppercase tracking-wider text-xs mb-4 font-medium">
                                    Company
                                </h3>
                                <ul className="space-y-2">
                                    {footerLinks.company.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-white/50 hover:text-white/90 transition-colors text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-white/20 uppercase tracking-wider text-xs mb-4 font-medium">
                                    Social
                                </h3>
                                <ul className="space-y-2">
                                    {footerLinks.social.map((link) => (
                                        <li key={link.name}>
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/50 hover:text-white/90 transition-colors text-sm inline-flex items-center gap-1 group"
                                            >
                                                {link.name}
                                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar - Centered */}
                    <div className="flex flex-col items-center gap-4 pt-8 border-t border-white/5">
                        {/* Contact Info */}
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-white/30" />
                            <a href="mailto:hello@xdigital.com" className="text-white/50 hover:text-white transition-colors">
                                hello@xdigital.com
                            </a>
                        </div>

                        {/* Legal & Brand */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
                            <motion.button
                                onClick={scrollToTop}
                                className="text-white/70 tracking-widest hover:text-white hover:cursor-pointer transition-all"
                            >
                                xDigital
                            </motion.button>
                            <span>© {currentYear}</span>
                            <Link href="#" className="hover:text-white/60 transition-colors">
                                Privacy
                            </Link>
                            <Link href="#" className="hover:text-white/60 transition-colors">
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </footer>
    );
}