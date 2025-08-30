import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Vote, 
  ArrowLeft,
  Clock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EventStats = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinEvent } = useSocket();

  useEffect(() => {
    fetchEventStats();
    if (socket) {
      joinEvent(eventId);
    }
  }, [eventId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('vote-cast', handleVoteUpdate);
      return () => {
        socket.off('vote-cast', handleVoteUpdate);
      };
    }
  }, [socket]);

  const fetchEventStats = async () => {
    try {
      const response = await axios.get(`/api/admin/events/${eventId}`);
      setEventData(response.data);
    } catch (error) {
      console.error('Error fetching event stats:', error);
      toast.error('Failed to load event statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (data) => {
    if (data.eventId === eventId) {
      fetchEventStats(); // Refresh data
      toast.success(`New vote cast for ${data.team}!`);
    }
  };

  const copyVotingUrl = () => {
    const url = `${window.location.origin}/vote/${eventData.event.votingUrl}`;
    navigator.clipboard.writeText(url);
    toast.success('Voting URL copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (!event.isActive) {
      return { status: 'Inactive', color: 'text-gray-500', bg: 'bg-gray-100' };
    }

    if (now < startDate) {
      return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    }

    if (now >= startDate && now <= endDate) {
      return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    }

    return { status: 'Ended', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
        <Link to="/admin/events" className="btn btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </div>
    );
  }

  const { event, voteStats, voterList, totalVotes } = eventData;
  const status = getEventStatus(event);

  // Chart data
  const pieData = {
    labels: voteStats.map(stat => stat.name),
    datasets: [
      {
        data: voteStats.map(stat => stat.votes),
        backgroundColor: voteStats.map(stat => stat.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barData = {
    labels: voteStats.map(stat => stat.name),
    datasets: [
      {
        label: 'Votes',
        data: voteStats.map(stat => stat.votes),
        backgroundColor: voteStats.map(stat => stat.color),
        borderColor: voteStats.map(stat => stat.color),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            const percentage = totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(1) : 0;
            return `${label}: ${value} votes (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/events"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-600">Voting Statistics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.bg} ${status.color}`}>
            {status.status}
          </span>
          <button
            onClick={copyVotingUrl}
            className="btn btn-secondary text-sm"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy URL
          </button>
          <Link
            to={`/vote/${event.votingUrl}`}
            target="_blank"
            className="btn btn-primary text-sm"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Voting
          </Link>
        </div>
      </div>

      {/* Event Info */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
            {event.description && (
              <p className="text-gray-600 mb-4">{event.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Start: {formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>End: {formatDate(event.endDate)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Votes</span>
                <span className="font-semibold text-lg">{totalVotes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teams</span>
                <span className="font-semibold">{event.teams.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Voters</span>
                <span className="font-semibold">{voterList.length}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voting URL</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-mono break-all">
                {window.location.origin}/vote/{event.votingUrl}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Distribution</h3>
          <div className="h-80">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Count</h3>
          <div className="h-80">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Vote Statistics Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voteStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{stat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.votes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voter List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voter List</h3>
        {voterList.length === 0 ? (
          <p className="text-gray-600">No votes cast yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voted For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {voterList.map((vote, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vote.voterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vote.voterEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{ 
                          backgroundColor: voteStats.find(s => s.name === vote.team)?.color + '20',
                          color: voteStats.find(s => s.name === vote.team)?.color
                        }}
                      >
                        {vote.team}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(vote.votedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStats;
