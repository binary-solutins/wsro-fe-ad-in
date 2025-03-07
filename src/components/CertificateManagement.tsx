import { useState, useEffect } from 'react';
import { Search, Send, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiRegistration, Registration } from '../types/registrations';
import { transformApiData } from '../utils/transformer';
import { TableSkeleton } from './TableSkelaton';

export default function CertificateManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<keyof Registration>('teamName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [events, setEvents] = useState<Array<{ id: number; title: string; level: string }>>([]);

  const levels = ['regionalal', 'national', 'international'];

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (selectedLevel) {
      fetchEvents(selectedLevel);
    }
  }, [selectedLevel]);

  const fetchEvents = async (level: string) => {
    try {
      const response = await fetch(`https://wsro-backend.onrender.com/api/events/level/${level}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/registrations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch registrations');
      const data: ApiRegistration[] = await response.json();
      setRegistrations(data.map(transformApiData));
    } catch (error) {
      toast.error('Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Registration) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleTeamSelection = (id: number) => {
    const newSelection = new Set(selectedTeams);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTeams(newSelection);
  };

  const selectAll = () => {
    if (selectedTeams.size === registrations.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(registrations.map(reg => reg.id)));
    }
  };

  const generateCertificates = async () => {
    if (selectedTeams.size === 0) {
      toast.error('Please select at least one team');
      return;
    }

    setIsGenerating(true);
    try {
      const teamCodes = Array.from(selectedTeams).map(id => {
        const registration = registrations.find(reg => reg.id === id);
        return registration ? registration.teamCode : null;
      }).filter(code => code !== null);

      const response = await fetch('https://wsro-backend.onrender.com/api/competitions/sent-team-certificates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_codes: teamCodes
        })
      });

      if (!response.ok) throw new Error('Failed to generate certificates');
      
      toast.success('Certificates generated successfully');
      fetchRegistrations();
      setSelectedTeams(new Set());
    } catch (error) {
      toast.error('Failed to generate certificates');
    } finally {
      setIsGenerating(false);
    }
  };


  const filteredAndSortedRegistrations = registrations
    .filter(reg => {
      const matchesSearch = 
        reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.teamCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = selectedEvent ? reg.event_id === selectedEvent : true;
   
      
      return matchesSearch && matchesEvent;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });


  const SortIcon = ({ field }: { field: keyof Registration }) => {
    if (sortField !== field) return <Filter className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-indigo-600" /> : 
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[98rem] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
          <p className="mt-1 text-sm text-gray-500">Generate and manage certificates for registered teams</p>
        </div>

        <div className="flex flex-col w-full lg:w-auto space-y-4 lg:space-y-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4">
            {/* Filter Section */}
            <div className="flex flex-row gap-2 sm:col-span-2 lg:col-span-1">
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedEvent(null);
                }}
                className="w-full sm:w-40 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(Number(e.target.value) || null)}
                className="w-full sm:w-48 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!selectedLevel}
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Section */}
            <div className="relative flex-grow lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCertificates}
              disabled={isGenerating || selectedTeams.size === 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Send className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Certificates'}
            </button>
          </div>
        </div>
      </div>


      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTeams.size === registrations.length}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('teamCode')}
                    className="group px-6 py-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Code
                      </span>
                      <SortIcon field="teamCode" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('teamName')}
                    className="group px-6 py-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Name
                      </span>
                      <SortIcon field="teamName" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTeams.has(registration.id)}
                        onChange={() => toggleTeamSelection(registration.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {registration.teamCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {registration.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {registration.competitionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {registration.memberNames.length} members
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!isLoading && filteredAndSortedRegistrations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No teams found</p>
              <p className="text-gray-400 text-sm text-center">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}