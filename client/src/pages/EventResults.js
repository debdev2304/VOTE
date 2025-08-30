import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Clock, 
  Vote,
  TrendingUp
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
import { useSocket } from '../contexts/SocketContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EventResults = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinEvent } = useSocket();

  useEffect(() => {
    fetchResults();
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

  const fetchResults = async () => {
    try {
      const response = await axios.get(`/api/voter/events/${eventId}/results`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (data) => {
    if (data.eventId === eventId) {
      fetchResults(); // Refresh results
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Results Not Available</h2>
          <p className="text-gray-600 mb-4">The results for this event are not available.</p>
          <button
            onClick={() => navigate('/voter')}
            className="btn btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { event, voteStats, totalVotes } = results;

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

  // Find winner
  const winner = voteStats.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/voter')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600">Voting Results</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-primary-600 font-medium">Live Results</span>
          </div>
        </div>

        {/* Event Info */}
        <div className="card mb-8">
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
                  <span className="font-semibold">{voteStats.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${event.isCurrentlyActive ? 'text-green-600' : 'text-red-600'}`}>
                    {event.isCurrentlyActive ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Leader</h3>
              {totalVotes > 0 ? (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: winner.color }}
                    ></div>
                    <h4 className="font-semibold text-gray-900">{winner.name}</h4>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {winner.votes} votes
                  </div>
                  <div className="text-sm text-gray-600">
                    {winner.percentage}% of total votes
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No votes cast yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* Detailed Results Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
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
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {voteStats
                  .sort((a, b) => b.votes - a.votes)
                  .map((stat, index) => (
                    <tr key={index} className={index === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <TrendingUp className="h-4 w-4 text-yellow-600 mr-2" />
                          )}
                          <span className={`font-medium ${index === 0 ? 'text-yellow-800' : 'text-gray-900'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              backgroundColor: stat.color,
                              width: `${stat.percentage}%`
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Updates Notice */}
        {event.isCurrentlyActive && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Live Updates</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Results are updating in real-time as votes are cast. Refresh the page to see the latest results.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventResults;
