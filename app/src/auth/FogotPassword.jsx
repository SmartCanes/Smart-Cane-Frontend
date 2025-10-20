import SidebarContent from "../ui/components/SidebarContent"
import PasswordField from "../ui/components/PasswordField"
import TextField from "../ui/components/TextField"
import PrimaryButton from "../ui/components/PrimaryButton"
import ValidationModal from "../ui/components/ValidationModal"
import { useState } from "react"

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1 = Enter Email, 2 = Change Password
  const [showModal, setShowModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1) {
      // Show verification modal first, stay on step 1
      setShowModal(true)
      // Auto-hide modal and move to step 2 after 4 seconds
      setTimeout(() => {
        setShowModal(false)
        setTimeout(() => setStep(2), 500) // Slight delay before transitioning
      }, 4000)
    } else {
      // Submit password change
      console.log('Password changed')
    }
  }

  return (
    <div className="h-screen w-full relative flex justify-between">
         <SidebarContent />

        {/* Verification Code Modal */}
        {showModal && (
          <ValidationModal 
            type="verification-code"
            email={userEmail}
            position="top-center"
          />
        )}

        <div className="w-1/2 h-full flex flex-col items-center justify-center">
          
          <h1 className="font-poppins text-[64px] font-bold text-[#1C253C] mb-6 whitespace-nowrap">
                {step === 1 ? 'Forgot Password' : 'Change Password'}
              </h1>

          
          <form className="px-5 w-1/2" onSubmit={handleNext}>
           
           
            <div className="text-left mb-10">
              <p className="font-poppins text-[#1C253C] text-paragraph">
                {step === 1 
                  ? 'Enter your email address and we\'ll send you a code to reset your password.'
                  : <>We've sent an code to your<br />afri*********@gmail.com</>
                }
              </p>
            </div>

            {/* Step 1: Enter Email */}
            {step === 1 && (
              <div className="space-y-4">
                <TextField 
                  className="font-poppins" 
                  label="Email Address" 
                  placeholder="sample.email@gmail.com"
                  type="email"
                  required
                  onChange={(e) => setUserEmail(e.target.value)}
                />

                <PrimaryButton 
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6" 
                  bgColor="bg-primary-100" 
                  text="Send Code" 
                  type="submit"
                />
              </div>
            )}

            {/* Step 2: Change Password */}
            {step === 2 && (
              <div className="space-y-4">
                <PasswordField 
                  className="font-poppins" 
                  label="New Password" 
                  placeholder="enter your new password"
                  required
                />

                <PasswordField 
                  className="font-poppins" 
                  label="Re-enter Password" 
                  placeholder="re-enter your username..."
                  required
                />

                <PrimaryButton 
                  className="font-poppins w-full py-4 text-[18px] font-medium mt-6" 
                  bgColor="bg-primary-100" 
                  text="Submit" 
                  type="submit"
                />
              </div>
            )}
          </form>
        </div>
    </div>

  )
}

export default ForgotPassword
