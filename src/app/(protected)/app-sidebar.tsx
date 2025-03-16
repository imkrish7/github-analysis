'use client'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import useProject from '@/hooks/use-project'
import { cn } from '@/lib/utils'
import { Bot, CreditCard, LayoutDashboardIcon, Plus, PlusIcon, Presentation } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Items = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboardIcon
    },
    {
        title: 'Q&A',
        url: '/qa',
        icon: Bot
    },
    {
        title: 'Meetings',
        url: '/meetings',
        icon: Presentation
    },
    {
        title: 'Billing',
        url: '/billing',
        icon: CreditCard
    }
]

const AppSidebar = () => {
    const pathname = usePathname();
    const { open } = useSidebar();
    const {projects, projectId, setProjectId} = useProject()
  return <Sidebar collapsible='icon' variant='floating'>
    <SidebarHeader>
        <div className='flex items-center gap-2'>
            <span>Logo</span>
            {
                open && <h1 className='text-xl font-bold text-primary/80'>
                    Dinosys
                </h1>
            }
        </div>
    </SidebarHeader>
    <SidebarContent>
    <SidebarGroup>
        <SidebarGroupLabel>
            Application
        </SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
            {
                Items.map((item,index)=>{
                    return <SidebarMenuItem className='list-none' key={index}>
                            <SidebarMenuButton asChild>
                                <Link href={item.url} className={cn({
                                    'bg-primary text-white': pathname=== item.url
                                })}>
                                    <item.icon />
                                    <span className=''>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                    </SidebarMenuItem>
                })
            }
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup>
        <SidebarGroupLabel>
            Your Project
        </SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
                {
                    projects?.map((project, index)=>{
                        return <SidebarMenuItem key={index}>
                            <SidebarMenuButton asChild onClick={()=>setProjectId(project.id)}>
                                <div>
                                    <div className={cn( 'rounded-sm border size-6 flex item-center justify-center text-sm bg-white text-primary',
                                    {
                                       'bg-primary text-white': projectId === project.id
                                    })}>
                                        {project.name[0]}
                                    </div>
                                    <span>{project.name}</span>
                                </div>
                            </SidebarMenuButton>
                    </SidebarMenuItem>
                    })
                }
                <div className="h-2"></div>
                <SidebarMenuItem>
                    <Link href={'/create'}>
                    <Button variant='outline' className='w-fit'>
                        <Plus />
                       Create Project
                    </Button>
                    </Link>
                </SidebarMenuItem>
                
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
    </SidebarContent>
  </Sidebar>
}

export default AppSidebar