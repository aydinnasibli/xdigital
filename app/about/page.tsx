'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Sparkles, Users, Target, Zap, Award, Heart, Code2, Palette, TrendingUp } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export default function page() {
    const [activeValue, setActiveValue] = useState(0)
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveValue((prev) => (prev + 1) % values.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const values = [
        {
            icon: Heart,
            title: "Passion-Driven",
            description: "We obsess over details because we genuinely care about creating exceptional digital experiences."
        },
        {
            icon: Target,
            title: "Results-Focused",
            description: "Every pixel, every line of code serves a purpose - driving measurable outcomes for your business."
        },
        {
            icon: Sparkles,
            title: "Innovation First",
            description: "We don't follow trends, we set them. Constantly pushing boundaries with cutting-edge technology."
        },
        {
            icon: Users,
            title: "Partnership Mindset",
            description: "Your success is our success. We're not just vendors - we're your dedicated growth partners."
        }
    ]

    const team = [
        {
            name: "Alex Morgan",
            role: "Founder & Creative Director",
            bio: "10+ years crafting digital experiences for Fortune 500s and ambitious startups.",
            expertise: ["Strategy", "UX/UI", "Branding"]
        },
        {
            name: "Jordan Chen",
            role: "Lead Developer",
            bio: "Full-stack wizard with a passion for elegant, scalable solutions.",
            expertise: ["React", "Node.js", "Cloud"]
        },
        {
            name: "Sam Rivera",
            role: "Growth Strategist",
            bio: "Data-driven marketing expert who turns clicks into customers.",
            expertise: ["SEO", "Analytics", "Conversion"]
        }
    ]

    const stats = [
        { number: "50+", label: "Projects Launched" },
        { number: "98%", label: "Client Satisfaction" },
        { number: "3x", label: "Avg. ROI Increase" },
        { number: "24/7", label: "Support Available" }
    ]

    const journey = [
        {
            year: "2019",
            title: "The Beginning",
            description: "Started as a small team with big dreams in a garage"
        },
        {
            year: "2021",
            title: "Growth Phase",
            description: "Expanded to 10+ team members, launched 30+ successful projects"
        },
        {
            year: "2023",
            title: "Recognition",
            description: "Won multiple industry awards, featured in tech publications"
        },
        {
            year: "2025",
            title: "Innovation Era",
            description: "Leading with AI-powered solutions and next-gen web experiences"
        }
    ]

    return (
        <div className='relative w-full overflow-x-hidden'>
            {/* Hero Section with Parallax */}
            <motion.section
                ref={heroRef}
                style={{ opacity, scale }}
                className='relative min-h-screen w-full flex items-center justify-center px-4 pt-20'
            >
                {/* Animated Background Grid */}
                <div className='absolute inset-0 overflow-hidden'>
                    <div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent)]' />
                </div>

                <div className='relative z-10 max-w-6xl mx-auto text-center space-y-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm'
                    >
                        <Sparkles className='w-4 h-4 text-white/60' />
                        <span className='text-xs text-white/60 uppercase tracking-wider'>About xDigital</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white/90 leading-tight'
                    >
                        We build digital products<br />
                        <span className='text-white/50'>that people love</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className='text-lg md:text-xl text-white/40 max-w-3xl mx-auto leading-relaxed'
                    >
                        Born from a belief that every business deserves exceptional digital presence.
                        We're a team of designers, developers, and strategists obsessed with turning
                        ambitious ideas into reality.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <Link
                            href='/contact'
                            className='group inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full hover:scale-105 transition-all duration-300'
                        >
                            <span className='font-light'>Start Your Project</span>
                            <ArrowUpRight className='w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Stats Section */}
            <section className='relative w-full py-20 border-t border-white/5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className='text-center space-y-2'
                            >
                                <div className='text-4xl md:text-5xl font-light text-white/90'>
                                    {stat.number}
                                </div>
                                <div className='text-sm text-white/40 uppercase tracking-wider'>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className='relative w-full py-32'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className='max-w-4xl mx-auto'
                    >
                        <h2 className='text-sm text-white/40 uppercase tracking-widest font-mono mb-12'>
                            Our Story
                        </h2>
                        <div className='space-y-6 text-lg md:text-xl text-white/60 leading-relaxed'>
                            <p>
                                It started with a simple frustration: too many businesses were stuck with
                                outdated websites and ineffective digital strategies, held back by agencies
                                that overpromised and underdelivered.
                            </p>
                            <p>
                                We knew there had to be a better way. A way that combined cutting-edge
                                technology with genuine partnership, where results spoke louder than buzzwords,
                                and where every client felt like they had a dedicated team in their corner.
                            </p>
                            <p className='text-white/80 font-light'>
                                Today, we're proud to be that better way for businesses across the globe.
                                Every project we take on, every line of code we write, every design we craft -
                                it all serves one purpose: helping you succeed.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values - Rotating Showcase */}
            <section className='relative w-full py-32 border-t border-white/5'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-sm text-white/40 uppercase tracking-widest font-mono mb-16 text-center'>
                        What Drives Us
                    </h2>

                    <div className='relative min-h-[400px] flex items-center'>
                        {values.map((value, idx) => {
                            const Icon = value.icon
                            return (
                                <motion.div
                                    key={idx}
                                    initial={false}
                                    animate={{
                                        opacity: activeValue === idx ? 1 : 0,
                                        scale: activeValue === idx ? 1 : 0.9,
                                        y: activeValue === idx ? 0 : 20
                                    }}
                                    transition={{ duration: 0.7, ease: "easeInOut" }}
                                    className='absolute inset-0'
                                    style={{
                                        pointerEvents: activeValue === idx ? 'auto' : 'none'
                                    }}
                                >
                                    <div className='flex flex-col items-center text-center space-y-8'>
                                        <div className='relative'>
                                            <div className='absolute inset-0 bg-white/5 blur-3xl rounded-full' />
                                            <div className='relative p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm'>
                                                <Icon className='w-12 h-12 text-white/60' />
                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <h3 className='text-3xl md:text-4xl font-light text-white/90'>
                                                {value.title}
                                            </h3>
                                            <p className='text-lg text-white/50 max-w-2xl leading-relaxed'>
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Progress Indicators */}
                    <div className='flex justify-center gap-3 mt-16'>
                        {values.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveValue(idx)}
                                className={`h-1 transition-all duration-500 ${activeValue === idx
                                    ? 'w-12 bg-white/80'
                                    : 'w-8 bg-white/20 hover:bg-white/40'
                                    }`}
                                aria-label={`View value ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Journey Timeline */}
            <section className='relative w-full py-32'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-sm text-white/40 uppercase tracking-widest font-mono mb-20 text-center'>
                        Our Journey
                    </h2>

                    <div className='relative'>
                        {/* Timeline Line */}
                        <div className='absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent hidden md:block' />

                        <div className='space-y-24'>
                            {journey.map((milestone, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                                    className={`relative grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content */}
                                    <div className={`space-y-4 ${idx % 2 === 0 ? 'md:pr-16' : 'md:pl-16 md:col-start-2'}`}>
                                        <div className='text-5xl md:text-6xl font-light text-white/10'>
                                            {milestone.year}
                                        </div>
                                        <h3 className='text-2xl font-light text-white/90'>
                                            {milestone.title}
                                        </h3>
                                        <p className='text-white/50 leading-relaxed'>
                                            {milestone.description}
                                        </p>
                                    </div>

                                    {/* Center Dot */}
                                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block'>
                                        <div className='w-4 h-4 rounded-full bg-white/60 ring-4 ring-white/10' />
                                    </div>

                                    {/* Empty space for grid alignment */}
                                    <div className={idx % 2 === 0 ? 'md:col-start-2' : 'md:col-start-1'} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className='relative w-full py-32 border-t border-white/5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center mb-20'>
                        <h2 className='text-sm text-white/40 uppercase tracking-widest font-mono mb-4'>
                            Meet The Team
                        </h2>
                        <p className='text-2xl md:text-3xl font-light text-white/70 max-w-2xl mx-auto'>
                            Talented individuals united by passion
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className='group relative'
                            >
                                <div className='relative border border-white/10 rounded-2xl p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 space-y-6'>
                                    {/* Avatar Placeholder */}
                                    <div className='w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-3xl font-light text-white/40'>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>

                                    <div className='space-y-2'>
                                        <h3 className='text-xl font-light text-white/90'>
                                            {member.name}
                                        </h3>
                                        <p className='text-sm text-white/40 uppercase tracking-wider'>
                                            {member.role}
                                        </p>
                                    </div>

                                    <p className='text-sm text-white/50 leading-relaxed'>
                                        {member.bio}
                                    </p>

                                    <div className='flex flex-wrap gap-2'>
                                        {member.expertise.map((skill, i) => (
                                            <span
                                                key={i}
                                                className='text-xs px-3 py-1 rounded-full border border-white/10 text-white/50'
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className='relative w-full py-32 border-t border-white/5'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8'>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className='text-3xl md:text-4xl lg:text-5xl font-light text-white/90 leading-tight'
                    >
                        Ready to work with a team<br />that genuinely cares?
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className='text-lg text-white/50 max-w-2xl mx-auto'
                    >
                        Let's turn your vision into something extraordinary
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-8'
                    >
                        <Link
                            href='/contact'
                            className='group inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full hover:scale-110 transition-all duration-300'
                        >
                            <span className='font-light'>Get In Touch</span>
                            <ArrowUpRight className='w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}