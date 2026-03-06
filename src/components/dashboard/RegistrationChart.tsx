import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Registration {
  created_at: string;
}

interface DataPoint {
  date: string;
  registrations: number;
}

const RegistrationChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://wsroapi.softarotechnolabs.com/api/admin/registrations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const registrations = response.data;
        const dateGroups = registrations.reduce((acc: { [key: string]: number }, reg: Registration) => {
          const date = new Date(reg.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(dateGroups)
          .map(([date, count]) => ({
            date,
            registrations: count,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setData(chartData);
        setLoading(false);
      } catch (err) {
        setError('Currently No Registrations Found !');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          formatter={(value: number) => [`${value} registrations`, 'Registrations']}
          labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="registrations"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RegistrationChart;