'use client'
import React, { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import { ArrowUpRight, Minus, Plus } from 'lucide-react'

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef })

    const philosophy = [
        {
            num: "01",
            title: "Craft Over Speed",
            desc: "We believe great work takes time. Every detail matters, every interaction counts."
        },
        {
            num: "02",
            title: "Human-Centered",
            desc: "Technology serves people, not the other way around. We design for real humans."
        },
        {
            num: "03",
            title: "Radical Honesty",
            desc: "No corporate speak. No empty promises. Just straight talk about what works."
        },
        {
            num: "04",
            title: "Continuous Growth",
            desc: "We're students first, experts second. Always learning, always evolving."
        },
    ]

    const journey = [
        { year: "2019", event: "Founded in a garage", detail: "Three friends, one vision" },
        { year: "2020", event: "First enterprise client", detail: "Fortune 500 partnership" },
        { year: "2021", event: "Expanded team", detail: "From 3 to 10 people" },
        { year: "2022", event: "International reach", detail: "Clients across 5 continents" },
        { year: "2023", event: "Industry recognition", detail: "Multiple design awards" },
        { year: "2024", event: "New chapter", detail: "25 people, infinite possibilities" },
    ]

    return (
        <div ref={containerRef} className="relative text-white">
            {/* Noise Texture Overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none -z-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Hero - Different approach with side-by-side layout */}
            <section className="relative min-h-screen flex items-center px-6 lg:px-12">
                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center py-20">
                    {/* Left - Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1 border border-white/20 text-white/60 text-xs uppercase tracking-widest">
                                About Us
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
                                We don&apos;t follow
                                <br />
                                <span className="font-normal">trends.</span>
                                <br />
                                We set them.
                            </h1>
                        </div>

                        <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                            xDigital is a collective of designers, developers, and strategists
                            obsessed with creating digital experiences that actually matter.
                        </p>
                    </motion.div>

                    {/* Right - Large Year Display with better design */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="relative flex items-center justify-center"
                    >
                        <div className="relative">
                            {/* Outer ring */}
                            <svg className="w-80 h-80 md:w-96 md:h-96" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                                    </linearGradient>
                                </defs>

                                {/* Outer circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="95"
                                    fill="none"
                                    stroke="url(#ringGradient)"
                                    strokeWidth="0.5"
                                />

                                {/* Middle circles */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="75"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="0.3"
                                    strokeDasharray="2 4"
                                />

                                <circle
                                    cx="100"
                                    cy="100"
                                    r="55"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="0.3"
                                />
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-7xl md:text-8xl font-light text-white/90 mb-2">2019</div>
                                <div className="text-xs text-white/40 uppercase tracking-[0.3em]">Founded</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What We Do - Replace stats with actual content */}
            <section className="relative py-32 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-start">
                        {/* Left - Title */}
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-light leading-tight">
                                We build products
                                <br />
                                <span className="text-white/40">people love to use</span>
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed">
                                From concept to launch, we handle everything. Strategy, design,
                                development, and growth. One team, complete ownership.
                            </p>
                        </div>

                        {/* Right - Capabilities */}
                        <div className="space-y-8">
                            {[
                                {
                                    title: "Strategy & Research",
                                    items: ["User Research", "Market Analysis", "Product Strategy", "Brand Positioning"]
                                },
                                {
                                    title: "Design & Experience",
                                    items: ["UI/UX Design", "Design Systems", "Prototyping", "Motion Design"]
                                },
                                {
                                    title: "Development & Tech",
                                    items: ["Web Development", "Mobile Apps", "Custom Solutions", "API Integration"]
                                },
                                {
                                    title: "Growth & Marketing",
                                    items: ["Digital Marketing", "SEO Strategy", "Content Creation", "Analytics"]
                                }
                            ].map((category, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <h3 className="text-xl font-light mb-4 text-white/90">{category.title}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {category.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="text-sm text-white/40 py-2 px-4 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-default"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Approach - Better than philosophy */}
            <section className="relative py-32 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-20">
                        <Minus className="w-8 h-8 text-white/20 mb-6" />
                        <h2 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                            How we work
                        </h2>
                        <p className="text-white/50 text-lg">
                            Every project is different, but our process stays consistent.
                            Clarity, collaboration, and execution.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-16">
                        {[
                            {
                                phase: "Discovery",
                                duration: "1-2 weeks",
                                desc: "We dive deep into your business, users, and goals. No assumptions, just data and insights.",
                                steps: ["Stakeholder interviews", "User research", "Competitive analysis", "Technical audit"]
                            },
                            {
                                phase: "Design & Build",
                                duration: "4-12 weeks",
                                desc: "Iterative design sprints. Weekly reviews. Continuous feedback. We build in the open.",
                                steps: ["Wireframes & prototypes", "Visual design", "Development", "Testing & QA"]
                            },
                            {
                                phase: "Launch & Grow",
                                duration: "Ongoing",
                                desc: "A successful launch is just the beginning. We monitor, optimize, and scale with you.",
                                steps: ["Deployment", "Performance monitoring", "User analytics", "Continuous improvement"]
                            }
                        ].map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                                className="relative group"
                            >
                                <div className="space-y-6">
                                    {/* Phase header */}
                                    <div className="space-y-2">
                                        <div className="inline-block px-3 py-1 border border-white/10 text-white/40 text-xs font-mono">
                                            {phase.duration}
                                        </div>
                                        <h3 className="text-3xl font-light group-hover:text-white transition-colors">
                                            {phase.phase}
                                        </h3>
                                    </div>

                                    <p className="text-white/50 leading-relaxed">
                                        {phase.desc}
                                    </p>

                                    {/* Steps */}
                                    <div className="space-y-2 pt-4">
                                        {phase.steps.map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 text-sm text-white/40 group-hover:text-white/60 transition-colors"
                                            >
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Connecting line */}
                                {idx < 2 && (
                                    <div className="hidden lg:block absolute top-12 -right-8 w-16 h-px bg-white/10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team - Different layout with overlapping cards */}
            <section className="relative py-32 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-light mb-4">Leadership</h2>
                        <p className="text-white/50 text-lg">The people behind the pixels</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Alex Morgan", role: "Founder & Creative Director", quote: "Design is intelligence made visible" },
                            { name: "Jordan Chen", role: "Co-founder & CTO", quote: "Code is poetry in motion" },
                            { name: "Sam Rivera", role: "Head of Growth", quote: "Strategy without execution is just a daydream" },
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="group"
                            >
                                <div className="relative">
                                    {/* Image placeholder with gradient */}
                                    <div className="aspect-[3/4] bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg mb-6 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {/* Grid overlay */}
                                        <div className="absolute inset-0">
                                            <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <defs>
                                                    <pattern id={`pattern-${idx}`} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                                                        <line x1="0" y1="0" x2="0" y2="5" stroke="white" strokeWidth="0.1" />
                                                        <line x1="0" y1="0" x2="5" y2="0" stroke="white" strokeWidth="0.1" />
                                                    </pattern>
                                                </defs>
                                                <rect width="100" height="100" fill={`url(#pattern-${idx})`} />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-xl font-light">{member.name}</h3>
                                            <p className="text-white/40 text-sm">{member.role}</p>
                                        </div>
                                        <p className="text-white/60 text-sm italic leading-relaxed border-l-2 border-white/10 pl-4">
                                            &quot;{member.quote}&quot;
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - Minimal and direct */}
            <section className="relative py-40 px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center space-y-12"
                >
                    <h2 className="text-4xl md:text-6xl font-light leading-tight">
                        Let&apos;s create something
                        <br />
                        worth talking about
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group inline-flex items-center gap-3 px-10 py-4 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                    >
                        <span className="text-lg font-light">Get in Touch</span>
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </section>
        </div>
    )
}