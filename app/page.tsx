import React from 'react'
import Threads from '@/components/Threads'
function page() {
  return (

    <div>
      <div className='h-screen w-screen '>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>
    </div>
  )
}

export default page