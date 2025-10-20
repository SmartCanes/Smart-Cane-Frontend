import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarContent from '../ui/components/SidebarContent'
import TextField from '../ui/components/TextField'
import SelectField from '../ui/components/SelectField'
import PasswordField from '../ui/components/PasswordField'
import PrimaryButton from '../ui/components/PrimaryButton'
import ValidationModal from '../ui/components/ValidationModal'
import Loader from '../ui/components/Loader'
import {
  getRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity
} from '../../Api/Locations'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = Basic Info, 2 = Address Info, 3 = OTP Verification
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    position: 'center'
  })
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const otpRefs = [
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef()
  ]

  // Temporary dummy data for testing
  const dummyBarangays = [
    { value: 'brgy1', label: 'Barangay 1' },
    { value: 'brgy2', label: 'Barangay 2' },
    { value: 'brgy3', label: 'Barangay 3' },
    { value: 'brgy4', label: 'Barangay 4' },
    { value: 'brgy5', label: 'Barangay 5' }
  ]

  const dummyCities = [
    { value: 'city1', label: 'Manila' },
    { value: 'city2', label: 'Quezon City' },
    { value: 'city3', label: 'Makati' },
    { value: 'city4', label: 'Pasig' },
    { value: 'city5', label: 'Taguig' }
  ]

  const dummyProvinces = [
    { value: 'prov1', label: 'Metro Manila' },
    { value: 'prov2', label: 'Bulacan' },
    { value: 'prov3', label: 'Cavite' },
    { value: 'prov4', label: 'Laguna' },
    { value: 'prov5', label: 'Rizal' }
  ]

  // Geographic data states
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState(dummyProvinces)
  const [cities, setCities] = useState(dummyCities)
  const [barangays, setBarangays] = useState(dummyBarangays)

  // Selected values
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  /* TEMPORARILY DISABLED API CALLS
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
  */

  const handleRegionChange = (e) => {
    const regionCode = e.target.value
    setSelectedRegion(regionCode)
    setSelectedProvince('')
    setSelectedCity('')
    // loadProvinces(regionCode) // Disabled
  }

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    setSelectedProvince(provinceCode)
    setSelectedCity('')
    // loadCities(provinceCode) // Disabled
  }

  const handleCityChange = (e) => {
    const cityCode = e.target.value
    setSelectedCity(cityCode)
    // loadBarangays(cityCode) // Disabled
  }

  const hideModal = () => {
    setModalConfig({ visible: false, type: null, position: 'center' })
  }

  const handleModalAction = () => {
    if (modalConfig.type === 'account-created') {
      navigate('/login')
    }
    hideModal()
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      // Show phone verification modal
      setModalConfig({
        visible: true,
        type: 'phone-verification',
        position: 'top-center'
      })
      // Auto-hide modal and move to step 3 after 3 seconds
      setTimeout(() => {
        hideModal()
        setTimeout(() => setStep(3), 500)
      }, 3000)
    } else {
      // Submit the form (after OTP verification)
      setIsSubmitting(true)

      // Simulate API submission
      setTimeout(() => {
        setIsSubmitting(false)
        setModalConfig({
          visible: true,
          type: 'account-created',
          position: 'center'
        })
      }, 2000)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      // Auto-focus next input
      if (value && index < 3) {
        otpRefs[index + 1].current?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <div className='h-screen w-full relative flex justify-between'>
      <SidebarContent />

      {step === 3 && isSubmitting && (
        <div className='absolute inset-y-0 left-0 w-1/2 flex items-center justify-center z-30'>
          <Loader size="large" color='#FDFCFA' />
        </div>
      )}

      {/* Phone Verification Modal */}
      {modalConfig.visible && (
        <ValidationModal 
          type={modalConfig.type}
          position={modalConfig.position}
          onAction={handleModalAction}
        />
      )}

      {step === 1 && (
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] flex justify-center z-10'>
          {/* <p className='font-poppins pb-4 font-[12px] whitespace-nowrap'>
  Thank you so much for choosing to stay with us during your recent visit. We truly enjoyed having you as our guest and hope your stay was comfortable and pleasant. Your visit brought warmth to our place, and we look forward to welcoming you again soon. If you have any questions or need help planning your next stay, feel free to reach out. 🙏😊
</p> */}
        </div>
      )}

      <div className='w-1/2 h-full flex flex-col items-center justify-center overflow-y-auto py-8'>
        <form className='px-2 w-1/2' onSubmit={handleNext}>
          
          <div className='text-center mb-10'>
            <h1 className='font-poppins text-h1 font-bold text-[#1C253C] mb-6'>
              {step === 3 ? 'Phone Verification' : 'Welcome'}
            </h1>
            <p className='font-poppins text-[#1C253C] text-paragraph'>
              {step === 1 
                ? 'Start your journey to safer and smarter mobility by signing up.'
                : step === 2
                ? 'Please provide your address information.'
                : <>Enter the <span className="font-bold">One-Time Password (OTP)</span> we have sent to your registered contact number 09*******345.</>}
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
                  onChange={(e) => setSelectedCity(e.target.value)}
                  value={selectedCity}
                />
                
                <SelectField
                  className='font-poppins'
                  label={"City"}
                  placeholder='City...'
                  required
                  options={cities}
                  onChange={handleCityChange}
                  value={selectedCity}
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

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className='space-y-6'>
              {/* OTP Input Boxes */}
              <div className='flex justify-center gap-4'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type='text'
                    maxLength='1'
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className='w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none'
                  />
                ))}
              </div>

              {/* Resend OTP Link */}
              <div className='text-center'>
                <p className='font-poppins text-[#1C253C] text-sm mb-2'>
                  Didn't receive an OTP?
                </p>
                <button 
                  type='button'
                  className='font-poppins text-[#1C253C] hover:underline text-sm'
                >
                  Resend OTP
                </button>
              </div>

              <PrimaryButton 
                className='font-poppins w-full py-4 text-[18px] font-medium mt-6' 
                bgColor='bg-primary-100' 
                text='Submit' 
                type='submit'
                disabled={isSubmitting}
              />
            </div>
          )}
  
        </form>
      </div>
    </div>


  )
}

export default Register
