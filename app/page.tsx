'use client'
import React, { useState, useRef, useEffect } from 'react'

import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import { ArrowUpRight, Minus } from 'lucide-react'
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
      title: "Digital Products",
      description: "End-to-end product development from concept to launch",
    },
    {
      number: "03",
      title: "Creative Solutions",
      description: "Innovative approaches to complex digital challenges",
    },
  ]

  const projects = [
    { name: "E-Commerce Platform", year: "2024", category: "Web Development" },
    { name: "SaaS Dashboard", year: "2024", category: "Product Design" },
    { name: "Corporate Website", year: "2023", category: "Brand Identity" },
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
              aria-label="View our portfolio"
            >
              <span className="font-light">View our work</span>
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

          {/* Work Section */}
          <div className="mt-40">
            <div className="flex items-center gap-4 mb-12">
              <Minus className="w-8 h-8 text-white/20" aria-hidden="true" />
              <h2 className="text-sm text-white/40 uppercase tracking-widest">Selected Work</h2>
            </div>

            <div className="space-y-px bg-white/5 border border-white/5">
              {projects.map((project, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-black p-8 hover:bg-white/[0.02] transition-all duration-500 group cursor-pointer block focus:outline-none focus:bg-white/[0.02] focus:ring-2 focus:ring-inset focus:ring-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-6">
                        <h3 className="text-3xl md:text-4xl text-white/90 font-light group-hover:text-white transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-sm text-white/30 font-mono">{project.year}</span>
                      </div>
                      <p className="text-white/40 text-sm mt-2">{project.category}</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          </div>




        </div>
      </section>
    </div>
  )
}

export default Page