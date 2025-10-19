import React from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from '../ui/components/PrimaryButton.jsx'
import TextField from '../ui/components/TextField.jsx'
import smartcaneLogo from '../assets/images/smartcane-logo.png'

const Welcome = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <div className=' bg-[#11285A] h-screen flex items-center justify-center flex-col relative font-poppins'>
        <img src={smartcaneLogo} alt="Smart Cane Logo" width={720} className='absolute opacity-5 select-none z-0' />
        <img src={smartcaneLogo} alt="Smart Cane Logo" width={290} className='z-10' />
        <p className='font-poppins text-white max-w-[490px] py-16 text-center text-[20px] z-10'>
          Bringing independence closer through a cane that's more than just support — it's smart.
        </p>
          <PrimaryButton 
            className='w-1/4 py-4 hover:bg-gray-400 hover:text-white hover:cursor-pointer  text-[20px] z-10' 
            text="Get Started" 
            textColor='text-[#11285A]' 
            bgColor='bg-white'
            onClick={handleGetStarted}
          />

    </div>

  )
}

export default Welcome

