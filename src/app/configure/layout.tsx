import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Steps from '@/components/Steps'
import { ReactNode } from 'react'
import { Toaster } from "@/components/ui/sonner"


const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
    <MaxWidthWrapper className='flex-1 flex flex-col'>
      <Toaster/>
      <Steps />
      {children}
    </MaxWidthWrapper>
    </>
  )
}   


export default Layout
