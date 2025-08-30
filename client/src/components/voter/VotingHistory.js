import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Vote, 
  Calendar, 
  Clock,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VotingHistory = () => {
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    try {
      const response = await axios.get('/api/voter/history');
      setVotingHistory(response.data.votingHistory);
    } catch (error) {
      console.error('Error fetching voting history:', error);
      toast.error('Failed to load voting history');
    } finally {
      setLoading(false);
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

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    }

    if (now >= start && now <= end) {
      return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    }

    return { status: 'Ended', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading voting history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voting History</h1>
        <p className="text-gray-600">View your past voting activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{votingHistory.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Vote className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">
                {votingHistory.filter(vote => {
                  const status = getEventStatus(vote.eventStartDate, vote.eventEndDate);
                  return status.status === 'Active';
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ended Events</p>
              <p className="text-2xl font-bold text-orange-600">
                {votingHistory.filter(vote => {
                  const status = getEventStatus(vote.eventStartDate, vote.eventEndDate);
                  return status.status === 'Ended';
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting History List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Votes</h2>
        
        {votingHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voting history</h3>
            <p className="text-gray-600">You haven't participated in any voting events yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {votingHistory.map((vote, index) => {
              const status = getEventStatus(vote.eventStartDate, vote.eventEndDate);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{vote.eventName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                          {status.status}
                        </span>
                      </div>
                      
                      {vote.eventDescription && (
                        <p className="text-gray-600 mb-3">{vote.eventDescription}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Event: {formatDate(vote.eventStartDate)} - {formatDate(vote.eventEndDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Vote className="h-4 w-4 mr-2" />
                          <span>Voted for: <strong>{vote.team}</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Voted at: {formatDate(vote.votedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/event/${vote.eventId}/results`}
                        className="btn btn-secondary text-sm"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Results
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      {votingHistory.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {votingHistory.slice(0, 5).map((vote, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Vote className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Voted for <strong>{vote.team}</strong> in <strong>{vote.eventName}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(vote.votedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingHistory;
