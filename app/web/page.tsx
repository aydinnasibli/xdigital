'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Code2, Sparkles, Rocket, CheckCircle2, Zap, Shield, TrendingUp, ChevronDown, ChevronUp, Minus, Clock, Users, DollarSign, Monitor, Smartphone, Search, Globe } from 'lucide-react'

export default function DigitalAgency() {
    const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)
    const [activeCase, setActiveCase] = useState(0)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [isBeforeView, setIsBeforeView] = useState(true)

    const technologies = [
        { name: 'React & Next.js', description: 'Lightning-fast React apps', },
        { name: 'TypeScript', description: 'Type-safe, scalable code' },
        { name: 'Tailwind CSS', description: 'Beautiful, responsive design' },
        { name: 'Node.js', description: 'Powerful backend solutions' },
        { name: 'PostgreSQL', description: 'Robust data management' },
        { name: 'AWS/Vercel', description: 'Enterprise-grade hosting' }
    ]

    const packages = [
        {
            name: 'Launch',
            description: 'Perfect for startups and small businesses',
            price: '$3,500',
            pages: '3-5 pages',
            timeline: '2-3 weeks',
            features: [
                'Custom responsive design',
                'Mobile-optimized experience',
                'Contact forms & integrations',
                'Basic SEO setup',
                'Analytics integration',
                'SSL & security setup',
                '2 rounds of revisions',
                '30 days support'
            ],
            idealFor: 'Startups, personal brands, local businesses'
        },
        {
            name: 'Growth',
            description: 'Comprehensive solution for growing companies',
            price: '$7,500',
            pages: '8-12 pages',
            timeline: '4-6 weeks',
            features: [
                'Advanced custom design',
                'CMS integration (Strapi/Sanity)',
                'Blog & content management',
                'E-commerce functionality',
                'Advanced SEO optimization',
                'Email marketing setup',
                'Performance optimization',
                'Unlimited revisions',
                '90 days priority support'
            ],
            idealFor: 'Growing businesses, e-commerce, content creators',
            popular: true
        },
        {
            name: 'Enterprise',
            description: 'Custom web applications for scale',
            price: 'Custom',
            pages: 'Unlimited',
            timeline: '8-16 weeks',
            features: [
                'Full-stack web application',
                'Custom API development',
                'Advanced database architecture',
                'User authentication & roles',
                'Admin dashboard & CMS',
                'Third-party integrations',
                'Load balancing & scaling',
                'Dedicated project manager',
                '6 months maintenance included'
            ],
            idealFor: 'Enterprises, SaaS platforms, complex systems'
        }
    ]

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

    const processSteps = [
        {
            number: '01',
            title: 'Discovery & Strategy',
            description: 'Deep dive into your business goals, target audience, and competitive landscape to build a winning strategy.',
            duration: '3-5 days',
            deliverables: ['Strategy document', 'Sitemap & wireframes', 'Technical architecture']
        },
        {
            number: '02',
            title: 'Design & Prototype',
            description: 'Creating stunning, user-centric designs with interactive prototypes for your approval.',
            duration: '1-2 weeks',
            deliverables: ['UI/UX design', 'Design system', 'Interactive prototype']
        },
        {
            number: '03',
            title: 'Development',
            description: 'Building your solution with clean, scalable code following best practices and modern standards.',
            duration: '2-6 weeks',
            deliverables: ['Functional website/app', 'Admin panel', 'API documentation']
        },
        {
            number: '04',
            title: 'Launch & Optimize',
            description: 'Deploying to production with monitoring, testing, and continuous optimization.',
            duration: '3-5 days',
            deliverables: ['Live deployment', 'Training materials', 'Optimization report']
        }
    ]

    const faqs = [
        {
            question: 'What makes your agency different from others?',
            answer: 'We focus on results, not just deliverables. Every project includes performance optimization, conversion tracking, and ongoing consultation. We use modern tech stacks (React, Next.js, TypeScript) that ensure your site is fast, scalable, and future-proof. Plus, we provide transparent communication and fixed pricing - no surprises.'
        },
        {
            question: 'How long does a typical project take?',
            answer: 'It depends on the package: Launch (2-3 weeks), Growth (4-6 weeks), Enterprise (8-16 weeks). We provide detailed timelines during discovery and send weekly progress updates. Most clients are live within 4-6 weeks from kickoff.'
        },
        {
            question: 'Do you provide ongoing support and maintenance?',
            answer: 'Yes! All packages include post-launch support (30-90 days depending on package). After that, we offer maintenance plans starting at $399/month including updates, security patches, content changes, and monitoring. Many clients prefer our retainer model for continuous improvements.'
        },
        {
            question: 'Can you integrate with our existing tools and systems?',
            answer: 'Absolutely. We specialize in integrations - CRM (Salesforce, HubSpot), payment processors (Stripe, PayPal), email marketing (Mailchimp, SendGrid), analytics (Google Analytics, Mixpanel), and more. We can also build custom APIs to connect your systems.'
        },
        {
            question: 'What if we need changes or additions after launch?',
            answer: 'No problem! During the support period, minor changes are included. For larger features or pages, we offer flexible pricing: additional pages ($500-$1200), new features (quoted individually), or monthly retainers ($399-$2500) for ongoing development.'
        },
        {
            question: 'Do we own the code and can we host it ourselves?',
            answer: 'Yes, 100%. Once the final payment is made, you own all code, designs, and assets. We provide full documentation and can help you migrate to any hosting provider. We recommend Vercel or AWS, but the choice is yours.'
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
                                        className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 p-12 flex flex-col items-center justify-center"
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
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
                                        className="aspect-video relative overflow-hidden flex items-center justify-center p-12 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
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




            {/* Technology Stack */}
            <section className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-6">
                            Built with cutting-edge technology
                        </h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">
                            We use the best tools to create fast, secure, and scalable solutions
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
                                className="group relative bg-zinc-900/30 border border-white/10 rounded-2xl p-8 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                            >
                                <h4 className="text-lg font-light text-white mb-2">{tech.name}</h4>
                                <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                                    {tech.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Packages */}
            <section id="pricing" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-light text-white mb-6">
                            Transparent pricing
                        </h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">
                            Choose the package that fits your needs. No hidden fees.
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
                                className={`relative rounded-3xl border p-10 transition-all duration-300 ${pkg.popular
                                    ? 'bg-white/[0.03] border-white/30 scale-105 shadow-2xl'
                                    : 'bg-zinc-900/30 border-white/10 hover:border-white/20 hover:bg-white/5'
                                    } ${hoveredPackage === idx ? 'scale-105' : ''}`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full shadow-xl">
                                        Most Popular
                                    </div>
                                )}

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-3xl font-light text-white mb-3">{pkg.name}</h3>
                                        <p className="text-sm text-white/50 mb-6 leading-relaxed">{pkg.description}</p>
                                        <div className="text-5xl font-light text-white mb-2">{pkg.price}</div>
                                        {pkg.price !== 'Custom' && <p className="text-xs text-white/40">One-time payment</p>}
                                    </div>

                                    <div className="space-y-3 py-6 border-y border-white/10">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/50">Pages:</span>
                                            <span className="text-white font-medium">{pkg.pages}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/50">Timeline:</span>
                                            <span className="text-white font-medium">{pkg.timeline}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400/60 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-white/70">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6 space-y-4">
                                        <p className="text-xs text-white/40">
                                            <span className="text-white/60 font-medium">Ideal for:</span> {pkg.idealFor}
                                        </p>
                                        <button className="w-full rounded-xl bg-white text-black py-4 hover:bg-white/90 transition-all duration-300 font-medium hover:scale-105">
                                            {pkg.price === 'Custom' ? 'Contact Us' : 'Get Started'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Showcase */}
            <section id="work" className="relative w-full py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-6">
                            <Minus className="w-8 h-8 text-white/20" />
                            <h2 className="text-sm text-white/40 uppercase tracking-widest">Case Studies</h2>
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-light text-white/90 mb-4">
                            Real results for real businesses
                        </h3>
                        <p className="text-xl text-white/50 max-w-2xl">
                            See how we've helped companies grow with strategic web development
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        {caseStudies.map((study, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCase(idx)}
                                className={`text-left p-8 rounded-2xl border transition-all duration-300 ${activeCase === idx
                                    ? 'bg-white/[0.03] border-white/30 scale-105'
                                    : 'bg-zinc-900/30 border-white/10 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <h4 className="text-xl font-light text-white mb-2">{study.client}</h4>
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
                            className={`rounded-3xl bg-gradient-to-br ${caseStudies[activeCase].color} border border-white/10 p-10 md:p-16`}
                        >
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-sm text-white/50 uppercase tracking-wider mb-3 font-medium">Challenge</h4>
                                        <p className="text-white/90 text-lg leading-relaxed">{caseStudies[activeCase].challenge}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-white/50 uppercase tracking-wider mb-3 font-medium">Solution</h4>
                                        <p className="text-white/90 text-lg leading-relaxed">{caseStudies[activeCase].solution}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm text-white/50 uppercase tracking-wider mb-8 font-medium">Impact</h4>
                                    <div className="space-y-6">
                                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <TrendingUp className="w-6 h-6 text-green-400" />
                                                <span className="text-sm text-white/60 font-medium">Conversion Rate</span>
                                            </div>
                                            <div className="text-4xl font-light text-white">
                                                {caseStudies[activeCase].results.conversion}
                                            </div>
                                        </div>
                                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Zap className="w-6 h-6 text-yellow-400" />
                                                <span className="text-sm text-white/60 font-medium">Page Load Time</span>
                                            </div>
                                            <div className="text-4xl font-light text-white">
                                                {caseStudies[activeCase].results.loadTime}
                                            </div>
                                        </div>
                                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Users className="w-6 h-6 text-blue-400" />
                                                <span className="text-sm text-white/60 font-medium">Active Users</span>
                                            </div>
                                            <div className="text-4xl font-light text-white">
                                                {caseStudies[activeCase].results.users}
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

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/30"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-8 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="text-lg font-light text-white pr-6">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="w-6 h-6 text-white/40 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-white/40 flex-shrink-0" />
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
                                            <div className="px-8 pb-8 text-white/60 leading-relaxed text-base">
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
            <section className="relative w-full py-40 border-t border-white/5">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <h2 className="text-5xl sm:text-6xl font-light text-white leading-tight">
                                Ready to build something<br />
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">amazing</span>?
                            </h2>
                            <p className="text-xl text-white/50 max-w-2xl mx-auto">
                                Let's discuss your project and create a digital experience that drives real results
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl font-medium">
                                <span>Start Your Project</span>
                                <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                            <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 border-2 border-white/20 text-white rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                                <span className="font-light">Schedule a Call</span>
                            </button>
                        </div>

                        <div className="pt-12 flex items-center justify-center gap-8 text-sm text-white/40">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Free consultation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>No obligation quote</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Quick response</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative w-full border-t border-white/5 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-6 h-6 text-white" />
                                <span className="text-xl font-light text-white">Digital Studio</span>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Building digital experiences that convert and scale.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-4">Services</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li className="hover:text-white transition-colors cursor-pointer">Web Development</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Mobile Apps</li>
                                <li className="hover:text-white transition-colors cursor-pointer">UI/UX Design</li>
                                <li className="hover:text-white transition-colors cursor-pointer">SEO & Marketing</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-4">Company</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Our Work</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-4">Connect</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li className="hover:text-white transition-colors cursor-pointer">Twitter</li>
                                <li className="hover:text-white transition-colors cursor-pointer">LinkedIn</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Instagram</li>
                                <li className="hover:text-white transition-colors cursor-pointer">GitHub</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
                        <p>© 2024 Digital Studio. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}