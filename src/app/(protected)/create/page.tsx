'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const Create = () => {
  const {register, handleSubmit, reset} = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data:FormInput)=>{
    createProject.mutate({
      name: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken
    },{
      onSuccess: ()=>{
        toast.success('Projected created successfully')
        reset()
        refetch();
      },
      onError: ()=>{
        toast.error('Failed to create project')
      }
    })
  }
   
  return <div className='flex items-center justify-center gap-12 h-full'>
    <img src="/undraw_github.svg" className='h-56 w-auto' />
    <div>
      <div>
        <h1 className='font-semibold text-2xl'>
          Link you github repository
        </h1>
        <p className='text-sm text-muted-foreground'>
          Enter the URL of your respositry to link it to dinsys
        </p>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Project name" {...register('projectName', {required: true})} required/>
            <div className="h-2"></div>
            <Input placeholder="Repo url" {...register('repoUrl', {required: true})} required/>
            <div className="h-2"></div>
            <Input placeholder="Github token" {...register('githubToken')}/>
            <div className="h-4"></div>
            <Button type='submit' disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
}

export default Create