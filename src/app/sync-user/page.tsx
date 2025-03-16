import { db } from '@/server/db';
import { auth, clerkClient} from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation';
import React from 'react'

const SyncUser = async () => {
    const { userId } = await auth();
    if(!userId){
        throw new Error('user not found')
    }
    const _clerkClient = await clerkClient();
    const user = await _clerkClient.users.getUser(userId);
    if(!user.emailAddresses[0]?.emailAddress){
        return notFound();
    }
    await db.user.upsert({
        where: {
            emailAddress: user.emailAddresses[0]?.emailAddress?? ""
        },
        update: {
            firstName: user.firstName?? '',
            lastName: user.lastName?? '',
            imageUrl: user.imageUrl,
            id: userId,
            emailAddress: user.emailAddresses[0]?.emailAddress
        },
        create: {
            firstName: user.firstName?? '',
            lastName: user.lastName?? '',
            imageUrl: user.imageUrl,
            id: userId,
            emailAddress: user.emailAddresses[0]?.emailAddress
        }
    })
  return redirect('/dashboard')
}

export default SyncUser