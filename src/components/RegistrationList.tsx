import { useState, useEffect } from 'react';
import { Search, Download, Filter, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { ApiRegistration, Registration } from '../types';
import toast from 'react-hot-toast';

const transformApiData = (data: ApiRegistration): Registration => ({
  id: data.id,
  teamCode: data.team_code,
  teamName: data.team_name,
  leaderName: data.leader_name,
  leaderEmail: data.leader_email,
  memberNames: JSON.parse(data.member_names),
  participantIds: JSON.parse(data.participant_id),
  status: data.status,
  paymentStatus: data.payment_status,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at)
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
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
        reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.teamCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || reg.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Team Registrations
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {filteredAndSortedRegistrations.length} total
          </span>
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 w-5 h-5 transition-colors" />
            <input
              type="text"
              placeholder="Search by team, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow hover:bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow hover:bg-gray-50"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
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
                  <tr 
                    key={registration.id}
                    onClick={() => setSelectedRow(selectedRow === registration.id ? null : registration.id)}
                    className={`
                      transition-colors cursor-pointer
                      ${selectedRow === registration.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {registration.teamCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {registration.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{registration.leaderName}</div>
                        <div className="text-gray-500">{registration.leaderEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20">
                        {registration.memberNames.length} members
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(registration.status)}`}>
                        {registration.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
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
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 hover:bg-indigo-50 rounded-full"
                        title="Download registration data"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
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