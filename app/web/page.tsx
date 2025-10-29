'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Code2, Sparkles, Rocket, CheckCircle2, Zap, Shield, TrendingUp, ChevronDown, ChevronUp, Minus, Clock, Users, DollarSign, Monitor, Smartphone, Search, Globe } from 'lucide-react'
import { getFaqWeb, type FaqWeb } from '@/lib/sanityQueries'
import { getPricingPackages } from '@/lib/sanityQueries'
import { PricingPackage } from '@/lib/sanityQueries'
export default function DigitalAgency() {
    const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [isBeforeView, setIsBeforeView] = useState(true)
    const [faqs, setFaqs] = useState<FaqWeb[]>([])
    const [isLoadingFaqs, setIsLoadingFaqs] = useState(true)
    // Add state for packages
    const [packages, setPackages] = useState<PricingPackage[]>([])
    const [isLoadingPackages, setIsLoadingPackages] = useState(true)

    // Fetch packages on mount
    useEffect(() => {
        async function fetchPackages() {
            try {
                setIsLoadingPackages(true)
                const data = await getPricingPackages()
                setPackages(data)
            } catch (error) {
                console.error('Error fetching pricing packages:', error)
                // Optionally set fallback/default packages here
            } finally {
                setIsLoadingPackages(false)
            }
        }

        fetchPackages()
    }, [])
    // Add this useEffect:
    useEffect(() => {
        const loadFaqs = async () => {
            setIsLoadingFaqs(true)
            try {
                const data = await getFaqWeb()
                setFaqs(data)
            } catch (error) {
                console.error('Failed to load FAQs:', error)
            } finally {
                setIsLoadingFaqs(false)
            }
        }

        loadFaqs()
    }, [])



    const caseStudies = [
        {
            client: 'FinTech Innovators',
            industry: 'Financial Technology',
            challenge: 'Complex dashboard needed for 10k+ daily users',
            solution: 'Built scalable React dashboard with real-time data',
            results: {
                conversion: '+240%',
                loadTime: '0.6s',
                users: '15k+'
            },
            color: 'from-blue-500/20 to-cyan-500/20'
        },
        {
            client: 'EcoMarket',
            industry: 'E-commerce',
            challenge: 'High cart abandonment, slow checkout process',
            solution: 'Rebuilt checkout flow with Next.js & Stripe',
            results: {
                conversion: '+185%',
                loadTime: '0.9s',
                users: '8k+'
            },
            color: 'from-emerald-500/20 to-green-500/20'
        },
        {
            client: 'LearnHub',
            industry: 'EdTech',
            challenge: 'Needed interactive learning platform',
            solution: 'Custom LMS with video streaming & progress tracking',
            results: {
                conversion: '+310%',
                loadTime: '1.1s',
                users: '22k+'
            },
            color: 'from-purple-500/20 to-pink-500/20'
        }
    ]




    const services = [
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'Web Development',
            description: 'Custom websites and web applications built with modern frameworks'
        },
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: 'Mobile-First Design',
            description: 'Responsive designs that work flawlessly on all devices'
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: 'SEO Optimization',
            description: 'Built-in SEO best practices to rank higher in search results'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Performance',
            description: 'Lightning-fast load times with optimized code and assets'
        }
    ]

    return (
        <div className='relative w-full overflow-x-hidden'>

            {/* Hero Section */}
            <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-32">

                <div className="relative w-full max-w-7xl mt-20 mx-auto">
                    {/* Main Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >


                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 leading-tight">
                            We build digital <br />
                            <span className="font-medium">experiences</span> that scale
                        </h1>
                        <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Custom web development for startups and enterprises. Fast, beautiful, and built to convert.
                        </p>
                    </motion.div>

                    {/* Before/After Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative max-w-5xl mx-auto mb-16"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)]">

                            {/* Toggle Buttons */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-md rounded-full p-1.5 border border-white/10 shadow-lg">
                                <button
                                    onClick={() => setIsBeforeView(true)}
                                    className={`px-8 py-2.5 rounded-full hover:cursor-pointer text-sm font-medium transition-all duration-300 focus:outline-none ${isBeforeView
                                        ? "bg-white text-black shadow-md scale-105"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    Before
                                </button>
                                <button
                                    onClick={() => setIsBeforeView(false)}
                                    className={`px-8 py-2.5 rounded-full text-sm hover:cursor-pointer  font-medium transition-all duration-300 focus:outline-none ${!isBeforeView
                                        ? "bg-white text-black shadow-md scale-105"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    After
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isBeforeView ? (
                                    <motion.div
                                        key="before"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.03 }}
                                        transition={{ duration: 0.5 }}
                                        className="aspect-video bg-linear-to-br from-zinc-800 to-zinc-900 p-12 flex flex-col items-center justify-center"
                                    >
                                        <div className="text-center space-y-8 max-w-lg">
                                            <div className="text-red-400/70 text-xs font-mono uppercase tracking-widest">
                                                Outdated Design
                                            </div>

                                            {/* Mock UI elements */}
                                            <div className="space-y-3">
                                                <div className="relative h-10 bg-white/10 rounded-lg w-3/4 mx-auto overflow-hidden">
                                                    <motion.div
                                                        initial={{ x: "-100%" }}
                                                        animate={{ x: "100%" }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                                                    />
                                                </div>
                                                <div className="h-5 bg-white/10 rounded w-full"></div>
                                                <div className="h-5 bg-white/10 rounded w-5/6 mx-auto"></div>
                                            </div>

                                            <div className="flex gap-3 justify-center">
                                                <div className="h-12 bg-white/10 rounded-lg w-32"></div>
                                                <div className="h-12 bg-white/10 rounded-lg w-32"></div>
                                            </div>

                                            <div className="text-white/40 text-sm mt-8 flex items-center justify-center gap-4">
                                                <span>⚠️ Slow</span>
                                                <span>•</span>
                                                <span>📉 Low Conversions</span>
                                                <span>•</span>
                                                <span>📱 Not Responsive</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="after"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.03 }}
                                        transition={{ duration: 0.5 }}
                                        className="aspect-video relative overflow-hidden flex items-center justify-center p-12 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900"
                                    >
                                        {/* Subtle animated glow */}
                                        <motion.div
                                            animate={{
                                                background: [
                                                    "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.08), transparent 60%)",
                                                    "radial-gradient(circle at 80% 70%, rgba(168,85,247,0.08), transparent 60%)",
                                                ],
                                            }}
                                            transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
                                            className="absolute inset-0"
                                        />

                                        <div className="relative text-center space-y-8 max-w-lg">
                                            <div className="text-green-400/80 text-xs font-mono uppercase tracking-widest">
                                                Modern Design
                                            </div>
                                            <h3 className="text-4xl font-light text-white leading-tight drop-shadow-md">
                                                Transform Your<br />Digital Presence
                                            </h3>
                                            <p className="text-white/70 text-base leading-relaxed">
                                                Lightning-fast, conversion-optimized experiences that your customers will love.
                                            </p>

                                            <div className="flex gap-4 justify-center">
                                                <button className="px-8 py-3.5 bg-white text-black rounded-xl text-sm font-medium hover:scale-105 transition-transform shadow-lg">
                                                    Get Started →
                                                </button>
                                                <button className="px-8 py-3.5 border border-white/20 text-white rounded-xl text-sm hover:bg-white/10 transition-all">
                                                    View Work
                                                </button>
                                            </div>

                                            <div className="text-white/50 text-sm mt-8 flex items-center justify-center gap-4">
                                                <span>⚡ 0.8s Load</span>
                                                <span>•</span>
                                                <span>📈 +180% Conversions</span>
                                                <span>•</span>
                                                <span>✨ Pixel Perfect</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>





                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-24"
                    >
                        <div className="text-center">
                            <div className="text-4xl font-light text-white mb-2">150+</div>
                            <div className="text-sm text-white/40">Projects Delivered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-light text-white mb-2">98%</div>
                            <div className="text-sm text-white/40">Client Satisfaction</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-light text-white mb-2">24/7</div>
                            <div className="text-sm text-white/40">Support Available</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6"
                        >
                            <Rocket className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">What We Do</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-6">
                            Full-stack web development<br />for modern businesses
                        </h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">
                            From concept to deployment, we handle everything
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="group relative bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                            >
                                <div className="text-white/60 mb-6 group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-light text-white mb-3">{service.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {service.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>






            {/* Pricing Packages */}
            <section id="pricing" className="relative w-full py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-4">
                            Transparent pricing
                        </h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">
                            Choose the package that fits your needs. No hidden fees.
                        </p>
                    </div>

                    {isLoadingPackages ? (
                        // Loading skeleton
                        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-8 animate-pulse"
                                >
                                    <div className="space-y-6">
                                        <div className="h-8 bg-white/10 rounded w-1/2"></div>
                                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                        <div className="h-10 bg-white/10 rounded w-1/3"></div>
                                        <div className="space-y-2 py-4 border-y border-white/10">
                                            <div className="h-4 bg-white/10 rounded"></div>
                                            <div className="h-4 bg-white/10 rounded"></div>
                                        </div>
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4, 5, 6].map((j) => (
                                                <div key={j} className="h-4 bg-white/10 rounded"></div>
                                            ))}
                                        </div>
                                        <div className="h-12 bg-white/10 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : packages.length > 0 ? (
                        // Actual packages
                        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {packages.map((pkg, idx) => (
                                <motion.div
                                    key={pkg._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    onMouseEnter={() => setHoveredPackage(idx)}
                                    onMouseLeave={() => setHoveredPackage(null)}
                                    className={`relative rounded-2xl border p-8 transition-all duration-300 ${pkg.popular
                                        ? 'bg-white/5 border-white/20 shadow-xl'
                                        : 'bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                                        } ${hoveredPackage === idx ? 'scale-[1.02]' : ''}`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-xs font-medium rounded-full">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-light text-white mb-2">{pkg.name}</h3>
                                            <p className="text-sm text-white/50 mb-4 leading-relaxed">{pkg.description}</p>
                                            <div className="text-4xl font-light text-white mb-1">{pkg.price}</div>
                                            {pkg.price !== 'Custom' && <p className="text-xs text-white/40">One-time payment</p>}
                                        </div>

                                        <div className="space-y-2 py-4 border-y border-white/10">

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-white/50">Timeline:</span>
                                                <span className="text-white">{pkg.timeline}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-2.5">
                                            {pkg.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                                                    <span className="text-sm text-white/60">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-4 space-y-3">
                                            <p className="text-xs text-white/40">
                                                <span className="text-white/50">Ideal for:</span> {pkg.idealFor}
                                            </p>
                                            <button className="w-full rounded-xl bg-white text-black py-3 hover:bg-white/90 transition-all duration-300 font-medium text-sm">
                                                {pkg.price === 'Custom' ? 'Contact Us' : 'Get Started'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        // Empty state
                        <div className="text-center py-12">
                            <p className="text-white/40">No pricing packages available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Portfolio Showcase */}
            <section id="work" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">Our Work</span>
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-4">
                            Projects that drive growth
                        </h2>
                        <p className="text-xl text-white/50 max-w-2xl">
                            From struggling startups to thriving businesses — real transformations, real revenue impact
                        </p>
                    </div>

                    <div className="space-y-8">
                        {caseStudies.map((study, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.15 }}
                                className="group relative"
                            >
                                <div className="grid md:grid-cols-5 gap-8 bg-zinc-900/40 border border-white/10 rounded-2xl p-8 md:p-10 hover:border-white/20 hover:bg-white/5 transition-all duration-500">

                                    {/* Left: Client Info & Problem */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <span className="text-xl font-light text-white">
                                                        {study.client.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-light text-white">{study.client}</h3>
                                                    <p className="text-sm text-white/40">{study.industry}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">The Problem</h4>
                                            <p className="text-white/70 leading-relaxed">{study.challenge}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Our Solution</h4>
                                            <p className="text-white/70 leading-relaxed">{study.solution}</p>
                                        </div>

                                        <button className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group/btn">
                                            <span>View full case study</span>
                                            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>

                                    {/* Right: Results Grid */}
                                    <div className="md:col-span-3">
                                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-6 font-medium">Business Impact</h4>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            {/* Main Metric - Full Width */}
                                            <div className="col-span-2 bg-zinc-900/60 rounded-xl p-6 border border-white/10">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="text-sm text-white/50 mb-1">Conversion Rate Increase</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-5xl font-light text-white">
                                                                {study.results.conversion}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                        <TrendingUp className="w-6 h-6 text-green-400/80" />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/40">Compared to previous quarter</p>
                                            </div>

                                            {/* Secondary Metrics */}
                                            <div className="bg-zinc-900/60 rounded-xl p-5 border border-white/10">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                                        <Zap className="w-5 h-5 text-yellow-400/80" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/50">Load Time</p>
                                                        <p className="text-2xl font-light text-white">{study.results.loadTime}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/40">98% faster than before</p>
                                            </div>

                                            <div className="bg-zinc-900/60 rounded-xl p-5 border border-white/10">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-blue-400/80" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/50">Active Users</p>
                                                        <p className="text-2xl font-light text-white">{study.results.users}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/40">Monthly active users</p>
                                            </div>
                                        </div>

                                        {/* Tech Stack Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                                                React
                                            </span>
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                                                Next.js
                                            </span>
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                                                TypeScript
                                            </span>
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                                                {idx === 0 ? 'PostgreSQL' : idx === 1 ? 'Stripe API' : 'AWS'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom CTA */}

                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-6">
                            Frequently asked questions
                        </h2>
                        <p className="text-xl text-white/50">
                            Everything you need to know about working with us
                        </p>
                    </div>

                    {isLoadingFaqs ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="border border-white/10 rounded-2xl p-8 bg-zinc-900/30 animate-pulse"
                                >
                                    <div className="h-6 bg-white/5 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-white/40">No FAQs available at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <motion.div
                                    key={faq._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="border border-white/20 rounded-2xl overflow-hidden bg-zinc-900/30"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full p-8 flex items-center hover:cursor-pointer justify-between text-left hover:bg-white/2 transition-colors"
                                    >
                                        <span className="text-lg font-light text-white pr-6">{faq.question}</span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-6 h-6 text-white/40 shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-white/40 shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-8 p-8 text-white/60 leading-relaxed text-base whitespace-pre-line">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>


        </div>
    )
}