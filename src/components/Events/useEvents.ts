import { useState, useCallback, useEffect } from 'react';
import { Event } from './types';
import toast from 'react-hot-toast';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://wsro-backend.onrender.com/api/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvent = useCallback(async (event: Event) => {
    const response = await fetch('https://wsro-backend.onrender.com/api/events/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    toast.success('Event created successfully');
    return response.json();
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const response = await fetch(`https://wsro-backend.onrender.com/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    toast.success('Event deleted successfully');
    return response.json();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    fetchEvents,
    addEvent,
    deleteEvent,
  };
}