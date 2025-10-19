import React, { useState, useEffect } from 'react'
import SidebarContent from '../ui/components/SidebarContent'
import TextField from '../ui/components/TextField'
import SelectField from '../ui/components/SelectField'
import PasswordField from '../ui/components/PasswordField'
import PrimaryButton from '../ui/components/PrimaryButton'
import {
  getRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity
} from '../../Api/Locations'

const Register = () => {
  const [step, setStep] = useState(1) // 1 = Basic Info, 2 = Address Info

  // Geographic data states
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [barangays, setBarangays] = useState([])

  // Selected values
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const loadRegions = async () => {
    try {
      const regionOptions = await getRegions()
      setRegions(regionOptions)
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  const loadProvinces = async (regionCode) => {
    try {
      const provinceOptions = await getProvincesByRegion(regionCode)
      setProvinces(provinceOptions)
      setCities([])
      setBarangays([])
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  const loadCities = async (provinceCode) => {
    try {
      const cityOptions = await getCitiesByProvince(provinceCode)
      setCities(cityOptions)
      setBarangays([])
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const loadBarangays = async (cityCode) => {
    try {
      const barangayOptions = await getBarangaysByCity(cityCode)
      setBarangays(barangayOptions)
    } catch (error) {
      console.error('Error fetching barangays:', error)
    }
  }

  const handleRegionChange = (e) => {
    const regionCode = e.target.value
    setSelectedRegion(regionCode)
    setSelectedProvince('')
    setSelectedCity('')
    loadProvinces(regionCode)
  }

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    setSelectedProvince(provinceCode)
    setSelectedCity('')
    loadCities(provinceCode)
  }

  const handleCityChange = (e) => {
    const cityCode = e.target.value
    setSelectedCity(cityCode)
    loadBarangays(cityCode)
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      // Submit the form
      console.log('Form submitted')
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <div className='h-screen w-full relative flex justify-between'>
      <SidebarContent />

      {step === 1 && (
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] flex justify-center z-10'>
          {/* <p className='font-poppins pb-4 font-[12px] whitespace-nowrap'>
  Thank you so much for choosing to stay with us during your recent visit. We truly enjoyed having you as our guest and hope your stay was comfortable and pleasant. Your visit brought warmth to our place, and we look forward to welcoming you again soon. If you have any questions or need help planning your next stay, feel free to reach out. 🙏😊
</p> */}
        </div>
      )}

      <div className='w-1/2 h-full flex flex-col items-center justify-center overflow-y-auto py-8'>
        <form className='px-5 w-1/2' onSubmit={handleNext}>
          
          <div className='text-center mb-10'>
            <h1 className='font-poppins text-h1 font-bold text-[#1C253C] mb-6'>
              Welcome
            </h1>
            <p className='font-poppins text-[#1C253C] text-paragraph'>
              {step === 1 
                ? 'Start your journey to safer and smarter mobility by signing up.'
                : 'Please provide your address information.'}
            </p>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <TextField 
                  className='font-poppins' 
                  label={"First Name"} 
                  placeholder='First Name...'
                  required
                />
                
                <TextField 
                  className='font-poppins' 
                  label={"Last Name"} 
                  placeholder='Last Name...'
                  required
                />
              </div>

              <TextField 
                className='font-poppins' 
                label={"Username"} 
                placeholder='Enter your username...'
                required
              />

              <PasswordField 
                className='font-poppins' 
                label={"Password"} 
                placeholder='Enter your password...'
                required
              />

              <PasswordField 
                className='font-poppins' 
                label={"Re-enter Password"} 
                placeholder='Re-enter your password...'
                required
              />

              <PrimaryButton 
                className='font-poppins w-full py-4 text-[18px] font-medium mt-6' 
                bgColor='bg-primary-100' 
                text='Next' 
                type='submit'
              />
            </div>
      
          )}

          {/* Step 2: Address Information */}
          {step === 2 && (
            <div className='space-y-4'>
              {/* Lot No./Bldg./Street - Full width */}
              <TextField
                className='font-poppins'
                label={"Lot No./Bldg./Street"}
                placeholder='Enter your'
                required
              />

              {/* Barangay and City - Side by side */}
              <div className='grid grid-cols-2 gap-4'>
                <SelectField
                  className='font-poppins'
                  label={"Barangay"}
                  placeholder='Barangay...'
                  required
                  options={barangays}
                  disabled={!selectedCity}
                />
                
                <SelectField
                  className='font-poppins'
                  label={"City"}
                  placeholder='City...'
                  required
                  options={cities}
                  onChange={handleCityChange}
                  value={selectedCity}
                  disabled={!selectedProvince}
                />
              </div>

              {/* Province - Full width */}
              <SelectField
                className='font-poppins'
                label={"Province"}
                placeholder='Province...'
                required
                options={provinces}
                onChange={handleProvinceChange}
                value={selectedProvince}
                disabled={!selectedRegion}
              />

              {/* Email Address - Full width */}
              <TextField
                className='font-poppins'
                label={"Email Address"}
                placeholder='sample.email@gmail.com'
                type='email'
                required
              />

              {/* Contact Number - Full width */}
              <TextField
                className='font-poppins'
                label={"Contact Number"}
                placeholder='09XX XXX XXXX'
                type='tel'
                required
              />

              <PrimaryButton 
                className='font-poppins w-full py-4 text-[18px] font-medium mt-6' 
                bgColor='bg-primary-100' 
                text='Next' 
                type='submit'
              />
            </div>
          )}
  
        </form>
      </div>
      
    </div>
   

  )
}

export default Register
