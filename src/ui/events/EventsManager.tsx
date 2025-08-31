import React, { useState, useEffect } from 'react';
import { Event, WeeklyEvents } from '../../lib/forms';
import { Button } from '../Button';
import { EventForm } from './EventForm';
import { EventsGrid } from './EventsGrid';

// Get Monday of current week for default
function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Get available weeks (current + next 8 weeks)
function getAvailableWeeks(): Array<{ value: string; label: string }> {
  const weeks: Array<{ value: string; label: string }> = [];
  const startDate = new Date();
  
  // Start from current Monday
  const day = startDate.getDay();
  const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
  const currentMonday = new Date(startDate.setDate(diff));
  
  // Generate current + next 8 weeks
  for (let i = 0; i < 9; i++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() + (i * 7));
    
    const dateStr = weekStart.toISOString().split('T')[0];
    const label = weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    weeks.push({
      value: dateStr,
      label: `Week of ${label}`
    });
  }
  
  return weeks;
}

export const EventsManager: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekStart());
  const [weeklyEvents, setWeeklyEvents] = useState<WeeklyEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [error, setError] = useState<string>('');

  const availableWeeks = getAvailableWeeks();

  useEffect(() => {
    fetchWeeklyEvents(selectedWeek);
  }, [selectedWeek]);

  const fetchWeeklyEvents = async (week: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events?week=${week}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setWeeklyEvents(data);
    } catch (error) {
      setError('Failed to load events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (weekStart: string, eventData: Omit<Event, 'id' | 'slug'>) => {
    try {
      setError('');
      
      if (editingEvent) {
        // Update existing event
        const response = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            weekStart,
            event: { id: editingEvent.id, ...eventData }
          })
        });
        
        if (!response.ok) throw new Error('Failed to update event');
        
        const updatedEvent = await response.json();
        setWeeklyEvents(prev => prev ? {
          ...prev,
          events: prev.events.map(event => 
            event.id === editingEvent.id ? updatedEvent : event
          )
        } : null);
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weekStart, event: eventData })
        });
        
        if (!response.ok) throw new Error('Failed to create event');
        
        const newEvent = await response.json();
        setWeeklyEvents(prev => prev ? {
          ...prev,
          events: [...prev.events, newEvent]
        } : null);
      }
      
      setShowForm(false);
      setEditingEvent(undefined);
    } catch (error) {
      setError(editingEvent ? 'Failed to update event' : 'Failed to create event');
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: selectedWeek, id })
      });
      
      if (!response.ok) throw new Error('Failed to delete event');
      
      setWeeklyEvents(prev => prev ? {
        ...prev,
        events: prev.events.filter(event => event.id !== id)
      } : null);
    } catch (error) {
      setError('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(undefined);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-brand-navy">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-brand-red/10 border-brand-red/20 rounded-lg border px-4 py-3 text-brand-red">
          {error}
        </div>
      )}
      
      {!showForm && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                Weekly Events ({weeklyEvents?.events.length || 0})
              </h2>
              <p className="text-brand-navy/60 text-sm">Manage events by week</p>
            </div>
            
            {/* Week Picker */}
            <div>
              <label className="text-brand-navy/70 mb-1 block text-xs font-medium">
                Select Week:
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="border-brand-navy/20 focus:ring-brand-blue/20 rounded-lg border px-3 py-2 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              >
                {availableWeeks.map(week => (
                  <option key={week.value} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)}>
            Add New Event
          </Button>
        </div>
      )}
      
      {showForm ? (
        <EventForm
          event={editingEvent}
          weekStart={selectedWeek}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <EventsGrid
          events={weeklyEvents?.events || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};