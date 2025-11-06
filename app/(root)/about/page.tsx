'use client'
import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowUpRight, Minus, ChevronDown } from 'lucide-react'

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef })
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    const values = [
        {
            num: "01",
            title: "Excellence First",
            desc: "We don't compromise on quality. Every pixel, every line of code, every interaction is crafted with meticulous attention to detail."
        },
        {
            num: "02",
            title: "Human-Centered Design",
            desc: "Technology should enhance human experience, not complicate it. We design with empathy and purpose."
        },
        {
            num: "03",
            title: "Transparent Partnership",
            desc: "No corporate jargon, no hidden agendas. We communicate openly, honestly, and frequently."
        },
        {
            num: "04",
            title: "Innovation & Growth",
            desc: "The digital landscape evolves daily. We stay ahead through continuous learning and experimentation."
        },
    ]

    const timeline = [
        { year: "2019", event: "The Beginning", detail: "Three designers, one shared vision in a small studio" },
        { year: "2020", event: "First Major Client", detail: "Partnership with Fortune 500 enterprise" },
        { year: "2021", event: "Team Expansion", detail: "Growing from 3 to 15 talented professionals" },
        { year: "2022", event: "Global Presence", detail: "Projects delivered across 5 continents" },
        { year: "2023", event: "Industry Recognition", detail: "Awwwards, CSS Design Awards, FWA" },
        { year: "2024", event: "New Horizons", detail: "30+ team members, expanding our impact" },
    ]

    const faqs = [
        {
            q: "What industries do you work with?",
            a: "We work across diverse sectors including technology, finance, healthcare, e-commerce, and education. Our adaptable approach allows us to deliver exceptional results regardless of industry."
        },
        {
            q: "What's your typical project timeline?",
            a: "Project timelines vary based on scope and complexity. A typical website project takes 8-12 weeks, while larger digital products may span 3-6 months. We provide detailed timelines during the discovery phase."
        },
        {
            q: "Do you offer ongoing support?",
            a: "Absolutely. We offer various support packages including maintenance, updates, performance optimization, and strategic consulting to ensure your digital products continue to perform at their best."
        },
        {
            q: "What's your pricing structure?",
            a: "We offer both project-based and retainer arrangements. Pricing depends on project scope, complexity, and timeline. We provide transparent estimates after the initial consultation."
        }
    ]

    const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
        const ref = useRef<HTMLDivElement>(null)
        const isInView = useInView(ref, { once: true })
        const [count, setCount] = useState(0)

        React.useEffect(() => {
            if (isInView) {
                let start = 0
                const end = value
                const duration = 2000
                const increment = end / (duration / 16)

                const timer = setInterval(() => {
                    start += increment
                    if (start >= end) {
                        setCount(end)
                        clearInterval(timer)
                    } else {
                        setCount(Math.floor(start))
                    }
                }, 16)

                return () => clearInterval(timer)
            }
        }, [isInView, value])

        return (
            <div ref={ref} className="text-5xl md:text-6xl font-light">
                {count}{suffix}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Noise Texture */}
            <div
                className="fixed inset-0 opacity-[0.02] pointer-events-none z-50"
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
            {/* Stats Section */}
            <section className="relative py-24 px-6 border-y border-white/[0.08]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                        {[
                            { value: 200, suffix: "+", label: "Projects Delivered" },
                            { value: 50, suffix: "+", label: "Happy Clients" },
                            { value: 30, suffix: "+", label: "Team Members" },
                            { value: 15, suffix: "+", label: "Industry Awards" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="text-center"
                            >
                                <div className="mb-3 text-white">
                                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-white/40 text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-16 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            <div className="flex items-center gap-3 text-white/30 text-sm uppercase tracking-[0.2em]">
                                <Minus className="w-5 h-5" />
                                <span>Our Mission</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-[1.2]">
                                Building digital products that drive real business results
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-3 space-y-6 text-white/50 text-base md:text-lg leading-relaxed"
                        >
                            <p>
                                We believe exceptional digital experiences are built at the intersection
                                of beautiful design, robust technology, and strategic thinking.
                            </p>
                            <p>
                                Every project is an opportunity to push boundaries, challenge conventions,
                                and create something that doesn't just look good—it performs exceptionally.
                            </p>
                            <p>
                                Our multidisciplinary team brings together diverse perspectives and deep
                                expertise to solve complex problems with elegant, user-centric solutions.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="relative py-32 px-6 border-t border-white/[0.08]">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light">Our Principles</h2>
                            <p className="text-white/40 text-lg">
                                The foundation of how we operate and deliver
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-px ">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="group relative p-10 md:p-12 rounded-2xl  hover:bg-white/[0.02] transition-colors duration-300"
                            >
                                {/* Number */}
                                <div className="absolute top-8 right-8 text-7xl font-light text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-300">
                                    {value.num}
                                </div>

                                <div className="relative space-y-4">
                                    <h3 className="text-xl md:text-2xl font-light">{value.title}</h3>
                                    <p className="text-white/50 leading-relaxed text-sm md:text-base">{value.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="relative py-32 px-6 border-t border-white/[0.08]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            What We Do
                        </h2>
                        <p className="text-white/40 text-lg max-w-2xl">
                            End-to-end digital solutions. From strategy through execution and beyond.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px ">
                        {[
                            {
                                title: "Strategy & Research",
                                services: ["Digital Strategy", "Brand Positioning", "Market Research", "User Research"]
                            },
                            {
                                title: "Design & Experience",
                                services: ["UI/UX Design", "Design Systems", "Prototyping", "Visual Identity"]
                            },
                            {
                                title: "Development",
                                services: ["Web Applications", "Mobile Apps", "E-commerce", "API Integration"]
                            },
                            {
                                title: "Growth & Marketing",
                                services: ["SEO & Analytics", "Performance Marketing", "Content Strategy", "Optimization"]
                            }
                        ].map((category, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="group rounded-2xl  p-8 md:p-10 hover:bg-white/[0.02] transition-colors duration-300"
                            >
                                <div className="mb-8 pb-4 border-b border-white/[0.08]">
                                    <h3 className="text-lg md:text-xl font-light">{category.title}</h3>
                                </div>
                                <div className="space-y-3">
                                    {category.services.map((service, i) => (
                                        <div
                                            key={i}
                                            className="text-white/40 group-hover:text-white/60 transition-colors text-sm"
                                        >
                                            {service}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="relative py-32 px-6 border-t border-white/[0.08]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            How We Work
                        </h2>
                        <p className="text-white/40 text-lg max-w-2xl">
                            Our proven process ensures clarity, collaboration, and exceptional results
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        {[
                            {
                                phase: "01 — Discovery",
                                duration: "1-2 weeks",
                                desc: "We dive deep into your business, users, and goals. No assumptions, just data and insights.",
                                steps: ["Stakeholder interviews", "User research", "Competitive analysis", "Technical audit"]
                            },
                            {
                                phase: "02 — Design & Build",
                                duration: "4-12 weeks",
                                desc: "Iterative design sprints with weekly reviews and continuous feedback. We build in the open.",
                                steps: ["Wireframes & prototypes", "Visual design", "Development", "Testing & QA"]
                            },
                            {
                                phase: "03 — Launch & Grow",
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
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="relative group"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="text-xs text-white/30 uppercase tracking-[0.2em] font-mono">
                                            {phase.duration}
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-light">
                                            {phase.phase}
                                        </h3>
                                    </div>

                                    <p className="text-white/40 leading-relaxed">
                                        {phase.desc}
                                    </p>

                                    <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                                        {phase.steps.map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 text-sm text-white/40"
                                            >
                                                <div className="w-1 h-1 rounded-full bg-white/30 mt-2 flex-shrink-0" />
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="relative py-32 px-6 border-t border-white/[0.08]">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-20 text-center"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">Our Journey</h2>
                        <p className="text-white/40 text-lg">
                            Five years of growth, learning, and impact
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-0 md:left-1/2 bg-white/[0.2] top-0 bottom-0 w-px " />

                        <div className="space-y-16">
                            {timeline.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                                    className={`relative flex items-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content */}
                                    <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'} pl-12 md:pl-0`}>
                                        <div className="inline-block">
                                            <div className="text-4xl md:text-5xl font-light mb-2">
                                                {item.year}
                                            </div>
                                            <div className="text-lg md:text-xl font-light mb-2">{item.event}</div>
                                            <div className="text-white/40 text-sm">{item.detail}</div>
                                        </div>
                                    </div>

                                    {/* Center dot */}
                                    <div className="absolute left-0 md:left-1/2 w-3 h-3 -ml-1.5 bg-white rounded-full" />

                                    {/* Empty space for alignment */}
                                    <div className="hidden md:block w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-32 px-6 border-t border-white/[0.08]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-white/40 text-lg">
                            Everything you need to know about working with us
                        </p>
                    </motion.div>

                    <div className="space-y-px ">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left group hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="text-base md:text-lg font-light pr-8">
                                        {faq.q}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: expandedFaq === idx ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0"
                                    >
                                        <div className="w-5 h-5 relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-px bg-white/40" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-px h-4 bg-white/40" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: expandedFaq === idx ? 'auto' : 0,
                                        opacity: expandedFaq === idx ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-6 text-white/50 leading-relaxed">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



        </div>
    )
}