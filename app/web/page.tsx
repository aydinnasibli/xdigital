'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Code, Palette, Rocket, CheckCircle2, Zap, Shield, TrendingUp, ChevronDown, ChevronUp, Minus, Clock, Users, DollarSign } from 'lucide-react'

export default function page() {
    const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)
    const [activeCase, setActiveCase] = useState(0)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [isBeforeView, setIsBeforeView] = useState(true)

    const technologies = [
        { name: 'Next.js', description: 'React framework for production', icon: '⚡' },
        { name: 'React', description: 'UI component library', icon: '⚛️' },
        { name: 'TypeScript', description: 'Type-safe development', icon: '📘' },
        { name: 'Tailwind CSS', description: 'Utility-first styling', icon: '🎨' },
        { name: 'Node.js', description: 'Backend runtime', icon: '🟢' },
        { name: 'Vercel', description: 'Deployment & hosting', icon: '▲' }
    ]

    const packages = [
        {
            name: 'Starter',
            description: 'Perfect for launching your online presence',
            price: '$2,999',
            pages: '1-3 pages',
            timeline: '1-2 weeks',
            features: [
                'Responsive landing page',
                'Contact form integration',
                'SEO optimization',
                'Mobile-first design',
                'Basic analytics setup',
                'Free SSL certificate',
                '30 days of support'
            ],
            idealFor: 'Freelancers, personal brands, small businesses'
        },
        {
            name: 'Business',
            description: 'Complete web presence for growing companies',
            price: '$6,999',
            pages: '5-10 pages',
            timeline: '3-4 weeks',
            features: [
                'Full multi-page website',
                'Custom design system',
                'Advanced SEO & analytics',
                'CMS integration',
                'Blog functionality',
                'Email marketing setup',
                'Performance optimization',
                '90 days of support'
            ],
            idealFor: 'Growing businesses, e-commerce, agencies',
            popular: true
        },
        {
            name: 'Enterprise',
            description: 'Custom web applications built to scale',
            price: 'Custom',
            pages: 'Unlimited',
            timeline: '6-12 weeks',
            features: [
                'Custom web application',
                'Advanced functionality',
                'Database architecture',
                'API development',
                'User authentication',
                'Admin dashboard',
                'Ongoing maintenance',
                'Priority support'
            ],
            idealFor: 'Enterprises, SaaS products, complex platforms'
        }
    ]

    const caseStudies = [
        {
            client: 'TechFlow Solutions',
            industry: 'B2B SaaS',
            challenge: 'Low conversion rates and outdated design',
            solution: 'Modern redesign with optimized user journey',
            results: {
                conversion: '+185%',
                loadTime: '0.8s',
                bounce: '-42%'
            },
            color: 'from-blue-500/20 to-purple-500/20'
        },
        {
            client: 'Artisan Coffee Co.',
            industry: 'E-commerce',
            challenge: 'Poor mobile experience affecting sales',
            solution: 'Mobile-first redesign with streamlined checkout',
            results: {
                conversion: '+156%',
                loadTime: '1.2s',
                bounce: '-38%'
            },
            color: 'from-amber-500/20 to-orange-500/20'
        },
        {
            client: 'Urban Fitness Hub',
            industry: 'Health & Wellness',
            challenge: 'Complex booking system causing friction',
            solution: 'Intuitive booking flow with real-time availability',
            results: {
                conversion: '+210%',
                loadTime: '0.9s',
                bounce: '-51%'
            },
            color: 'from-green-500/20 to-emerald-500/20'
        }
    ]

    const processSteps = [
        {
            number: '01',
            title: 'Discovery',
            description: 'We dive deep into your business goals, target audience, and competitive landscape.',
            duration: '2-3 days',
            deliverables: ['Project brief', 'Sitemap', 'Feature list']
        },
        {
            number: '02',
            title: 'Design',
            description: 'Creating wireframes and high-fidelity mockups that bring your vision to life.',
            duration: '5-7 days',
            deliverables: ['Wireframes', 'Design system', 'Interactive prototype']
        },
        {
            number: '03',
            title: 'Development',
            description: 'Building your website with clean code, best practices, and performance in mind.',
            duration: '1-3 weeks',
            deliverables: ['Fully functional site', 'CMS setup', 'Testing report']
        },
        {
            number: '04',
            title: 'Launch',
            description: 'Deploying your site, final testing, and ensuring everything runs perfectly.',
            duration: '2-3 days',
            deliverables: ['Live website', 'Documentation', 'Training session']
        }
    ]

    const faqs = [
        {
            question: 'How long does it take to build a website?',
            answer: 'Timeline varies by package: Starter sites take 1-2 weeks, Business sites 3-4 weeks, and Enterprise projects 6-12 weeks. We provide a detailed timeline during discovery and keep you updated throughout the process.'
        },
        {
            question: 'What if I need changes after launch?',
            answer: 'All packages include post-launch support (30-90 days depending on package). During this period, we handle bug fixes and minor adjustments at no extra cost. After that, we offer flexible maintenance plans starting at $299/month.'
        },
        {
            question: 'Do I own the code and design?',
            answer: 'Absolutely. Once final payment is made, you own 100% of the code, design files, and all assets. We provide full documentation and can transfer everything to your preferred hosting platform.'
        },
        {
            question: 'Can you work with my existing brand guidelines?',
            answer: 'Yes! We can adapt to your existing brand identity or help you create a new one. Our design process is flexible and collaborative to ensure the final product aligns perfectly with your vision.'
        },
        {
            question: 'What happens if I need more pages later?',
            answer: 'We make it easy to scale. Additional pages can be added at any time for $399-$799 per page depending on complexity. Many clients start with a Starter package and expand over time.'
        },
        {
            question: 'Do you provide hosting and maintenance?',
            answer: 'Yes. We can handle hosting ($49/month) and ongoing maintenance ($299/month) which includes security updates, backups, and content changes. Or, we can help you set up with your preferred provider.'
        }
    ]

    return (
        <div className="relative w-full overflow-x-hidden">
            {/* Hero Section with Before/After Slider */}
            <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-20">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Main Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white/90 mb-6 leading-tight">
                            Websites that <span className="italic">convert</span>,<br className="hidden sm:block" /> not just exist
                        </h1>
                        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-8">
                            Fast, beautiful, and built to turn visitors into customers
                        </p>
                    </motion.div>

                    {/* Before/After Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative max-w-5xl mx-auto mb-12"
                    >
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
                            {/* Toggle Buttons */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full p-1">
                                <button
                                    onClick={() => setIsBeforeView(true)}
                                    className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ${isBeforeView ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    Before
                                </button>
                                <button
                                    onClick={() => setIsBeforeView(false)}
                                    className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ${!isBeforeView ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    After
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isBeforeView ? (
                                    <motion.div
                                        key="before"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 p-8 flex flex-col items-center justify-center"
                                    >
                                        <div className="text-center space-y-4 max-w-md">
                                            <div className="text-white/30 text-sm font-mono">OLD DESIGN</div>
                                            <div className="space-y-2">
                                                <div className="h-8 bg-white/10 rounded w-3/4 mx-auto"></div>
                                                <div className="h-4 bg-white/10 rounded w-full"></div>
                                                <div className="h-4 bg-white/10 rounded w-5/6 mx-auto"></div>
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <div className="h-10 bg-white/10 rounded w-24"></div>
                                                <div className="h-10 bg-white/10 rounded w-24"></div>
                                            </div>
                                            <div className="text-white/20 text-xs mt-6">Slow • Cluttered • Low Conversions</div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="after"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="aspect-video bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 flex flex-col items-center justify-center"
                                    >
                                        <div className="text-center space-y-6 max-w-md">
                                            <div className="text-white/60 text-sm font-mono">NEW DESIGN</div>
                                            <h3 className="text-3xl font-light text-white">Transform Your Business</h3>
                                            <p className="text-white/60 text-sm">Clean, modern design that drives results</p>
                                            <div className="flex gap-3 justify-center">
                                                <button className="px-6 py-3 bg-white text-black rounded-lg text-sm font-medium">
                                                    Get Started
                                                </button>
                                                <button className="px-6 py-3 border border-white/20 text-white rounded-lg text-sm">
                                                    Learn More
                                                </button>
                                            </div>
                                            <div className="text-white/40 text-xs mt-6">Fast • Clean • High Converting</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button className="group w-full sm:w-auto rounded-2xl inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-white/90 transition-all duration-300">
                            <span className="font-light">Start Your Project</span>
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <button className="group w-full sm:w-auto rounded-xl inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                            <span className="font-light">View Portfolio</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Process Timeline */}
            <section className="relative w-full py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-4">
                            <Minus className="w-8 h-8 text-white/20" />
                            <h2 className="text-sm text-white/40 uppercase tracking-widest">Our Process</h2>
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-light text-white/90">
                            From idea to launch in weeks, not months
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {processSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="relative group"
                            >
                                {/* Connector Line */}
                                {idx < processSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-5xl font-light text-white/10 group-hover:text-white/30 transition-colors duration-500">
                                            {step.number}
                                        </span>
                                        <div className="flex-1 h-px bg-white/10 group-hover:bg-white/30 transition-colors duration-500" />
                                    </div>

                                    <div>
                                        <h4 className="text-2xl font-light text-white/90 mb-2">{step.title}</h4>
                                        <p className="text-sm text-white/50 mb-4">{step.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-white/40">
                                                <Clock className="w-3 h-3" />
                                                <span>{step.duration}</span>
                                            </div>

                                            <div className="space-y-1">
                                                {step.deliverables.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="relative w-full py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-light text-white/90 mb-4">
                            Built with modern technology
                        </h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            We use cutting-edge tools to ensure your website is fast, secure, and scalable
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {technologies.map((tech, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="group relative bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300"
                            >
                                <div className="text-4xl mb-4">{tech.icon}</div>
                                <h4 className="text-lg font-light text-white/90 mb-2">{tech.name}</h4>
                                <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                                    {tech.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Package Tiers */}
            <section className="relative w-full py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-light text-white/90 mb-4">
                            Choose your package
                        </h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Transparent pricing with no hidden fees. Start small or go big.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {packages.map((pkg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                onMouseEnter={() => setHoveredPackage(idx)}
                                onMouseLeave={() => setHoveredPackage(null)}
                                className={`relative rounded-2xl border p-8 transition-all duration-300 ${pkg.popular
                                        ? 'bg-white/[0.02] border-white/30 scale-105'
                                        : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                    } ${hoveredPackage === idx ? 'scale-105' : ''}`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-medium rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-light text-white/90 mb-2">{pkg.name}</h3>
                                        <p className="text-sm text-white/50 mb-4">{pkg.description}</p>
                                        <div className="text-4xl font-light text-white">{pkg.price}</div>
                                    </div>

                                    <div className="space-y-2 py-6 border-y border-white/10">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/50">Pages:</span>
                                            <span className="text-white/90">{pkg.pages}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/50">Timeline:</span>
                                            <span className="text-white/90">{pkg.timeline}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-white/70">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6">
                                        <p className="text-xs text-white/40 mb-4">Ideal for: {pkg.idealFor}</p>
                                        <button className="w-full rounded-xl bg-white text-black py-3 hover:bg-white/90 transition-all duration-300 font-light">
                                            Get Started
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Showcase */}
            <section className="relative w-full py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-4">
                            <Minus className="w-8 h-8 text-white/20" />
                            <h2 className="text-sm text-white/40 uppercase tracking-widest">Case Studies</h2>
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-light text-white/90">
                            Real results for real businesses
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {caseStudies.map((study, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCase(idx)}
                                className={`text-left p-6 rounded-2xl border transition-all duration-300 ${activeCase === idx
                                        ? 'bg-white/[0.02] border-white/30'
                                        : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <h4 className="text-lg font-light text-white/90 mb-2">{study.client}</h4>
                                <p className="text-sm text-white/40">{study.industry}</p>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCase}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className={`rounded-2xl bg-gradient-to-br ${caseStudies[activeCase].color} border border-white/10 p-8 md:p-12`}
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm text-white/40 uppercase tracking-wider mb-2">Challenge</h4>
                                        <p className="text-white/80">{caseStudies[activeCase].challenge}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-white/40 uppercase tracking-wider mb-2">Solution</h4>
                                        <p className="text-white/80">{caseStudies[activeCase].solution}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm text-white/40 uppercase tracking-wider mb-6">Results</h4>
                                    <div className="space-y-4">
                                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <TrendingUp className="w-5 h-5 text-white/60" />
                                                <span className="text-sm text-white/60">Conversion Rate</span>
                                            </div>
                                            <div className="text-3xl font-light text-white">
                                                {caseStudies[activeCase].results.conversion}
                                            </div>
                                        </div>
                                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Zap className="w-5 h-5 text-white/60" />
                                                <span className="text-sm text-white/60">Load Time</span>
                                            </div>
                                            <div className="text-3xl font-light text-white">
                                                {caseStudies[activeCase].results.loadTime}
                                            </div>
                                        </div>
                                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Users className="w-5 h-5 text-white/60" />
                                                <span className="text-sm text-white/60">Bounce Rate</span>
                                            </div>
                                            <div className="text-3xl font-light text-white">
                                                {caseStudies[activeCase].results.bounce}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative w-full py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-light text-white/90 mb-4">
                            Common questions
                        </h2>
                        <p className="text-white/50">
                            Everything you need to know about our web development process
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="text-lg font-light text-white/90 pr-4">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
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
                                            <div className="px-6 pb-6 text-white/60 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl sm:text-5xl font-light text-white/90">
                            Ready to transform your online presence?
                        </h2>
                        <p className="text-lg text-white/50">
                            Let's build something amazing together
                        </p>
                        <button className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-3xl hover:scale-105 transition-all duration-300">
                            <span className="font-light">Start Your Project Today</span>
                            <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}