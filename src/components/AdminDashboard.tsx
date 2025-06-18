import React from 'react'
import { EstablishmentWithCategories } from '@/types/supabase'

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ establishment }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard - {establishment.name}</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
        {/* Add components for managing categories and menu items here */}
        <p>Here you can manage the menu items for your establishment.</p>
      </div>
    </div>
  )
}

export default AdminDashboard
