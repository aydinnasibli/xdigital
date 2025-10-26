'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import * as THREE from 'three'

export default function page() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const { scrollYProgress } = useScroll()
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    // Three.js Scene
    useEffect(() => {
        if (!canvasRef.current) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true
        })

        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        camera.position.z = 5

        // Create fluid geometric shapes
        const geometry = new THREE.IcosahedronGeometry(1, 1)
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            emissive: 0x444444,
        })

        const shapes: THREE.Mesh[] = []
        for (let i = 0; i < 15; i++) {
            const mesh = new THREE.Mesh(geometry, material.clone())
            mesh.position.x = (Math.random() - 0.5) * 15
            mesh.position.y = (Math.random() - 0.5) * 15
            mesh.position.z = (Math.random() - 0.5) * 10
            mesh.rotation.x = Math.random() * Math.PI
            mesh.rotation.y = Math.random() * Math.PI
            const scale = Math.random() * 0.5 + 0.3
            mesh.scale.set(scale, scale, scale)
            shapes.push(mesh)
            scene.add(mesh)
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 1)
        pointLight.position.set(5, 5, 5)
        scene.add(pointLight)

        // Animation
        let animationId: number
        const animate = () => {
            animationId = requestAnimationFrame(animate)

            shapes.forEach((shape, i) => {
                shape.rotation.x += 0.001 + i * 0.0001
                shape.rotation.y += 0.001 + i * 0.0001

                // Floating effect
                shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001
            })

            // Mouse interaction
            camera.position.x += (mousePosition.x * 0.5 - camera.position.x) * 0.05
            camera.position.y += (-mousePosition.y * 0.5 - camera.position.y) * 0.05
            camera.lookAt(scene.position)

            renderer.render(scene, camera)
        }
        animate()

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', handleResize)
            renderer.dispose()
        }
    }, [mousePosition])

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const team = [
        { name: "Alex Morgan", role: "Creative Director", exp: "12 years", focus: "Vision & Strategy" },
        { name: "Jordan Chen", role: "Technical Lead", exp: "9 years", focus: "Architecture" },
        { name: "Sam Rivera", role: "Growth Lead", exp: "8 years", focus: "Market Expansion" },
    ]

    const principles = [
        { num: "01", title: "Craft Over Speed", desc: "We believe in taking time to perfect details that others overlook" },
        { num: "02", title: "Honest Communication", desc: "No jargon, no fluff—just transparent dialogue about what works" },
        { num: "03", title: "Long-term Thinking", desc: "Building relationships and products that stand the test of time" },
        { num: "04", title: "Continuous Evolution", desc: "Always learning, always improving, never settling for good enough" },
    ]

    return (
        <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Three.js Canvas Background */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full -z-10"
                style={{ background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)' }}
            />

            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="max-w-6xl w-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="space-y-12"
                    >
                        {/* Intro Line */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />

                        {/* Main Title */}
                        <div className="space-y-6">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="text-white/40 text-sm tracking-[0.3em] uppercase font-mono"
                            >
                                About xDigital
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] tracking-tight"
                            >
                                We don't build<br />
                                <span className="text-white/30">websites.</span><br />
                                We craft<br />
                                <span className="italic font-serif">experiences.</span>
                            </motion.h1>
                        </div>

                        {/* Philosophy Statement */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.2 }}
                            className="max-w-2xl ml-auto"
                        >
                            <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light">
                                In a world drowning in mediocre digital products, we exist to create
                                work that makes people pause, think, and feel something real.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Philosophy Grid */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-white/30 text-sm tracking-[0.3em] uppercase font-mono mb-20"
                    >
                        Our Principles
                    </motion.h2>

                    <div className="grid md:grid-cols-2 gap-16">
                        {principles.map((principle, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="space-y-6 pb-8 border-b border-white/10 group-hover:border-white/30 transition-colors duration-500">
                                    <div className="text-6xl md:text-7xl font-light text-white/10 group-hover:text-white/20 transition-colors duration-500">
                                        {principle.num}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-light tracking-tight">
                                        {principle.title}
                                    </h3>
                                    <p className="text-white/40 text-lg leading-relaxed">
                                        {principle.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section - Horizontal Scroll Effect */}
            <section className="relative py-32 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="space-y-12"
                    >
                        <h2 className="text-white/30 text-sm tracking-[0.3em] uppercase font-mono">
                            Genesis
                        </h2>

                        <div className="space-y-8 text-xl md:text-2xl leading-relaxed text-white/50 font-light">
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                Founded in 2019 by three designers who were tired of seeing
                                beautiful ideas crushed by poor execution.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-white/70"
                            >
                                We started small—working nights and weekends, obsessing over
                                every pixel, every interaction, every moment of delight.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                Today, we're a team of 15, but we've kept that same obsessive
                                attention to detail. Every project gets our full focus.
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Team - Minimal Cards */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-white/30 text-sm tracking-[0.3em] uppercase font-mono mb-20"
                    >
                        Leadership
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.15 }}
                                className="group"
                            >
                                <div className="space-y-6">
                                    {/* Abstract Avatar */}
                                    <div className="relative aspect-[3/4] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 
                                            group-hover:from-white/10 group-hover:to-white/5 transition-all duration-700" />
                                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

                                        {/* Geometric Pattern */}
                                        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                                            <pattern id={`pattern-${idx}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <circle cx="10" cy="10" r="1" fill="white" opacity="0.3" />
                                            </pattern>
                                            <rect width="100" height="100" fill={`url(#pattern-${idx})`} />
                                        </svg>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-2xl font-light tracking-tight mb-1">
                                                {member.name}
                                            </h3>
                                            <p className="text-white/40 text-sm tracking-wider uppercase">
                                                {member.role}
                                            </p>
                                        </div>

                                        <div className="flex gap-4 text-sm text-white/30">
                                            <span>{member.exp}</span>
                                            <span>·</span>
                                            <span>{member.focus}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats with Scroll Animation */}
            <section className="relative py-32 px-6 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { value: "50+", label: "Projects Delivered" },
                            { value: "98%", label: "Client Retention" },
                            { value: "6", label: "Years Running" },
                            { value: "15", label: "Team Members" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="text-center space-y-3"
                            >
                                <div className="text-5xl md:text-6xl font-light tracking-tighter">
                                    {stat.value}
                                </div>
                                <div className="text-white/30 text-sm tracking-wider uppercase">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-40 px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="max-w-5xl mx-auto text-center space-y-12"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight">
                        Let's create something<br />
                        <span className="italic font-serif text-white/60">unforgettable together</span>
                    </h2>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-12 py-5 overflow-hidden"
                    >
                        <div className="absolute inset-0 border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                        <span className="relative text-lg tracking-wider uppercase font-mono">
                            Start a Project
                        </span>
                    </motion.button>
                </motion.div>
            </section>

            {/* Scroll Progress Indicator */}
            <motion.div
                className="fixed bottom-8 left-8 w-16 h-16 pointer-events-none z-50 hidden lg:block"
                style={{ opacity: useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]) }}
            >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.1"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.4"
                        strokeDasharray="283"
                        style={{
                            strokeDashoffset: useTransform(smoothProgress, [0, 1], [283, 0])
                        }}
                    />
                </svg>
            </motion.div>
        </div>
    )
}