import React from 'react'
import { Link } from 'react-router-dom'
import SidebarContent from '../ui/components/SidebarContent'
import TextField from '../ui/components/TextField'
import PasswordField from '../ui/components/PasswordField'
import PrimaryButton from '../ui/components/PrimaryButton'
const Login = () => {
  return (
    <div className='h-screen w-full relative flex justify-between'>
        
        <SidebarContent />
        <div className='w-1/2 h-full flex flex-col items-center justify-center'>

            <form className='px-5 w-1/2' action="">

            <div className='text-center mb-10'>
              <h1 className='font-poppins text-h1 font-bold text-[#1C253C] mb-6'>
                Welcome
              </h1>
              <p className='font-poppins  text-[#1C253C] text-paragraph'>Start your journey to safer and smarter mobility by signing up.</p>
            </div>

            <div className='space-y-4'>
                <TextField className='font-poppins' label={"Username"} placeholder='Enter your username...'></TextField>
                
                <PasswordField className='font-poppins relative' label={"Password"} placeholder='Enter your password...' required type='password'>
                          
                
                </PasswordField>
                      
                <a href="#" className='font-poppins block text-left hover:underline text-[16px] underline mt-2'>Forgot password?</a>
                
                <PrimaryButton className='font-poppins w-full py-4 text-[18px] font-medium mt-6' bgColor='bg-primary-100' text='Sign In' type='submit'></PrimaryButton>
                
                <p className='font-poppins text-center text-[18px] mt-4'>Need An Account? <Link to="/register" className='font-poppins text-blue-500 hover:underline text-[18px]'>Sign Up</Link></p>
            </div>
            </form>
        </div>
        </div>

  )
}

export default Login    