import { Leaf, WineOff } from 'lucide-react'

interface DietaryBadgeProps {
  type: 'vegan' | 'alcohol-free'
  size?: 'sm' | 'md'
  variant?: 'active' | 'inactive'
  className?: string
}

export default function DietaryBadge({ type, size = 'md', variant = 'active', className = '' }: DietaryBadgeProps) {
  const isVegan = type === 'vegan'
  
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-xs'
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
  
  const variantClasses = variant === 'active' 
    ? (isVegan 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-blue-100 text-blue-800 border border-blue-200')
    : 'bg-gray-100 text-gray-500 border border-gray-200'
  
  const iconClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  
  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}>
      {isVegan ? (
        <Leaf className={iconClasses} />
      ) : (
        <WineOff className={iconClasses} />
      )}
      {isVegan ? 'Vegan' : 'Sans alcool'}
    </span>
  )
}
