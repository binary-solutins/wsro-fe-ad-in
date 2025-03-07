import {
  Trophy,
  Users,
  CreditCard,
  ScrollText,
  TrendingUp,
  Calendar,
  Plus,
  FunctionSquare,
  MessageCircle,
} from "lucide-react";
import StatCard from "./StatCard";
import EventCard from "./EventCard";
import RegistrationChart from "./RegistrationChart";
import { useEffect, useState } from "react";
import {
  fetchCompetitions,
  fetchEvents,
  fetchInquiries,
  fetchRegistrations,
} from "../../api/api";

export default function Dashboard() {
  const [compData, setCompData] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(null);
  const [pendingInquery, setPendingInquery] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  useEffect(() => {
    getCardDetails();
  });
  const getCardDetails = async () => {
    let res1 = await fetchCompetitions();
    let active_comp = res1
      .filter((item) => item.is_active === 1)
      .map((item) => {
        return item;
      });
    setCompData(active_comp.length);

    const res2 = await fetchRegistrations();
    let totalregi = res2.length;
    setTotalRegistrations(totalregi);

    const res3 = await fetchEvents();
    let totalEvent = res3.length;
    setTotalEvents(totalEvent);

    const res4 = await fetchInquiries();
    let pendingInqueries = res4.filter((item) => item.is_resolved == 0);
    setPendingInquery(pendingInqueries.length);
  };

  const stats = [
    {
      title: "Active Competitions",
      value: compData,
      icon: Trophy,
      color: "bg-purple-500",
    },
    {
      title: "Total Registrations",
      value: totalRegistrations || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Events",
      value: totalEvents,
      icon: FunctionSquare,
      color: "bg-green-500",
    },
    {
      title: "Pending Inquery",
      value: pendingInquery,
      icon: MessageCircle,
      color: "bg-yellow-500",
    },
  ];

  const upcomingEvents = [
    {
      name: "regionalal Finals - North",
      date: "2024-04-15",
      participants: 120,
    },
    { name: "National Championship", date: "2024-05-01", participants: 500 },
    { name: "International Summit", date: "2024-06-15", participants: 1000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your competition metrics and upcoming events
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow group">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="font-medium">Add Competition</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Registration Trends
              </h2>
              <p className="text-sm text-gray-500">
                Monthly registration statistics
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <RegistrationChart />
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h2>
              <p className="text-sm text-gray-500">Next 30 days schedule</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.name} {...event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
