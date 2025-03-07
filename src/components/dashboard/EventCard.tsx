import React from 'react';
import { Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
  name: string;
  date: string;
  participants: number;
}

export default function EventCard({ name, date, participants }: EventCardProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex flex-col items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-medium">
          {formattedDate.split(' ')[0]}
          <span className="text-sm">{formattedDate.split(' ')[1]}</span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{participants} participants</span>
          </div>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
    </div>
  );
}