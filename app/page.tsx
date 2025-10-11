'use client'
import React from 'react'
import Threads from '@/components/Threads'
import SplitText from '@/components/SplitText'


function page() {

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');

  };
  return (

    <div className='relative h-screen w-screen overflow-hidden'>
      {/* Background Threads Animation */}
      <div className='absolute inset-0 z-0'>
        <Threads
          amplitude={1.15}
          distance={0}
          enableMouseInteraction={true}
          color={[1, 3, 5]}


        />
      </div>

      {/* Company Name Overlay */}
      <div className='relative z-10 flex h-full w-full items-center justify-center pointer-events-none'>
        <SplitText
          text="xDigital"
          className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white/85 text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      </div>


    </div>
  )
}

export default page