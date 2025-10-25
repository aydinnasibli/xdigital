'use client'
import React, { useState, useRef, useEffect } from 'react'

import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import Beams from '@/components/Beams'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Minus, CheckCircle2, Sparkles, Code, TrendingUp, Zap, Users, Award } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { motion } from 'motion/react'
import Link from 'next/link'
gsap.registerPlugin(ScrollTrigger)

function Page() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeService, setActiveService] = useState(0)
  const button1Ref = useRef<HTMLButtonElement>(null)
  const button2Ref = useRef<HTMLButtonElement>(null)
  const animation1Ref = useRef<gsap.core.Tween | null>(null)
  const animation2Ref = useRef<gsap.core.Tween | null>(null)

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
      title: "Website Creation",
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
      link: "digitalsolutions"
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
      <section className='relative min-h-screen  w-full overflow-hidden flex items-center justify-center'>
        {/* Background Threads Animation */}
        <div className='absolute inset-0'>
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={12}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2} /* dont forget to adjust it properly*/
            rotation={0}
          />
        </div>

        {/* Hero Content */}
        <div className='relative z-10 w-full max-w-7xl mx-auto px-8'>
          {/* Main Title - Centered */}
          <div className="relative z-10 select-none flex h-full w-full items-center justify-center ">
            <SplitText
              text="xDigital"
              className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white/85 text-center"
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-xl mt-0.5 select-none md:text-2xl text-white/50 font-light leading-relaxed tracking-widest">
              <TextType
                text={[
                  "Web Development",
                  "Digital Solutions",
                  "Social Media Marketing",
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
          <div className="flex mt-8 flex-col sm:flex-row items-center justify-center gap-4">
            <button
              ref={button1Ref}
              className="group hover:cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Start a new project"
            >
              <span className="font-light">Start a project</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            </button>
            <button
              ref={button2Ref}
              className="group hover:cursor-pointer inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="View our services"
            >
              <span className="font-light">Our services</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          {/* Mouse Container */}
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 relative" aria-hidden="true">
            {/* Scroll Wheel */}
            <div className="w-1 h-2 bg-white/60 rounded-full animate-[scroll_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </section>

      {/* Services Overview - Quick Cards */}
      <section id="services-overview" className='relative w-full  py-32'>
        <div className='w-full max-w-7xl mx-auto px-8'>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Choose the service that fits your needs, or combine them for maximum impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon
              return (
                <div
                  key={idx}
                  className="group relative bg-black border border-white/5 hover:border-white/20 transition-all duration-700 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative p-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                        <Icon className="w-6 h-6 text-white/40 group-hover:text-white/70 transition-colors" />
                      </div>
                      <span className="text-sm text-white/20 font-mono">{service.number}</span>
                    </div>

                    <h3 className="text-2xl text-white/85 font-light mb-4 group-hover:text-white transition-colors">
                      {service.title}
                    </h3>

                    <div className="h-px bg-white/5 mb-6 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-white/40 to-transparent w-0 group-hover:w-full transition-all duration-1000" />
                    </div>

                    <p className="text-white/45 text-sm leading-relaxed mb-6 group-hover:text-white/65 transition-colors">
                      {service.shortDescription}
                    </p>

                    <button
                      onClick={() => scrollToSection('services-detail')

                      }
                      className="text-white/60 hover:text-white text-sm inline-flex items-center gap-2 group/btn"
                    >
                      Learn more
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section >

      {/* Detailed Services Section */}
      < section id="services-detail" className='relative w-full  py-32' >
        <div className='w-full max-w-7xl mx-auto px-8'>
          <div className="flex items-center gap-4 mb-16">
            <Minus className="w-8 h-8 text-white/20" />
            <h2 className="text-sm text-white/40 uppercase tracking-widest">Services in Detail</h2>
          </div>

          {/* Service Tabs */}
          <div className="flex flex-wrap gap-4 mb-12 border-b border-white/5 pb-6">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => setActiveService(idx)}
                className={`px-6 py-3 hover:cursor-pointer text-sm transition-all duration-500 ${activeService === idx
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/40 hover:text-white/70 border-b-2 border-transparent'
                  }`}
              >
                {service.title}
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
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* Left: Description */}
              <div>
                <h3 className="text-3xl font-light text-white/90 mb-6">
                  {services[activeService].title}
                </h3>

                <p className="text-base text-white/60 leading-relaxed mb-8">
                  {services[activeService].fullDescription}
                </p>

                <div className="space-y-4 mb-8">
                  <p className="text-xs text-white/40 uppercase tracking-wider">What's Included</p>
                  <ul className="space-y-3">
                    {services[activeService].features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Ideal for:</span>
                    <span className="text-white/70">{services[activeService].idealFor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Starting at:</span>
                    <span className="text-white font-light text-lg">{services[activeService].startingPrice}</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Card */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-zinc-900 border rounded-2xl border-white/10 p-10">
                  <h4 className="text-2xl font-light text-white/90 mb-4">
                    Ready to get started?
                  </h4>
                  <p className="text-white/50 mb-8">
                    Let's discuss how {services[activeService].title.toLowerCase()} can help grow your business.
                  </p>

                  <Link href={'/sign-up'} className="w-full bg-white text-black py-4 hover:bg-white/90 transition-all duration-300 mb-4 inline-flex items-center justify-center gap-2">
                    <span>Start Your Project</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>

                  <Link href={services[activeService].link}
                    className="w-full bg-gray-200/20   text-white py-4 hover:bg-gray-300/30 transition-all duration-300 mb-4 inline-flex items-center justify-center gap-2">
                    <span>More Detail</span>
                  </Link>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-sm text-white/40  text-center">
                      Questions? <a href="mailto:hello@xdigital.com" className="text-white/70 hover:text-white  duration-300 transition-all">Email us</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section >


      {/* How We Work Section - Production Ready */}
      < div className="mt-40" >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-20">
            <Minus className="w-8 h-8 text-white/20" aria-hidden="true" />
            <h2 id="how-we-work" className="text-sm text-white/40 uppercase tracking-widest">
              How We Work
            </h2>
          </div>

          {/* Process Timeline */}
          <div className="relative">
            {/* Vertical Line - Desktop Only */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-white/5 hidden lg:block"
              aria-hidden="true"
            />

            {/* Steps */}
            <div className="space-y-16 lg:space-y-20">
              {processSteps.map((step) => (
                <article
                  key={step.step}
                  className="relative group"
                  aria-labelledby={`step-${step.step}-title`}
                >
                  {/* Step Indicator Dot - Desktop Only */}
                  <div
                    className="absolute left-0 top-6 w-3 h-3 bg-white/20 rounded-full border-4 border-black group-hover:bg-white/60 group-hover:scale-150 transition-all duration-500 hidden lg:block -translate-x-[5px]"
                    aria-hidden="true"
                  />

                  {/* Content Container */}
                  <div className="lg:pl-16">
                    {/* Step Header - Number & Title */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 mb-4">
                      {/* Step Number */}
                      <span
                        className="text-5xl sm:text-6xl lg:text-7xl font-light text-white/[0.08] group-hover:text-white/[0.15] transition-colors duration-500 select-none leading-none"
                        aria-hidden="true"
                      >
                        {step.step}
                      </span>

                      {/* Title & Badge Container */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3
                            id={`step-${step.step}-title`}
                            className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/85 group-hover:text-white transition-colors duration-500"
                          >
                            {step.title}
                          </h3>
                          {!step.required && (
                            <span
                              className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white/30 border border-white/20 rounded-sm"
                              aria-label="This step is optional"
                            >
                              Optional
                            </span>
                          )}
                        </div>

                        {/* Animated underline */}
                        <div
                          className="h-px w-0 bg-gradient-to-r from-white/40 to-transparent group-hover:w-24 lg:group-hover:w-32 transition-all duration-700"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-base lg:text-lg text-white/50 leading-relaxed max-w-3xl group-hover:text-white/70 transition-colors duration-500 sm:ml-0 lg:ml-[100px]">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div >
      {/* Why Choose Us Section */}
      < section className='relative w-full py-32' >
        <div className='w-full max-w-7xl mx-auto px-8'>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-4">
              Why Choose xDigital?
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              We combine creativity, technology, and strategy to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-white/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white/40" />
                  </div>
                  <h3 className="text-xl text-white/90 font-light mb-3">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section >

    </div >
  )
}

export default Page