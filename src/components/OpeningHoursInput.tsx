'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Clock, Plus, Minus } from 'lucide-react'
import { 
  DaySchedule, 
  TimeSlot, 
  sanitizeTimeInput, 
  validateHour, 
  validateMinute,
  defaultTimeSlot 
} from '@/lib/utils'

interface OpeningHoursInputProps {
  schedule: DaySchedule[]
  onChange: (schedule: DaySchedule[]) => void
  className?: string
}

const TimeSlotInput: React.FC<{
  timeSlot: TimeSlot
  onChange: (timeSlot: TimeSlot) => void
  label: string
  disabled?: boolean
}> = ({ timeSlot, onChange, label, disabled = false }) => {
  const updateField = (field: keyof TimeSlot, value: string) => {
    const sanitized = sanitizeTimeInput(value)
    
    // Validate based on field type
    if ((field === 'startHour' || field === 'endHour') && sanitized && !validateHour(sanitized)) {
      return
    }
    if ((field === 'startMinute' || field === 'endMinute') && sanitized && !validateMinute(sanitized)) {
      return
    }
    
    onChange({
      ...timeSlot,
      [field]: sanitized
    })
  }

  return (
    <div className={`space-y-1 ${disabled ? 'opacity-50' : ''}`}>
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="HH"
            value={timeSlot.startHour}
            onChange={(e) => updateField('startHour', e.target.value)}
            disabled={disabled}
            className="w-9 h-8 text-center text-xs p-1"
            maxLength={2}
          />
          <span className="text-xs">:</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={timeSlot.startMinute}
            onChange={(e) => updateField('startMinute', e.target.value)}
            disabled={disabled}
            className="w-9 h-8 text-center text-xs p-1"
            maxLength={2}
          />
        </div>
        <span className="text-xs text-gray-500">-</span>
        <div className="flex items-center gap-0.5">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="HH"
            value={timeSlot.endHour}
            onChange={(e) => updateField('endHour', e.target.value)}
            disabled={disabled}
            className="w-9 h-8 text-center text-xs p-1"
            maxLength={2}
          />
          <span className="text-xs">:</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={timeSlot.endMinute}
            onChange={(e) => updateField('endMinute', e.target.value)}
            disabled={disabled}
            className="w-9 h-8 text-center text-xs p-1"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  )
}

const DayScheduleInput: React.FC<{
  daySchedule: DaySchedule
  onChange: (daySchedule: DaySchedule) => void
}> = ({ daySchedule, onChange }) => {
  const updateSchedule = (updates: Partial<DaySchedule>) => {
    onChange({ ...daySchedule, ...updates })
  }

  const toggleSecondPeriod = () => {
    updateSchedule({
      hasSecondPeriod: !daySchedule.hasSecondPeriod,
      secondPeriod: !daySchedule.hasSecondPeriod ? { ...defaultTimeSlot } : daySchedule.secondPeriod
    })
  }

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm min-w-[2.5rem]">{daySchedule.day}</span>
          <div className="flex items-center gap-1.5">
            <Switch
              checked={!daySchedule.isClosed}
              onCheckedChange={(checked) => updateSchedule({ isClosed: !checked })}
            />
            <span className="text-xs text-gray-600">
              {daySchedule.isClosed ? 'Fermé' : 'Ouvert'}
            </span>
          </div>
        </div>
        
        {!daySchedule.isClosed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleSecondPeriod}
            className="flex items-center gap-1 text-xs h-7 px-2"
          >
            {daySchedule.hasSecondPeriod ? (
              <>
                <Minus className="w-3 h-3" />
                <span className="hidden sm:inline">Supprimer 2ème</span>
                <span className="sm:hidden">-2ème</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Ajouter 2ème</span>
                <span className="sm:hidden">+2ème</span>
              </>
            )}
          </Button>
        )}
      </div>

      {!daySchedule.isClosed && (
        <div className="space-y-2">
          <TimeSlotInput
            timeSlot={daySchedule.firstPeriod}
            onChange={(firstPeriod) => updateSchedule({ firstPeriod })}
            label="1ère période"
          />
          
          {daySchedule.hasSecondPeriod && (
            <TimeSlotInput
              timeSlot={daySchedule.secondPeriod}
              onChange={(secondPeriod) => updateSchedule({ secondPeriod })}
              label="2ème période"
            />
          )}
        </div>
      )}
    </div>
  )
}

export const OpeningHoursInput: React.FC<OpeningHoursInputProps> = ({
  schedule,
  onChange,
  className = ""
}) => {
  const updateDay = (index: number, daySchedule: DaySchedule) => {
    const newSchedule = [...schedule]
    newSchedule[index] = daySchedule
    onChange(newSchedule)
  }

  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4" />
        Horaires d'ouverture
      </Label>
      
      <div className="space-y-2">
        {schedule.map((daySchedule, index) => (
          <DayScheduleInput
            key={daySchedule.day}
            daySchedule={daySchedule}
            onChange={(newDaySchedule) => updateDay(index, newDaySchedule)}
          />
        ))}
      </div>
      
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 Format 24h (ex: 14:30). Ajoutez une 2ème période pour les pauses déjeuner.
        </p>
      </div>
    </div>
  )
}

export default OpeningHoursInput
