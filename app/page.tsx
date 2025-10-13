'use client'
import React, { useEffect, useState } from 'react'
import Threads from '@/components/Threads'
import SplitText from '@/components/SplitText'
import TextType from '@/components/TextType'
import { ArrowUpRight, Minus } from 'lucide-react'

function Page() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)



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
    <div className='relative w-full overflow-x-hidden '>


      {/* Hero Section with Threads Background */}
      <section className='relative min-h-screen w-full overflow-hidden flex items-center justify-center'>
        {/* Background Threads Animation */}
        <div className='fixed -top-30 inset-0 z-0'>
          <Threads
            amplitude={1.1}
            distance={0.9}
            enableMouseInteraction={true}
            color={[1, 1, 1]}

          />
        </div>


        {/* Hero Content */}
        <div className='relative z-10 w-full max-w-7xl mx-auto px-8 py-32'>


          {/* Main Title - Centered */}
          <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">
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
          <div className="max-w-2xl mb-20 mx-auto text-center">
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
                showCursor={true}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-32">
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-white/90 transition-all duration-300">
              <span className="font-light">Start a project</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
              <span className="font-light">View our work</span>
            </button>
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