import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Vote, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  BarChart3
} from 'lucide-react';

const VoterHome = ({ events, loading, onEventUpdate }) => {
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    }

    if (now >= startDate && now <= endDate) {
      return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    }

    return { status: 'Ended', color: 'text-red-600', bg: 'bg-red-100' };
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

  const activeEvents = events.filter(event => {
    const status = getEventStatus(event);
    return status.status === 'Active' || status.status === 'Upcoming';
  });

  const endedEvents = events.filter(event => {
    const status = getEventStatus(event);
    return status.status === 'Ended';
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Voting</h1>
        <p className="text-gray-600">
          Participate in active voting events and make your voice heard.
        </p>
      </div>

      {/* Active Events */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Events</h2>
        {activeEvents.length === 0 ? (
          <div className="card text-center py-12">
            <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active events</h3>
            <p className="text-gray-600">There are currently no active voting events.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <div key={event._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                          {status.status}
                        </span>
                        {event.hasVoted && (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Voted
                          </span>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4">{event.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Start: {formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>End: {formatDate(event.endDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{event.teams.length} teams</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Teams:</span>
                        <div className="flex flex-wrap gap-2">
                          {event.teams.map((team, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium rounded"
                              style={{ 
                                backgroundColor: team.color + '20', 
                                color: team.color,
                                border: `1px solid ${team.color}40`
                              }}
                            >
                              {team.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {!event.hasVoted && status.status === 'Active' ? (
                        <Link
                          to={`/event/${event._id}`}
                          className="btn btn-primary"
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          Vote Now
                        </Link>
                      ) : event.hasVoted ? (
                        <Link
                          to={`/event/${event._id}/results`}
                          className="btn btn-secondary"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </Link>
                      ) : (
                        <div className="text-center">
                          <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <span className="text-xs text-gray-600">Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ended Events */}
      {endedEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ended Events</h2>
          <div className="grid gap-6">
            {endedEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <div key={event._id} className="card opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                          {status.status}
                        </span>
                        {event.hasVoted && (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Voted
                          </span>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4">{event.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Start: {formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>End: {formatDate(event.endDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Vote className="h-4 w-4 mr-2" />
                          <span>{event.totalVotes} votes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/event/${event._id}/results`}
                        className="btn btn-secondary"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Results
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Vote className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Voted In</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.hasVoted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-orange-600">{activeEvents.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterHome;
