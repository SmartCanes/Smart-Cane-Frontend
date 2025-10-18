import React from 'react'

const SelectField = ({ label, placeholder, options, className, required, onChange, value, disabled }) => {
  return (
    <div className={`flex flex-col text-left ${className}`}>
      {label && (
        <label className='font-poppins text-[#1C253C] font-medium mb-2 text-[16px]'>
          {label}
        </label>
      )}
      <select
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent appearance-none bg-white cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '12px'
        }}
      >
        <option value="" disabled>
          {placeholder || 'Select...'}
        </option>
        {options && options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectField
