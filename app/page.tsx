'use client'
import React, { useEffect, useState } from 'react'
import Threads from '@/components/Threads'
import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import { ArrowUpRight, Minus } from 'lucide-react'

function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
    <div className='relative w-screen overflow-x-hidden bg-black'>
      {/* Subtle cursor follower */}
      <div
        className="fixed w-96 h-96 pointer-events-none z-50 transition-opacity duration-500"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Hero Section */}
      <section className='relative min-h-screen w-full overflow-hidden flex items-center justify-center'>
        <div className='absolute inset-0 z-0'>
          <Threads
            amplitude={1.1}
            distance={0}
            enableMouseInteraction={true}
            color={[0.3, 0.3, 0.3]}
          />
        </div>

        <div className='relative z-10 w-full max-w-7xl mx-auto px-8 py-32'>
          {/* Simple status indicator */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="text-xs text-white/40 uppercase tracking-widest">Available for work</span>
          </div>

          {/* Main Title */}
          <div className="mb-16">
            <SplitText
              text="xDigital"
              className="text-[18vw] md:text-[15vw] lg:text-[12vw] font-light text-white/95 leading-[0.85] tracking-tight"
              delay={40}
              duration={1.2}
              ease="power4.out"
              splitType="chars"
              from={{ opacity: 0, y: 100 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
            />
          </div>

          {/* Tagline */}
          <div className="max-w-2xl mb-32">
            <div className="text-2xl md:text-3xl text-white/50 font-light leading-relaxed">
              <TextType
                text={[
                  "Digital agency focused on craft",
                  "Building products that matter",
                  "Design and development studio"
                ]}
                typingSpeed={60}
                deletingSpeed={30}
                pauseDuration={3000}
                showCursor={false}
              />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-black p-12 hover:bg-white/[0.02] transition-colors duration-500 group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-start justify-between mb-12">
                  <span className="text-sm text-white/30 font-mono">{service.number}</span>
                  <Minus className={`w-5 h-5 text-white/30 transition-all duration-500 ${hoveredIndex === idx ? 'rotate-90' : ''}`} />
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
              <Minus className="w-8 h-8 text-white/20" />
              <h2 className="text-sm text-white/40 uppercase tracking-widest">Selected Work</h2>
            </div>

            <div className="space-y-px bg-white/5 border border-white/5">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className="bg-black p-8 hover:bg-white/[0.02] transition-all duration-500 group cursor-pointer"
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
                    <ArrowUpRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-40 border-t border-white/5 pt-20">
            <div className="max-w-4xl">
              <h2 className="text-5xl md:text-7xl text-white/90 font-light mb-8 leading-tight">
                Let's work together
              </h2>
              <p className="text-xl text-white/40 mb-12 leading-relaxed max-w-2xl">
                We're currently accepting new projects. Get in touch to discuss your ideas.
              </p>
              <button className="group inline-flex items-center gap-4 text-white/90 text-lg hover:text-white transition-colors">
                <span className="font-light">Get in touch</span>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-40 flex flex-wrap gap-12 text-sm text-white/30">
            <div>
              <div className="text-white/20 uppercase tracking-wider text-xs mb-2">Email</div>
              <div>hello@xdigital.com</div>
            </div>
            <div>
              <div className="text-white/20 uppercase tracking-wider text-xs mb-2">Location</div>
              <div>Istanbul, Turkey</div>
            </div>
            <div>
              <div className="text-white/20 uppercase tracking-wider text-xs mb-2">Social</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white/60 transition-colors">Instagram</a>
                <a href="#" className="hover:text-white/60 transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Page