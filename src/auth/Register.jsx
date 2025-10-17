import React, { useState, useEffect } from 'react'
import SidebarContent from '../ui/components/SidebarContent'
import TextField from '../ui/components/TextField'
import SelectField from '../ui/components/SelectField'
import PasswordField from '../ui/components/PasswordField'
import PrimaryButton from '../ui/components/PrimaryButton'

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

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const response = await fetch('https://psgc.gitlab.io/api/regions/')
      const data = await response.json()
      const regionOptions = data.map(region => ({
        value: region.code,
        label: region.name
      }))
      setRegions(regionOptions)
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }

  const fetchProvinces = async (regionCode) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`)
      const data = await response.json()
      const provinceOptions = data.map(province => ({
        value: province.code,
        label: province.name
      }))
      setProvinces(provinceOptions)
      setCities([])
      setBarangays([])
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  const fetchCities = async (provinceCode) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`)
      const data = await response.json()
      const cityOptions = data.map(city => ({
        value: city.code,
        label: city.name
      }))
      setCities(cityOptions)
      setBarangays([])
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchBarangays = async (cityCode) => {
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`)
      const data = await response.json()
      const barangayOptions = data.map(barangay => ({
        value: barangay.code,
        label: barangay.name
      }))
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
    fetchProvinces(regionCode)
  }

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    setSelectedProvince(provinceCode)
    setSelectedCity('')
    fetchCities(provinceCode)
  }

  const handleCityChange = (e) => {
    const cityCode = e.target.value
    setSelectedCity(cityCode)
    fetchBarangays(cityCode)
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
                  placeholder=''
                  required
                />
                
                <TextField 
                  className='font-poppins' 
                  label={"Last Name"} 
                  placeholder=''
                  required
                />
              </div>

              <TextField 
                className='font-poppins' 
                label={"Username"} 
                placeholder=''
                required
              />

              <PasswordField 
                className='font-poppins' 
                label={"Password"} 
                placeholder=''
                required
              />

              <PasswordField 
                className='font-poppins' 
                label={"Re-enter Password"} 
                placeholder=''
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
              <TextField 
                className='font-poppins' 
                label={"Lot No./Bldg./Street"} 
                placeholder=''
                required
              />

              <SelectField 
                className='font-poppins' 
                label={"Region"} 
                placeholder='Select Region'
                required
                options={regions}
                onChange={handleRegionChange}
                value={selectedRegion}
              />

              <SelectField 
                className='font-poppins' 
                label={"Province"} 
                placeholder='Select Province'
                required
                options={provinces}
                onChange={handleProvinceChange}
                value={selectedProvince}
                disabled={!selectedRegion}
              />

              <SelectField 
                className='font-poppins' 
                label={"City/Municipality"} 
                placeholder='Select City/Municipality'
                required
                options={cities}
                onChange={handleCityChange}
                value={selectedCity}
                disabled={!selectedProvince}
              />

              <SelectField 
                className='font-poppins' 
                label={"Barangay"} 
                placeholder='Select Barangay'
                required
                options={barangays}
                disabled={!selectedCity}
              />

              <TextField 
                className='font-poppins' 
                label={"Email Address"} 
                placeholder=''
                type='email'
                required
              />

              <TextField 
                className='font-poppins' 
                label={"Contact Number"} 
                placeholder=''
                type='tel'
                required
              />

              <div className='flex gap-4'>
            
                 <PrimaryButton 
                className='font-poppins w-full py-4 text-[18px] font-medium mt-6' 
                bgColor='bg-primary-100' 
                text='Next' 
                type='submit'
              />
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}

export default Register
