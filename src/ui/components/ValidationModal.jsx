import React from 'react'
import PrimaryButton from './PrimaryButton'

const ValidationModal = ({ type, email, onClose, onAction, position = 'center' }) => {
  const getContent = () => {
    switch (type) {
      case 'verification-code':
        return {
          title: 'Forgot Password',
          description: (
            <>
              We've sent a <span className="font-bold">verification code</span> to your email:<br />
              {email || 'afri******@gmail.com'}<br /><br />
              Please check your <span className="font-bold">Inbox</span> or <span className="font-bold">Spam</span> Folder.
            </>
          ),
          showButton: false
        }
      
      case 'account-created':
        return {
          title: 'Account Created!',
          description: (
            <>
              Success! your ICane account is ready. Click below to sign in and start exploring.
            </>
          ),
          buttonText: 'Go to Login',
          showButton: true
        }
      
      case 'login-success':
        return {
          title: 'Welcome!',
          description: (
            <>
              You have successfully logged into your ICane account. We are redirecting you to your dashboard now.
            </>
          ),
          showButton: false
        }
      
      case 'phone-verification':
        return {
          title: 'Phone Verification',
          description: (
            <>
              We've sent a <span className="font-bold">verification code</span> to your phone number:<br />
              +63 9** *** ****<br /><br />
              Please check your <span className="font-bold">Messages</span>.
            </>
          ),
          showButton: false
        }
      
      default:
        return {
          title: 'Notification',
          description: 'Action completed successfully.',
          showButton: false
        }
    }
  }

  const content = getContent()

  // Determine positioning and styling based on position prop
  const isCornerPosition = position === 'top-right' || position === 'top-left' || position === 'top-center'
  
  const positionClasses = {
    'center': 'fixed inset-0 flex items-center justify-center',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2'
  }

  const shouldDimBackground = position === 'center' && content.title !== 'Account Created!'
  const overlayClasses = shouldDimBackground ? 'bg-black bg-opacity-50' : ''

  const modalSizeClasses = isCornerPosition ? 'max-w-sm' : 'max-w-2xl w-full mx-4'
  const headerHeight = isCornerPosition ? 'h-20' : 'h-32'
  const contentPadding = isCornerPosition ? 'px-8 py-6' : 'px-12 py-10'
  const titleSize = isCornerPosition ? 'text-3xl' : 'text-5xl'
  const descriptionSize = isCornerPosition ? 'text-sm' : 'text-lg'

  return (
  <div className={`${positionClasses[position] || positionClasses.center} ${overlayClasses} z-50`}>
      <div className={`bg-white rounded-3xl shadow-2xl ${modalSizeClasses}`}>
        {/* Header with curved background */}
        <div className={`bg-[#1C253C] ${headerHeight} rounded-t-3xl`}></div>
        
        {/* Content */}
        <div className={`${contentPadding} text-center`}>
          <h1 className={`font-poppins ${titleSize} font-bold text-[#1C253C] mb-4`}>
            {content.title}
          </h1>
          
          <p className={`font-poppins text-[#1C253C] ${descriptionSize} leading-relaxed ${content.showButton ? 'mb-8' : ''}`}>
            {content.description}
          </p>

          {content.showButton && (
            <PrimaryButton 
              className="font-poppins w-full max-w-md mx-auto py-4 text-[18px] font-medium" 
              bgColor="bg-primary-100" 
              text={content.buttonText} 
              onClick={onAction}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ValidationModal
