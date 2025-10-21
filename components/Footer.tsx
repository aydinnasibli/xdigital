'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || !footerRef.current) {
            if (titleRef.current) gsap.set(titleRef.current, { opacity: 1, y: 0 });
            if (linksRef.current) gsap.set(linksRef.current, { opacity: 1, y: 0 });
            return;
        }

        const ctx = gsap.context(() => {
            if (titleRef.current) {
                gsap.fromTo(
                    titleRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: titleRef.current,
                            start: 'top 85%',
                            once: true,
                        },
                    }
                );
            }

            if (linksRef.current) {
                gsap.fromTo(
                    linksRef.current.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: linksRef.current,
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
            { name: 'Mobile Apps', href: '#' },
            { name: 'UI/UX Design', href: '#' },
            { name: 'Consulting', href: '#' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Work', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Contact', href: '#' },
        ],
        social: [
            { name: 'Instagram', href: '#' },
            { name: 'LinkedIn', href: '#' },
            { name: 'Twitter', href: '#' },
            { name: 'Dribbble', href: '#' },
        ],
    };

    return (
        <footer ref={footerRef} className="relative w-full bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-8 py-20">
                {/* Main Footer Content */}
                <div className="grid lg:grid-cols-2 gap-16 mb-20">
                    {/* Left Column - CTA */}
                    <div>
                        <h2
                            ref={titleRef}
                            className="text-5xl md:text-6xl lg:text-7xl text-white/90 font-light mb-6 leading-tight"
                        >
                            Ready to start?
                        </h2>
                        <p className="text-xl text-white/40 mb-8 leading-relaxed max-w-xl">
                            Let's create something exceptional together. Reach out and tell us about your project.
                        </p>
                        <Link
                            href="#contact"
                            className="group inline-flex items-center gap-4 text-white/90 text-lg hover:text-white transition-colors focus:outline-none focus:text-white"
                        >
                            <span className="font-light">Get in touch</span>
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-300">
                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </Link>
                    </div>

                    {/* Right Column - Links Grid */}
                    <div ref={linksRef} className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12">
                        {/* Services */}
                        <div>
                            <h3 className="text-white/20 uppercase tracking-wider text-xs mb-6 font-medium">
                                Services
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.services.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-white/50 hover:text-white/90 transition-colors text-sm focus:outline-none focus:text-white/90"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-white/20 uppercase tracking-wider text-xs mb-6 font-medium">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-white/50 hover:text-white/90 transition-colors text-sm focus:outline-none focus:text-white/90"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h3 className="text-white/20 uppercase tracking-wider text-xs mb-6 font-medium">
                                Social
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.social.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/50 hover:text-white/90 transition-colors text-sm inline-flex items-center gap-1 group focus:outline-none focus:text-white/90"
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

                {/* Contact Info Bar */}
                <div className="border-t border-white/5 pt-12 mb-12">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-white/20 uppercase tracking-wider text-xs mb-1">Email</div>
                                <a
                                    href="mailto:hello@xdigital.com"
                                    className="text-white/60 hover:text-white transition-colors text-sm focus:outline-none focus:text-white"
                                >
                                    hello@xdigital.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-white/30 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-white/20 uppercase tracking-wider text-xs mb-1">Location</div>
                                <div className="text-white/60 text-sm">Istanbul, Turkey</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
                            </div>
                            <div>
                                <div className="text-white/20 uppercase tracking-wider text-xs mb-1">Status</div>
                                <div className="text-white/60 text-sm">Available for projects</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-2xl font-extrabold text-white/90 hover:text-white transition-colors">
                            %
                        </Link>
                        <span className="text-white/30 text-sm">xDigital</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-white/30 text-xs">
                        <span>© {currentYear} xDigital. All rights reserved.</span>
                        <Link href="#" className="hover:text-white/60 transition-colors focus:outline-none focus:text-white/60">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-white/60 transition-colors focus:outline-none focus:text-white/60">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </footer>
    );
}