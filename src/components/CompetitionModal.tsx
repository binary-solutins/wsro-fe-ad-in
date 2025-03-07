import React, { useState, useEffect } from 'react';
import { X, Trophy, MapPin, Calendar, Users, DollarSign, Scroll, Clock, LucideIcon } from 'lucide-react';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  level: string;
}

interface Competition {
  name: string;
  level: 'regional' | 'National' | 'International';
  date: string;
  venue: string;
  registration_deadline: string;
  maximum_teams: number;
  fees: string; // Changed from number to string
  rules: string;
  pdf: string;
  zip: string;
  event_id?: number;
}

interface CompetitionModalProps {
  competition: Competition | null;
  onClose: () => void;
  onSave: (competition: Competition) => void;
}

// Internal Components
const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-white" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const LevelBadge = ({ level }: { level: Competition['level'] }) => {
  const levelColors = {
    regional: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    National: 'bg-blue-50 text-blue-700 border-blue-200',
    International: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className="flex justify-center -mt-10 mb-6">
      <div className={`inline-flex items-center gap-2 py-2 px-4 border-2 rounded-lg shadow-sm ${levelColors[level]}`}>
        <Trophy className="w-4 h-4" />
        <span className="font-semibold">{level} Competition</span>
      </div>
    </div>
  );
};

const FormField = ({ 
  label, 
  icon: Icon, 
  children,
  className = '' 
}: { 
  label: string; 
  icon?: LucideIcon; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </label>
    {children}
  </div>
);

const CompetitionForm = ({ 
  formData, 
  setFormData 
}: { 
  formData: Competition; 
  setFormData: React.Dispatch<React.SetStateAction<Competition>>; 
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false); // Loader state

  const fetchEvents = async (level: string) => {
    try {
      const response = await axios.get(`https://wsro-backend.onrender.com/api/events/level/${level.toLowerCase()}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (formData.level) {
      fetchEvents(formData.level);
    }
  }, [formData.level]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maximum_teams' ? Number(value) : value, // Keep fees as string
      ...(name === 'fees' ? { fees: value } : {}), // Set fees as string
      ...(name === 'level' ? { event_id: undefined } : {})
    }));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, pdf: file }));
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, zip: file }));
    }
  };

  const inputClasses = "w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Competition Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="Enter competition name"
          />
        </FormField>

        <FormField label="Competition Level">
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
            className={inputClasses}
          >
            <option value="regional">regional</option>
            <option value="National">National</option>
            <option value="International">International</option>
          </select>
        </FormField>

        <FormField label="Select Event" className={events.length > 0 ? '' : 'hidden'}>
          <select
            name="event_id"
            value={formData.event_id || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, event_id: Number(e.target.value) }))}
            required
            className={inputClasses}
          >
            <option value="">Select an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Event Date" icon={Calendar}>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </FormField>

        <FormField label="Venue" icon={MapPin}>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="Enter venue location"
          />
        </FormField>

        <FormField label="Registration Deadline" icon={Clock}>
          <input
            type="date"
            name="registration_deadline"
            value={formData.registration_deadline}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </FormField>

        <FormField label="Maximum Teams" icon={Users}>
          <input
            type="number"
            name="maximum_teams"
            value={formData.maximum_teams}
            onChange={handleChange}
            required
            min="0"
            className={inputClasses}
            placeholder="Enter maximum number of teams"
          />
        </FormField>

        <FormField label="Registration Fee ($)" icon={DollarSign}>
          <input
            type="text" // Changed from number to text
            name="fees"
            value={formData.fees}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className={inputClasses}
            placeholder="Enter registration fee"
          />
        </FormField>
      </div>

      <FormField label="Competition Summary" icon={Scroll}>
        <textarea
          name="rules"
          value={formData.rules}
          onChange={handleChange}
          rows={4}
          className={`${inputClasses} resize-none`}
          placeholder="Enter competition summary"
        />
      </FormField>

      <FormField label="Rules PDF">
        <input
          type="file"
          onChange={handlePdfChange}
          accept=".pdf"
          className={inputClasses}
        />
      </FormField>

      <FormField label="Additional Document (ZIP)">
        <input
          type="file"
          onChange={handleZipChange}
          accept=".zip"
          className={inputClasses}
        />
      </FormField>
    </div>
  );
};

// Main Component
export default function CompetitionModal({ competition, onClose, onSave }: CompetitionModalProps) {
  const [formData, setFormData] = useState<Competition>({
    name: competition?.name || '',
    level: competition?.level || 'regionalal',
    date: competition?.date ? new Date(competition.date).toISOString().split('T')[0] : '',
    venue: competition?.venue || '',
    registration_deadline: competition?.registration_deadline 
      ? new Date(competition.registration_deadline).toISOString().split('T')[0] 
      : '',
    maximum_teams: competition?.maximum_teams || 0,
    fees: competition?.fees.toString() || '', // Ensure fees is a string
    rules: competition?.rules || '',
    pdf: competition?.pdf || '',
    zip: competition?.zip || '',
    event_id: competition?.event_id
  });

  const [loading, setLoading] = useState(false); // Loader state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading
    await onSave(formData);
    setLoading(false); // Stop loading
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
        <div className="relative">
          <ModalHeader 
            title={competition ? 'Edit Competition' : 'New Competition'} 
            onClose={onClose} 
          />
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <LevelBadge level={formData.level} />
            <CompetitionForm 
              formData={formData} 
              setFormData={setFormData}
            />
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                disabled={loading} // Disable button while loading
              >
                {loading ? 'Saving...' : (competition ? 'Update Competition' : 'Create Competition')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}