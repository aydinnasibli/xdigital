'use client'
import React, { useState, useRef, useEffect } from 'react'

import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import { ArrowUpRight, Minus, Quote } from 'lucide-react'
import Beams from '@/components/Beams'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Page() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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

  const services = [
    {
      number: "01",
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies",
    },
    {
      number: "02",
      title: "Social Media Marketing",
      description: "Strategic social media management and growth solutions",
    },
    {
      number: "03",
      title: "Digital Solutions",
      description: "Comprehensive digital transformation and consulting services",
    },
  ]

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
      author: "Sarah Johnson",
      position: "CEO, TechStart Inc.",
      company: "TechStart",
      rating: 5
    },
    {
      quote: "The team delivered beyond our expectations. Our new platform has increased conversions by 150% in just three months.",
      author: "Michael Chen",
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

  return (
    <div className='relative w-full overflow-x-hidden'>
      {/* Hero Section with Threads Background */}
      <section className='relative min-h-screen w-full overflow-hidden flex items-center justify-center'>
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
            <div className="text-xl select-none md:text-2xl text-white/50 font-light leading-relaxed">
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

      {/* Services Section */}
      <section className='relative w-full bg-black'>
        <div className='w-full max-w-7xl mx-auto px-8 py-32'>
          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-black p-12 hover:bg-white/[0.02] transition-colors duration-500 group cursor-pointer focus-within:bg-white/[0.02]"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                tabIndex={0}
                role="article"
              >
                <div className="flex items-start justify-between mb-12">
                  <span className="text-sm text-white/30 font-mono">{service.number}</span>
                  <Minus className={`w-5 h-5 text-white/30 transition-all duration-500 ${hoveredIndex === idx ? 'rotate-90' : ''}`} aria-hidden="true" />
                </div>
                <h3 className="text-2xl text-white/90 font-light mb-4 group-hover:text-white transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          {/* How We Work Section */}
          <div className="mt-40">
            <div className="flex items-center justify-center gap-4 mb-16">
              <Minus className="w-8 h-8 text-white/20" aria-hidden="true" />
              <h2 className="text-sm text-white/40 uppercase tracking-widest">How We Work</h2>
            </div>

            <div className="space-y-12 max-w-3xl mx-auto">
              {processSteps.map((step, idx) => (
                <div key={idx} className="relative group flex flex-col items-center text-center">
                  <div className="mb-6">
                    <div className="relative inline-block">
                      <span className="text-7xl text-white/5 font-light group-hover:text-white/10 transition-colors duration-500">
                        {step.step}
                      </span>
                      {!step.required && (
                        <span className="absolute -top-2 -right-10 text-[10px] text-white/30 font-mono px-2 py-0.5 border border-white/10 bg-black">
                          OPT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pb-8">
                    <h3 className="text-3xl text-white/90 font-light mb-3 group-hover:text-white transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {idx < processSteps.length - 1 && (
                    <div className="w-px h-12 bg-gradient-to-b from-white/5 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section - Staggered Card Style */}
          <div className="mt-40">
            <div className="flex items-center gap-4 mb-16">
              <Minus className="w-8 h-8 text-white/20" aria-hidden="true" />
              <h2 className="text-sm text-white/40 uppercase tracking-widest">What Clients Say</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="group relative"
                >
                  {/* Glow Effect on Hover */}
                  <div className="absolute -inset-px bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                  {/* Card */}
                  <div className="relative bg-black border border-white/10 group-hover:border-white/30 transition-all duration-500 p-10 h-full flex flex-col">

                    {/* Stars Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-white/60 group-hover:fill-white/80 transition-colors duration-300"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-white/70 group-hover:text-white/90 text-base leading-relaxed mb-8 flex-grow transition-colors duration-300">
                      {testimonial.quote}
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-px bg-gradient-to-r from-white/40 to-transparent mb-6 group-hover:w-24 transition-all duration-500" />

                    {/* Author */}
                    <div>
                      <p className="text-white font-light text-lg mb-1 group-hover:text-white transition-colors">
                        {testimonial.author}
                      </p>
                      <p className="text-white/40 text-sm">
                        {testimonial.position}
                      </p>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-white/5 group-hover:border-white/20 transition-colors duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Page