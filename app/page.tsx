'use client';

import React from 'react';
import { Palette, Monitor, Lightbulb, PenTool, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from './components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <Navbar />

      {/* Main Hero Section */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative">
            {/* Top Left - Branding */}
            <div className="absolute top-0 left-20 flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer">
                <Palette className="w-5 h-5 text-gray-400" />
              </div>
              <span className="mt-3 text-sm text-gray-400">Branding</span>
              <div className="absolute top-12 left-6 w-px h-48 bg-gradient-to-b from-slate-700/50 to-transparent" />
            </div>

            {/* Top Right - Digital Strategy */}
            <div className="absolute top-0 right-20 flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer">
                <Lightbulb className="w-5 h-5 text-gray-400" />
              </div>
              <span className="mt-3 text-sm text-gray-400">Digital Strategy</span>
              <div className="absolute top-12 left-6 w-px h-48 bg-gradient-to-b from-slate-700/50 to-transparent" />
            </div>

            {/* Center Content */}
            <div className="text-center py-64">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mb-8">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="text-sm text-gray-300">Digital Design Agency</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-7xl font-bold mb-6 leading-tight tracking-tight">
                Elevate Your
                <br />
                Digital Presence
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-400 mb-12">
                We turn your vision into impactful digital experiences.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-6 rounded-xl text-base font-medium h-auto">
                  Let's Talk
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700/50 bg-slate-800/30 text-white hover:bg-slate-800 hover:border-slate-600 px-8 py-6 rounded-xl text-base font-medium h-auto"
                >
                  See Work
                </Button>
              </div>
            </div>

            {/* Bottom Left - Web Design */}
            <div className="absolute bottom-0 left-20 flex flex-col items-center">
              <div className="absolute bottom-12 left-6 w-px h-48 bg-gradient-to-t from-slate-700/50 to-transparent" />
              <span className="mb-3 text-sm text-gray-400">Web Design</span>
              <div className="w-12 h-12 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer">
                <Monitor className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Bottom Right - UX/UI Design */}
            <div className="absolute bottom-0 right-20 flex flex-col items-center">
              <div className="absolute bottom-12 left-6 w-px h-48 bg-gradient-to-t from-slate-700/50 to-transparent" />
              <span className="mb-3 text-sm text-gray-400">UX/UI Design</span>
              <div className="w-12 h-12 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer">
                <PenTool className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Bottom Center - Scroll Indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="w-6 h-10 rounded-full border-2 border-slate-700/50 flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-slate-500 rounded-full" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}