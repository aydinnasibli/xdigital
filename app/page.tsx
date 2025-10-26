'use client'
import React, { useState, useRef, useEffect } from 'react'
import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import Beams from '@/components/Beams'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Mail, Star, ArrowRight, Minus, CheckCircle2, Sparkles, Code, TrendingUp, Zap, Users, Award } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
gsap.registerPlugin(ScrollTrigger)

function Page() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeService, setActiveService] = useState(0)
  const router = useRouter()
  const button1Ref = useRef<HTMLButtonElement>(null)
  const button2Ref = useRef<HTMLButtonElement>(null)
  const animation1Ref = useRef<gsap.core.Tween | null>(null)
  const animation2Ref = useRef<gsap.core.Tween | null>(null)


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Skip animations if user prefers reduced motion
      if (button1Ref.current) gsap.set(button1Ref.current, { opacity: 1, y: 0 });
      if (button2Ref.current) gsap.set(button2Ref.current, { opacity: 1, y: 0 });
      return;
    }

    // Animate first button
    if (button1Ref.current) {
      gsap.set(button1Ref.current, {
        opacity: 0,
        y: 30,
        willChange: 'transform, opacity',
      })

      animation1Ref.current = gsap.to(button1Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 1.7,
        ease: 'sine.in',
        scrollTrigger: {
          trigger: button1Ref.current,
          start: 'top 90%',
          once: true,
          fastScrollEnd: true,
        },
        onComplete: () => {
          if (button1Ref.current) {
            gsap.set(button1Ref.current, { willChange: 'auto' });
          }
        },
      })
    }

    // Animate second button
    if (button2Ref.current) {
      gsap.set(button2Ref.current, {
        opacity: 0,
        y: 30,
        willChange: 'transform, opacity',
      })

      animation2Ref.current = gsap.to(button2Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 2.1,
        ease: 'sine.in',
        scrollTrigger: {
          trigger: button2Ref.current,
          start: 'top 90%',
          once: true,
          fastScrollEnd: true,
        },
        onComplete: () => {
          if (button2Ref.current) {
            gsap.set(button2Ref.current, { willChange: 'auto' });
          }
        },
      })
    }

    // Cleanup function
    return () => {
      // Kill animations
      if (animation1Ref.current) {
        animation1Ref.current.kill();
        animation1Ref.current = null;
      }
      if (animation2Ref.current) {
        animation2Ref.current.kill();
        animation2Ref.current = null;
      }

      // Kill ScrollTriggers
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === button1Ref.current || st.trigger === button2Ref.current) {
          st.kill();
        }
      })

      // Reset styles
      if (button1Ref.current) {
        gsap.set(button1Ref.current, { clearProps: 'all' });
      }
      if (button2Ref.current) {
        gsap.set(button2Ref.current, { clearProps: 'all' });
      }
    }
  }, [])


  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }


  const processSteps = [
    {
      step: "01",
      title: "Plan",
      description: "We analyze your needs, define goals, and create a strategic roadmap for your project.",
      required: true
    },
    {
      step: "02",
      title: "Build",
      description: "Our team brings your vision to life with clean code and beautiful design.",
      required: true
    },
    {
      step: "03",
      title: "Launch",
      description: "We ensure a smooth deployment and provide training for your team.",
      required: true
    },
    {
      step: "04",
      title: "Optimize",
      description: "Ongoing support and improvements to maximize your digital presence.",
      required: false
    }
  ]

  const testimonials = [
    {
      quote: "Working with xDigital transformed our online presence. Their attention to detail and commitment to excellence is unmatched.",
      author: "Bucurotto ",
      position: "CEO, TechStart Inc.",
      company: "TechStart",
      rating: 5
    },
    {
      quote: "The team delivered beyond our expectations. Our new platform has increased conversions by 150% in just three months.",
      author: "Necmo Arabito",
      position: "Marketing Director, GrowthLab",
      company: "GrowthLab",
      rating: 5

    },
    {
      quote: "Professional, creative, and results-driven. They took the time to understand our vision and brought it to life perfectly.",
      author: "Emma Williams",
      position: "Founder, Creative Studios",
      company: "Creative Studios",
      rating: 5

    }
  ]
  const services = [
    {
      id: 'website',
      number: "01",
      icon: Code,
      title: "Website Development",
      shortDescription: "Professional websites built with modern technology",
      fullDescription: "Transform your business with a stunning, high-performance website. Our drag-and-drop builder and premium templates make it easy to launch your online presence in days, not months.",
      features: [
        "50+ Premium Templates",
        "Drag & Drop Editor",
        "Mobile Responsive",
        "SEO Optimized",
        "Custom Domain",
        "Free SSL Certificate"
      ],
      idealFor: "Small businesses, startups, and entrepreneurs",
      startingPrice: "From $29/month",
      link: "/web"
    },
    {
      id: 'smma',
      number: "02",
      icon: TrendingUp,
      title: "Social Media Marketing",
      shortDescription: "Strategic social media management and growth",
      fullDescription: "Grow your brand and engage your audience across all major platforms. We create compelling content, manage your presence, and drive real business results through data-driven strategies.",
      features: [
        "Content Strategy",
        "Post Scheduling",
        "Community Management",
        "Analytics & Reporting",
        "Paid Advertising",
        "Influencer Outreach"
      ],
      idealFor: "Brands looking to scale their social presence",
      startingPrice: "Custom pricing",
      link: "/socialmedia"
    },
    {
      id: 'consulting',
      number: "03",
      icon: Sparkles,
      title: "Digital Solutions",
      shortDescription: "Comprehensive digital transformation services",
      fullDescription: "Navigate the digital landscape with expert guidance. We help you develop winning strategies, optimize operations, and implement solutions that drive sustainable growth.",
      features: [
        "Digital Strategy",
        "Tech Stack Consulting",
        "Process Optimization",
        "Growth Planning",
        "Market Analysis",
        "Implementation Support"
      ],
      idealFor: "Growing businesses ready to scale",
      startingPrice: "Custom packages",
      link: "/digitalsolutions"
    },
  ]

  const whyChooseUs = [
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Launch your website in days, not months. Our streamlined process gets you online quickly."
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Work with experienced designers and developers who understand your business needs."
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Every project meets our high standards. Your satisfaction is our priority."
    }
  ]
  return (
    <div className='relative w-full overflow-x-hidden'>
      {/* Hero Section with Threads Background */}
      <section className='relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4'>
        {/* Background Threads Animation */}
        <div className='absolute inset-0'>
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={12}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={0}
          />
        </div>

        {/* Hero Content */}
        <div className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Main Title - Centered */}
          <div className="relative z-10 select-none flex h-full w-full items-center justify-center">
            <SplitText
              text="xDigital"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold text-gray-300 text-center"
              delay={40}
              duration={1.2}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 100 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="center"
            />
          </div>

          {/* Tagline - Centered */}
          <div className="max-w-2xl mx-auto text-center mt-6 sm:mt-8 px-4">
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl select-none text-white/50 font-light leading-relaxed">
              <TextType
                text={[
                  "Digital agency focused on craft",
                  "Building products that matter",
                  "Design and development studio"
                ]}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={3000}
                showCursor={true}
                initialDelay={1000}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex mt-8 sm:mt-10 flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <button
              ref={button1Ref}
              onClick={() => router.push('/sign-up')}
              className="group hover:cursor-pointer w-full sm:w-auto rounded-2xl inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Start a new project"
            >
              <span className="font-light text-sm sm:text-base">Start a project</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            </button>
            <button
              ref={button2Ref}
              onClick={() => scrollToSection('services-detail')}
              className="group hover:cursor-pointer w-full sm:w-auto rounded-xl inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="View our services"
            >
              <span className="font-light text-sm sm:text-base">Our services</span>
            </button>
          </div>
        </div>

        <div className="absolute hidden md:flex lg:flex  bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2  flex-col items-center">
          {/* Mouse Container */}
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 relative" aria-hidden="true">
            {/* Scroll Wheel */}
            <div className="w-1 h-2 bg-white/60 rounded-full animate-[scroll_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section id="services-detail" className='relative w-full py-12 sm:py-16 md:py-20'>
        <div className="text-center mb-12 sm:mb-16 md:mb-20 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white/90 mb-3 sm:mb-4">
            What We Offer
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto px-4">
            Choose the service that fits your needs, or combine them for maximum impact
          </p>
        </div>
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

          {/* Service Tabs */}
          <div className="grid grid-cols-3 mb-8 sm:mb-12 border-b border-white/5 pb-2 sm:pb-3 gap-1 sm:gap-2">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => setActiveService(idx)}
                className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 hover:cursor-pointer text-xs sm:text-sm md:text-base transition-all duration-500 ${activeService === idx
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/40 hover:text-white/70 border-b-2 border-transparent'
                  }`}
              >
                <span className="hidden sm:inline">{service.title}</span>
                <span className="sm:hidden">{service.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
          {/* Active Service Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start"
            >
              {/* Left: Description */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-light text-white/90 mb-4 sm:mb-6">
                  {services[activeService].title}
                </h3>

                <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6 sm:mb-8">
                  {services[activeService].fullDescription}
                </p>

                <div className="space-y-4 mb-6 sm:mb-8">
                  <p className="text-xs text-white/40 uppercase tracking-wider">What's Included</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {services[activeService].features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm sm:text-base text-white/40">Ideal for:</span>
                    <span className="text-sm sm:text-base text-white/70 text-right">{services[activeService].idealFor}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm sm:text-base text-white/40">Starting at:</span>
                    <span className="text-white font-light text-base sm:text-lg">{services[activeService].startingPrice}</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Card */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-zinc-900 border rounded-2xl border-white/10 p-6 sm:p-8 lg:p-10">
                  <h4 className="text-xl sm:text-2xl font-light text-white/90 mb-3 sm:mb-4">
                    Ready to get started?
                  </h4>
                  <p className="text-sm sm:text-base text-white/50 mb-6 sm:mb-8">
                    Let's discuss how {services[activeService].title.toLowerCase()} can help grow your business.
                  </p>

                  <Link href={'/sign-up'} className="w-full rounded-xl bg-white text-black py-3 sm:py-4 hover:bg-white/90 transition-all duration-300 mb-3 sm:mb-4 inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                    <span>Start Your Project</span>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>

                  <Link href={services[activeService].link}
                    className="w-full bg-gray-200/20 rounded-xl text-white py-3 sm:py-4 hover:bg-gray-300/30 transition-all duration-300 mb-3 sm:mb-4 inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                    <span>More Detail</span>
                  </Link>

                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5">
                    <p className="text-xs sm:text-sm text-white/40 text-center">
                      Questions? <a href="mailto:hello@xdigital.com" className="text-white/70 hover:text-white underline-offset-2  underline duration-300 transition-all">Email us</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>


      {/* Process - Minimal & Elegant */}
      <section className="relative w-full py-16 sm:py-24 md:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-sm sm:text-base md:text-lg text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono mb-8 sm:mb-12">Our Process</h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-light text-white/70 max-w-3xl">
              No bloat. Just pure execution from idea to launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-16">
            {processSteps.map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: idx * 0.1 }} className="relative group">
                <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-light text-white/[0.10] group-hover:text-white/30 transition-colors duration-500">
                      {step.step}
                    </span>
                    {!step.required && (
                      <span className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider font-mono">opt</span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-white/80 group-hover:text-white transition-colors duration-500">
                    {step.title}
                  </h3>

                  <div className="h-px bg-white/5 group-hover:bg-white/20 transition-colors duration-500" />

                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className='relative w-full py-16 sm:py-24 md:py-32'>
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="flex items-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20">
            <Minus className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
            <h2 className="text-xs sm:text-sm text-white/40 uppercase tracking-wider sm:tracking-widest">What Sets Us Apart</h2>
          </div>

          {/* Comparison Table */}
          <div className="border border-white/20 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-3 border-b border-white/20">
                <div className="p-3 sm:p-4 md:p-6"></div>
                <div className="p-3 sm:p-4 md:p-6 border-l border-white/20">
                  <h3 className="text-sm sm:text-base md:text-lg font-light text-white/40">Typical Agencies</h3>
                </div>
                <div className="p-3 sm:p-4 md:p-6 border-l border-white/20 bg-white/[0.02]">
                  <h3 className="text-sm sm:text-base md:text-lg font-light text-white">xDigital</h3>
                </div>
              </div>

              {/* Comparison Rows */}
              {[
                {
                  category: "Delivery Time",
                  them: "3-6 months minimum",
                  us: "Launch in 2-4 weeks"
                },
                {
                  category: "Communication",
                  them: "Weekly email updates",
                  us: "Real-time collaboration & daily updates"
                },
                {
                  category: "Pricing",
                  them: "Hidden fees, scope creep",
                  us: "Transparent, fixed pricing upfront"
                },
                {
                  category: "Technology",
                  them: "Outdated legacy systems",
                  us: "Modern, cutting-edge stack"
                },
                {
                  category: "Support",
                  them: "Ends after launch",
                  us: "Ongoing optimization & support"
                },
                {
                  category: "Results",
                  them: "Vague promises",
                  us: "Measurable KPIs & guaranteed outcomes"
                }
              ].map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="grid grid-cols-3 border-b border-white/10 last:border-b-0 hover:bg-white/[0.01] transition-colors duration-300"
                >
                  {/* Category */}
                  <div className="p-3 sm:p-4 md:p-6 flex items-center">
                    <span className="text-xs sm:text-sm md:text-base text-white/70 font-light">{row.category}</span>
                  </div>

                  {/* Them */}
                  <div className="p-3 sm:p-4 md:p-6 border-l border-white/10 flex items-center">
                    <span className="text-xs sm:text-sm text-white/40">{row.them}</span>
                  </div>

                  {/* Us */}
                  <div className="p-3 sm:p-4 md:p-6 border-l border-white/10 bg-white/[0.02] flex items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-white/80">{row.us}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => scrollToSection('services-detail')}
              className="group inline-flex rounded-xl hover:cursor-pointer items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-sm sm:text-base"
            >
              <span className="font-light">See our services in action</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials - Rotating Showcase */}
      <section className='relative w-full py-16 sm:py-24 md:py-32'>
        <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="relative min-h-[350px] sm:min-h-[400px] flex items-center">
            {testimonials.map((testimonial, idx) => (
              <motion.div key={idx} initial={false} animate={{ opacity: activeTestimonial === idx ? 1 : 0, scale: activeTestimonial === idx ? 1 : 0.95, y: activeTestimonial === idx ? 0 : 20 }} transition={{ duration: 0.7, ease: "backInOut" }} className="absolute inset-0" style={{
                pointerEvents: activeTestimonial === idx ? 'auto' : 'none',
                visibility: activeTestimonial === idx ? 'visible' : 'hidden' // ADD THIS
              }}>
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-white/60 text-white/60" />
                    ))}
                  </div>

                  <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white/80 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-px flex-grow bg-white/10" />
                    <div className="text-right">
                      <div className="text-sm sm:text-base text-white/90 font-light">{testimonial.author}</div>
                      <div className="text-white/30 text-xs sm:text-sm">{testimonial.position}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-8 sm:mt-12">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setActiveTestimonial(idx)} className={`h-1 transition-all duration-500 ${activeTestimonial === idx ? 'w-10 sm:w-12 bg-white/80' : 'w-6 sm:w-8 bg-white/20 hover:bg-white/40'}`} aria-label={`View testimonial ${idx + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Bold Statement */}
      <section className='relative w-full py-20 sm:py-32 md:py-40 border-t border-white/5'>
        <div className='w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="text-center space-y-8 sm:space-y-10 md:space-y-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white/90 leading-tight px-4">
              Ready to build something that matters?
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto px-4">
              No sales calls. No pitches. Just a real conversation about your vision.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4">
              <Link href="/contact" className="group inline-flex w-full sm:w-auto rounded-3xl items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-white text-black hover:bg-white/80 transition-all duration-300">
                <span className="font-light text-sm sm:text-base">Let's Talk</span>
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Page