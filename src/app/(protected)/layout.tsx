import React, { FC, ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import AppSidebar from './app-sidebar'
import { HydrateClient } from '@/trpc/server'

type Props = {
    children: ReactNode
}

const SidebarLayout: FC<Props> = ({children}) => {
  return (<HydrateClient>
    <SidebarProvider>
        <AppSidebar />
        <main className='w-full m-2'>
            <div className='flex items-center gap-2 border-sidebar-border bg-sidebar shadow rounded-md p-2 px-4'>
                {/* <SearchBar /> */}
                <div className='ml-auto'></div>
                <UserButton />
            </div>
            <div className="h-4"></div>
            <div className='border-sidebar-border bg-sidebar shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
                {children}
            </div>
        </main>
    </SidebarProvider>
    </HydrateClient>
  )
}

export default SidebarLayout