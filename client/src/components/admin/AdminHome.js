import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Vote, 
  TrendingUp, 
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const AdminHome = ({ stats, loading }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-600">
          Manage your voting events, track results, and oversee voter participation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{stats.stats.activeEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats.totalVoters}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Vote className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.stats.totalVotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Plus className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create New Event</h3>
              <p className="text-sm text-gray-600">Set up a new voting event</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manage Events</h3>
              <p className="text-sm text-gray-600">View and edit existing events</p>
            </div>
          </Link>

          <Link
            to="/admin/voters"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Users className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Voter Management</h3>
              <p className="text-sm text-gray-600">Manage voter accounts</p>
            </div>
          </Link>

          <Link
            to="/admin/stats"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View Statistics</h3>
              <p className="text-sm text-gray-600">Analyze voting patterns</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h2>
          {stats.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </p>
                  </div>
                  <Link
                    to={`/admin/events/${event._id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent events</p>
          )}
        </div>

        {/* Recent Votes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Votes</h2>
          {stats.recentVotes && stats.recentVotes.length > 0 ? (
            <div className="space-y-3">
              {stats.recentVotes.map((vote) => (
                <div key={vote._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{vote.voter.name}</h3>
                    <p className="text-sm text-gray-600">
                      Voted for {vote.team} in {vote.event.name}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {formatDate(vote.votedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent votes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
