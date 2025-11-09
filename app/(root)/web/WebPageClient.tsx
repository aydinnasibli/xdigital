'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Sparkles, Rocket, CheckCircle2, Zap, TrendingUp, ChevronDown, ChevronUp, Users, Globe, Smartphone, Search, Calendar, X, Check, Minus } from 'lucide-react'
import { useTimeOnPage } from '@/hooks/useTimeOnPage'
import { PortfolioShowcase, PricingPackage, FaqWeb, ComparisonFeature } from '@/lib/sanityQueries'
import Link from 'next/link'


// UPDATE THE PROPS INTERFACE
interface WebPageClientProps {
    initialFaqs: FaqWeb[]
    initialPackages: PricingPackage[]
    initialComparisonFeatures: ComparisonFeature[]  // ADD THIS
    initialPortfolioShowcase: PortfolioShowcase[]  // ADD THIS
}
export default function WebPageClient({ initialFaqs, initialPackages, initialComparisonFeatures, initialPortfolioShowcase }: WebPageClientProps) {
    const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [isBeforeView, setIsBeforeView] = useState(true)
    const [showPopup, setShowPopup] = useState(false)
    const faqs = initialFaqs
    const packages = initialPackages
    const comparisonFeatures = initialComparisonFeatures
    const portfolioShowcase = initialPortfolioShowcase

    useTimeOnPage({
        threshold: 36000,
        onThresholdReached: () => setShowPopup(true),
        trackActiveTime: true,
        requireScroll: true,
        scrollThreshold: 500,
        storageKey: 'webPageEngagementPopup',
        storageType: 'cookie',
        cookieExpiryDays: 7
    })



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



    const getFeatureValue = (packageData: PricingPackage, featureKey: string) => {
        // Get value from the package's comparisonValues
        if (packageData.comparisonValues) {
            return packageData.comparisonValues[featureKey as keyof typeof packageData.comparisonValues]
        }
        return undefined
    }

    return (
        <div className='relative w-full overflow-x-hidden'>
            {/* Hero Section */}
            <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-32">
                <div className="relative w-full max-w-7xl mt-20 mx-auto">
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

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative max-w-5xl mx-auto mb-16"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)]">
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
                                    className={`px-8 py-2.5 rounded-full text-sm hover:cursor-pointer font-medium transition-all duration-300 focus:outline-none ${!isBeforeView
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
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                            >
                                <motion.div
                                    className="text-white/60 mb-6 group-hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {service.icon}
                                </motion.div>
                                <h3 className="text-xl font-light text-white mb-3">{service.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {service.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Packages - IMPROVED */}
            <section id="pricing" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-4">
                            Choose your perfect plan
                        </h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto">
                            Transparent pricing with no hidden fees. Scale as you grow.
                        </p>
                    </div>

                    {packages.length > 0 ? (
                        <>
                            {/* Pricing Cards Grid - Improved symmetry */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
                                {packages.map((pkg, idx) => (
                                    <motion.div
                                        key={pkg._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                                        onMouseEnter={() => setHoveredPackage(idx)}
                                        onMouseLeave={() => setHoveredPackage(null)}
                                        className={`relative rounded-2xl border transition-all duration-300 flex flex-col ${pkg.popular
                                            ? 'bg-white/5 border-white/20 shadow-xl ring-2 ring-white/10'
                                            : 'bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                                            } ${hoveredPackage === idx ? 'scale-[1.02] shadow-2xl' : ''}`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-medium rounded-full shadow-lg whitespace-nowrap">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="p-6 flex flex-col flex-1">
                                            {/* Header */}
                                            <div className="mb-5">
                                                <h3 className="text-xl font-medium text-white mb-2 min-h-[28px]">
                                                    {pkg.name}
                                                </h3>
                                                <p className="text-xs text-white/50 leading-relaxed h-8 overflow-hidden">
                                                    {pkg.description}
                                                </p>
                                            </div>

                                            {/* Price - NOW MONTHLY */}
                                            <div className="mb-5">
                                                <div className="text-3xl font-light text-white mb-1 min-h-[36px] flex items-baseline">
                                                    {pkg.price}
                                                    {pkg.price !== 'Custom' && (
                                                        <span className="text-sm text-white/40 ml-2 font-normal">/month</span>
                                                    )}
                                                </div>
                                                {pkg.setupFee && (
                                                    <p className="text-xs text-white/40">
                                                        + {pkg.setupFee} setup fee
                                                    </p>
                                                )}
                                            </div>

                                            {/* Timeline & Templates Info */}
                                            <div className="py-3 mb-5 border-y border-white/10 space-y-2">
                                                <div className="flex items-center justify-between text-xs gap-2">
                                                    <span className="text-white/50 shrink-0">Initial Setup:</span>
                                                    <span className="text-white font-medium text-right">{pkg.timeline}</span>
                                                </div>
                                                {pkg.templatesIncluded && (
                                                    <div className="flex items-center justify-between text-xs gap-2">
                                                        <span className="text-white/50 shrink-0">Templates:</span>
                                                        <span className="text-white font-medium text-right">{pkg.templatesIncluded}</span>
                                                    </div>
                                                )}
                                                {pkg.customizationRequests && (
                                                    <div className="flex items-center justify-between text-xs gap-2">
                                                        <span className="text-white/50 shrink-0">Customizations:</span>
                                                        <span className="text-white font-medium text-right break-words">{pkg.customizationRequests}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Features List */}
                                            <ul className="space-y-2 flex-1 mb-5">
                                                {pkg.features.slice(0, 5).map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                                                        <span className="text-xs text-white/60 leading-relaxed">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                                {pkg.features.length > 5 && (
                                                    <li className="text-xs text-white/40 pl-5">
                                                        +{pkg.features.length - 5} more features
                                                    </li>
                                                )}
                                            </ul>

                                            {/* Footer */}
                                            <div className="mt-auto space-y-3">
                                                <p className="text-xs text-white/40 min-h-[32px]">
                                                    <span className="text-white/50">Perfect for:</span>{' '}
                                                    {pkg.idealFor}
                                                </p>
                                                <button className="w-full hover:cursor-pointer rounded-xl bg-white text-black py-2.5 hover:bg-white/90 transition-all duration-300 font-medium text-sm hover:shadow-lg">
                                                    {pkg.price === 'Custom' ? 'Contact Us' : 'Start Subscription'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Comparison Table - Improved */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="mt-24"
                            >
                                <div className="text-center mb-12">
                                    <h3 className="text-3xl font-light text-white mb-3">
                                        Compare all features
                                    </h3>
                                    <p className="text-white/50">
                                        See exactly what's included in each package
                                    </p>
                                </div>

                                <div className="bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-5 gap-4 p-6 border-b border-white/10 bg-white/5">
                                        <div className="text-sm font-medium text-white/70">Features</div>
                                        {packages.map((pkg) => (
                                            <div key={pkg._id} className="text-center">
                                                <div className="text-sm font-medium text-white truncate px-2">
                                                    {pkg.name}
                                                </div>
                                                {pkg.popular && (
                                                    <div className="text-xs text-white/40 mt-1">Popular</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Table Body */}
                                    <div className="divide-y divide-white/10">
                                        {comparisonFeatures.map((feature, idx) => (
                                            <div
                                                key={feature.key}
                                                className={`grid grid-cols-5 gap-4 p-6 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''
                                                    } hover:bg-white/5 transition-colors`}
                                            >
                                                <div className="text-sm text-white/70 flex items-center">
                                                    {feature.name}
                                                </div>
                                                {packages.map((pkg) => {
                                                    const value = getFeatureValue(pkg, feature.key);
                                                    return (
                                                        <div
                                                            key={pkg._id}
                                                            className="flex items-center justify-center"
                                                        >
                                                            {typeof value === 'boolean' ? (
                                                                value ? (
                                                                    <Check className="w-5 h-5 text-green-400" />
                                                                ) : (
                                                                    <Minus className="w-5 h-5 text-white/30" />
                                                                )
                                                            ) : (
                                                                <span className="text-sm text-white/80 text-center">
                                                                    {value}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-white/40">No pricing packages available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>


            {/* Portfolio Showcase */}
            <section id="work" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-24">
                        <h2 className="text-5xl sm:text-6xl font-semibold text-white mb-6 tracking-tight">
                            Projects that drive growth
                        </h2>
                        <p className="text-xl text-white/60 max-w-3xl">
                            From struggling startups to thriving businesses — real transformations, real revenue impact
                        </p>
                    </div>

                    <div className="space-y-16">
                        {portfolioShowcase.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/40">No Portfolio Showcase available at the moment.</p>
                            </div>
                        ) : (
                            portfolioShowcase.map((study, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                                    className="group relative"
                                >
                                    <div className="relative bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500">

                                        <div className="p-10 md:p-14">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-12 pb-10 border-b border-white/5">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                        <span className="text-2xl font-semibold text-white">
                                                            {study.client.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-semibold text-white mb-2">{study.client}</h3>
                                                        <p className="text-sm text-white/50 uppercase tracking-wider font-medium">{study.industry}</p>
                                                    </div>
                                                </div>

                                                <a href={''} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-all duration-300 group/btn">
                                                    <span>View Case Study</span>
                                                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                </a>
                                            </div>

                                            {/* Content Grid */}
                                            <div className="grid lg:grid-cols-2 gap-12 mb-12">
                                                {/* Challenge */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Challenge</h4>
                                                    <p className="text-white/80 leading-relaxed text-lg">{study.challenge}</p>
                                                </div>

                                                {/* Solution */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Solution</h4>
                                                    <p className="text-white/80 leading-relaxed text-lg">{study.solution}</p>
                                                </div>
                                            </div>

                                            {/* Metrics Section */}
                                            <div className="pt-10 border-t border-white/5">
                                                <h4 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-8">Key Results</h4>

                                                <div className="grid sm:grid-cols-3 gap-6">
                                                    <div className="bg-white/[0.02] rounded-xl p-6 border border-white/10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-white/50 mb-2 font-medium">Conversion Rate</p>
                                                                <p className="text-4xl font-semibold text-white">{study.results.conversion}</p>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                                <TrendingUp className="w-5 h-5 text-white/60" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-white/40">vs. previous quarter</p>
                                                    </div>

                                                    <div className="bg-white/[0.02] rounded-xl p-6 border border-white/10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-white/50 mb-2 font-medium">Load Time</p>
                                                                <p className="text-4xl font-semibold text-white">{study.results.loadTime}</p>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                                <Zap className="w-5 h-5 text-white/60" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-white/40">98% improvement</p>
                                                    </div>

                                                    <div className="bg-white/[0.02] rounded-xl p-6 border border-white/10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-white/50 mb-2 font-medium">Active Users</p>
                                                                <p className="text-4xl font-semibold text-white">{study.results.users}</p>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                                <Users className="w-5 h-5 text-white/60" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-white/40">monthly active</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tech Stack */}
                                            <div className="mt-10 pt-10 border-t border-white/5">
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 font-medium">
                                                        React
                                                    </span>
                                                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 font-medium">
                                                        Next.js
                                                    </span>
                                                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 font-medium">
                                                        TypeScript
                                                    </span>
                                                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 font-medium">
                                                        {idx === 0 ? 'PostgreSQL' : idx === 1 ? 'Stripe API' : 'AWS'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
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

                    {faqs.length === 0 ? (
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
                                                <div className="px-8 pb-8 text-white/60 leading-relaxed text-base whitespace-pre-line">
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

            {/* Popup Modal */}
            <AnimatePresence>
                {showPopup && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPopup(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative bg-zinc-900 border border-white/20 rounded-2xl max-w-md w-full p-8 shadow-2xl">
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                                        <Calendar className="w-6 h-6 text-white/60" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-light text-white mb-2">
                                            Having troubles? Let's talk!
                                        </h3>
                                        <p className="text-white/60 leading-relaxed">
                                            You've been exploring our work for a while.
                                            Get a free consultation with our team.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <a
                                            href="mailto:xdigitalaz@proton.me?subject=Project Inquiry&body=Hi, I'd like to discuss a project with you."
                                            className="w-full px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all text-center"
                                        >
                                            Mail Us
                                        </a>
                                        <a
                                            href="https://cal.com/xdigital"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all text-center"
                                        >
                                            Schedule Free Call
                                        </a>

                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="w-full hover:cursor-pointer px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            Continue Browsing
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}