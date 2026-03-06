import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, MapPin, Phone, Mail, Users, CreditCard, Award, GraduationCap } from 'lucide-react';
import type { ApiRegistration, Registration, Event, Competition } from '../types';
import toast from 'react-hot-toast';
import { fetchEventsByLevel, fetchCompetitionsByEvent, fetchRegistrations as fetchRegistrationsApi } from '../api/api';

const safeJsonParse = (str: string | undefined | null, fallback: any = []) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const transformApiData = (data: ApiRegistration): Registration => ({
  id: data.id,
  teamCode: data.team_code,
  teamName: data.team_name,
  leaderName: data.leader_name || '',
  leaderEmail: data.leader_email || '',
  memberNames: safeJsonParse(data.member_names),
  participantIds: safeJsonParse(data.participant_id),
  status: data.status,
  paymentStatus: data.payment_status,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  competitionId: data.competition_id,
  eventId: data.event_id,
  regionId: data.region_id,
  coachMentorName: data.coach_mentor_name,
  coachMentorOrganization: data.coach_mentor_organization,
  coachMentorPhone: data.coach_mentor_phone,
  coachMentorEmail: data.coach_mentor_email,
  memberAges: safeJsonParse(data.member_ages),
  memberEmails: safeJsonParse(data.member_emails),
  memberPhones: safeJsonParse(data.member_phones),
  memberStates: safeJsonParse(data.member_states),
  memberCities: safeJsonParse(data.member_cities),
  memberZipcodes: safeJsonParse(data.member_zipcodes),
  memberInstitutions: safeJsonParse(data.member_institutions),
  memberTshirtSizes: safeJsonParse(data.member_tshirt_sizes),
  noOfStudents: data.no_of_students,
  paymentId: data.payment_id,
  competitionName: data.competition_name,
  regionName: data.region_name || undefined
});

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="grid grid-cols-8 border-b border-gray-200">
        {[...Array(8)].map((_, j) => (
          <div key={j} className="px-6 py-6">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default function RegistrationList() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Registration>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // New filtration state
  const [levels] = useState(['regional', 'national', 'international']);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchRegistrations();
  }, [selectedCompetitionId]);

  useEffect(() => {
    if (selectedLevel !== 'all') {
      loadEvents(selectedLevel);
    } else {
      setEvents([]);
      setSelectedEventId('all');
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedEventId !== 'all') {
      loadCompetitions(selectedEventId);
    } else {
      setCompetitions([]);
      setSelectedCompetitionId('all');
    }
  }, [selectedEventId]);

  const loadEvents = async (level: string) => {
    try {
      const data = await fetchEventsByLevel(level);
      setEvents(data);
      setSelectedEventId('all');
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const loadCompetitions = async (eventId: number) => {
    try {
      const data = await fetchCompetitionsByEvent(eventId);
      setCompetitions(data);
      setSelectedCompetitionId('all');
    } catch (error) {
      toast.error('Failed to load competitions');
    }
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRegistrationsApi(selectedCompetitionId === 'all' ? undefined : selectedCompetitionId);

      // Handle cases where API returns { message: "..." } instead of an array
      if (Array.isArray(data)) {
        setRegistrations(data.map(transformApiData));
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      setRegistrations([]);
      // Only show error toast if it's a real network/server error, not just "no records"
      if ((error as any).message !== 'No registrations found') {
        toast.error('Failed to fetch registrations');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredAndSortedRegistrations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Team Code', 'Team Name', 'Leader Name', 'Leader Email', 'Status',
      'Payment Status', 'Competition', 'Region', 'Date'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedRegistrations.map(reg => [
        `"${reg.teamCode}"`,
        `"${reg.teamName}"`,
        `"${reg.leaderName}"`,
        `"${reg.leaderEmail}"`,
        `"${reg.status}"`,
        `"${reg.paymentStatus}"`,
        `"${reg.competitionName || ''}"`,
        `"${reg.regionName || ''}"`,
        `"${reg.createdAt.toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export started');
  };

  const handleSort = (field: keyof Registration) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const downloadRegistrationData = (registration: Registration) => {
    const data = {
      ...registration,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registration-${registration.teamCode}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: Registration['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'confirmed': return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'rejected': return 'bg-red-100 text-red-800 ring-red-600/20';
      default: return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    }
  };

  const getPaymentStatusColor = (status: Registration['paymentStatus']) => {
    return status === 'paid'
      ? 'bg-green-100 text-green-800 ring-green-600/20'
      : 'bg-red-100 text-red-800 ring-red-600/20';
  };

  const filteredAndSortedRegistrations = registrations
    .filter(reg => {
      const matchesSearch =
        reg.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.teamCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.leaderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.coachMentorName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || reg.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle potential undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

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
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              Team Registrations
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {filteredAndSortedRegistrations.length} total
              </span>
            </h1>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 w-5 h-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Search teams, codes, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-sm"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Level Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-sm capitalize"
              >
                <option value="all">All Levels</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Event Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                disabled={selectedLevel === 'all'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="all">All Events</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>

            {/* Competition Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Competition
              </label>
              <select
                value={selectedCompetitionId}
                onChange={(e) => setSelectedCompetitionId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                disabled={selectedEventId === 'all'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="all">All Competitions</option>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
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
                  <th
                    onClick={() => handleSort('teamCode')}
                    className="group px-6 py-3 text-left cursor-pointer transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                        Team Code
                      </span>
                      <SortIcon field="teamCode" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('teamName')}
                    className="group px-6 py-3 text-left cursor-pointer transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                        Team Name
                      </span>
                      <SortIcon field="teamName" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="group px-6 py-3 text-left cursor-pointer transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                        Date
                      </span>
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRegistrations.map((registration) => (
                  <React.Fragment key={registration.id}>
                    <tr
                      onClick={() => setSelectedRow(selectedRow === registration.id ? null : registration.id)}
                      className={`
                        transition-colors cursor-pointer
                        ${selectedRow === registration.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-l-4 border-transparent hover:border-indigo-500">
                        {registration.teamCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {registration.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{registration.leaderName || 'N/A'}</div>
                          <div className="text-gray-500">{registration.leaderEmail || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20">
                          {registration.noOfStudents || registration.memberNames?.length || 0} members
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(registration.status)}`}>
                          {(registration.status === 'approved' || registration.status === 'confirmed') && <CheckCircle className="w-4 h-4 mr-1" />}
                          {registration.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                          {registration.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getPaymentStatusColor(registration.paymentStatus)}`}>
                          {registration.paymentStatus === 'paid' ?
                            <CheckCircle className="w-4 h-4 mr-1" /> :
                            <Clock className="w-4 h-4 mr-1" />}
                          {registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadRegistrationData(registration);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 hover:bg-indigo-50 rounded-full inline-block"
                          title="Download registration data"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW DETAIL VIEW */}
                    {selectedRow === registration.id && (
                      <tr className="bg-indigo-50/20">
                        <td colSpan={8} className="p-0 border-b-2 border-indigo-100">
                          <div className="px-6 py-8 animate-fade-in text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                              {/* Competition & Event Info */}
                              <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                  <Award className="w-5 h-5 text-indigo-500" /> Event Details
                                </h3>
                                <div className="space-y-2">
                                  {registration.competitionName && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Competition:</span>
                                      <span className="font-medium text-gray-900 text-right">{registration.competitionName}</span>
                                    </div>
                                  )}
                                  {registration.regionName && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Region:</span>
                                      <span className="font-medium text-gray-900 text-right">{registration.regionName}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Registration Date:</span>
                                    <span className="font-medium text-gray-900">{registration.createdAt.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Payment Details */}
                                <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mt-6 flex items-center gap-2">
                                  <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Information
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="font-medium text-gray-900">{registration.paymentStatus.toUpperCase()}</span>
                                  </div>
                                  {registration.paymentId && (
                                    <div className="flex justify-between truncate gap-4">
                                      <span className="text-gray-500">Transaction ID:</span>
                                      <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded truncate">{registration.paymentId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Mentor / Coach Info */}
                              <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                  <GraduationCap className="w-5 h-5 text-indigo-500" /> Coach / Mentor Info
                                </h3>
                                {registration.coachMentorName ? (
                                  <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <div>
                                      <span className="block text-xs text-gray-500 font-medium tracking-wide uppercase">Full Name</span>
                                      <span className="font-semibold text-gray-900">{registration.coachMentorName}</span>
                                    </div>
                                    {registration.coachMentorOrganization && (
                                      <div>
                                        <span className="block text-xs text-gray-500 font-medium tracking-wide uppercase">Organization</span>
                                        <span className="text-gray-700 flex items-center gap-1"><MapPin className="w-3 h-3" /> {registration.coachMentorOrganization}</span>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-50">
                                      {registration.coachMentorPhone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="w-4 h-4 text-gray-400" />
                                          <a href={`tel:${registration.coachMentorPhone}`} className="hover:text-indigo-600 transition-colors">{registration.coachMentorPhone}</a>
                                        </div>
                                      )}
                                      {registration.coachMentorEmail && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Mail className="w-4 h-4 text-gray-400" />
                                          <a href={`mailto:${registration.coachMentorEmail}`} className="hover:text-indigo-600 transition-colors truncate">{registration.coachMentorEmail}</a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 italic py-2">No coach or mentor specified.</p>
                                )}
                              </div>

                              {/* Members Info */}
                              <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-indigo-500" /> Team Members ({registration.noOfStudents || registration.memberNames?.length || 0})
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                  {registration.memberNames && registration.memberNames.length > 0 ? (
                                    registration.memberNames.map((name, idx) => (
                                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="font-medium text-gray-900">{name}</span>
                                          {registration.participantIds?.[idx] && (
                                            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                              {registration.participantIds[idx]}
                                            </span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 mt-2">
                                          {registration.memberAges?.[idx] && <div><span className="text-gray-400">Age:</span> {registration.memberAges[idx]}</div>}
                                          {registration.memberTshirtSizes?.[idx] && <div><span className="text-gray-400">T-Shirt:</span> {registration.memberTshirtSizes[idx]}</div>}
                                          {registration.memberPhones?.[idx] && <div className="col-span-2 truncate"><span className="text-gray-400">Phone:</span> {registration.memberPhones[idx]}</div>}
                                          {registration.memberEmails?.[idx] && <div className="col-span-2 truncate"><span className="text-gray-400">Email:</span> {registration.memberEmails[idx]}</div>}

                                          {(registration.memberCities?.[idx] || registration.memberStates?.[idx]) && (
                                            <div className="col-span-2 text-gray-500 flex items-center gap-1 mt-1">
                                              <MapPin className="w-3 h-3" />
                                              {[registration.memberCities?.[idx], registration.memberStates?.[idx], registration.memberZipcodes?.[idx]].filter(Boolean).join(', ')}
                                            </div>
                                          )}
                                          {registration.memberInstitutions?.[idx] && (
                                            <div className="col-span-2 text-indigo-600 flex items-center gap-1 mt-0.5 font-medium">
                                              <GraduationCap className="w-3 h-3" />
                                              {registration.memberInstitutions[idx]}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 italic py-2">No member details available.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && filteredAndSortedRegistrations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No registrations found</p>
              <p className="text-gray-400 text-sm text-center">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}