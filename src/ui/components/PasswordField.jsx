import React, { useState } from 'react'

const PasswordField = ({ label, placeholder, className, required }) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={`flex flex-col top-left item-align-center ${className}`}>
      {label && (
        <label className='font-poppins text-[#1C253C] font-medium mt-2 text-[16px] align-center'>
          {label}
        </label>
      )}
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent item-center'
        />
        <button
          type='button'
          onClick={togglePasswordVisibility}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
        >
          <span className='material-symbols-outlined item-center py-2'>
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default PasswordField
