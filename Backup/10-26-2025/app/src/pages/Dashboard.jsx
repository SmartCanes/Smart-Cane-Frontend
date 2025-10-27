import React, { useState, useEffect } from 'react'
import ValidationModal from '../ui/components/ValidationModal'

const Dashboard = () => {
  const [showModal, setShowModal] = useState(true)

  useEffect(() => {
    // Auto-hide modal after 3 seconds
    const timer = setTimeout(() => {
      setShowModal(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
 
      {showModal && (
        <ValidationModal 
          type="login-success"
          position="top-right"
        />
      )}

      {/* Dashboard Container */}
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="font-poppins text-4xl font-bold text-[#1C253C] mb-4">
            Dashboard
          </h1>
          <p className="font-poppins text-lg text-gray-600">
            Welcome to your Smart Cane dashboard. Your content will appear here.
          </p>

          {/* Placeholder content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-primary-100 p-6 rounded-lg">
              <h3 className="font-poppins text-xl font-semibold text-white mb-2">
                Device Status
              </h3>
              <p className="font-poppins text-white">Connected</p>
            </div>
            
            <div className="bg-primary-100 p-6 rounded-lg">
              <h3 className="font-poppins text-xl font-semibold text-white mb-2">
                Battery Level
              </h3>
              <p className="font-poppins text-white">85%</p>
            </div>
            
            <div className="bg-primary-100 p-6 rounded-lg">
              <h3 className="font-poppins text-xl font-semibold text-white mb-2">
                Last Activity
              </h3>
              <p className="font-poppins text-white">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
