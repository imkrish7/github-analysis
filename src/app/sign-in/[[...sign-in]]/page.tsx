import { HydrateClient } from '@/trpc/server'
import { SignIn } from '@clerk/nextjs'
import React from 'react'

const Signin = () => {
  return (
    <HydrateClient>
    <div className='w-full h-screen flex justify-center items-center'>
        <SignIn />
    </div>
    </HydrateClient>
  )
}

export default Signin