import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Mail,
  Clock,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VoterManagement = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const response = await axios.get('/api/admin/voters');
      setVoters(response.data.voters);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast.error('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (voterId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/voters/${voterId}/verify`, {
        isVerified: !currentStatus
      });
      
      toast.success(`Voter ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      fetchVoters(); // Refresh the list
    } catch (error) {
      console.error('Error updating voter:', error);
      toast.error('Failed to update voter status');
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

  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const verifiedVoters = filteredVoters.filter(voter => voter.isVerified);
  const unverifiedVoters = filteredVoters.filter(voter => !voter.isVerified);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading voters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voter Management</h1>
        <p className="text-gray-600">Manage voter accounts and verification status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">{voters.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">
                {voters.filter(v => v.isVerified).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <XCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unverified</p>
              <p className="text-2xl font-bold text-orange-600">
                {voters.filter(v => !v.isVerified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search voters by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Voter Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Voters */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Verified Voters</h3>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {verifiedVoters.length}
            </span>
          </div>

          {verifiedVoters.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No verified voters found</p>
          ) : (
            <div className="space-y-3">
              {verifiedVoters.map((voter) => (
                <div key={voter._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{voter.name}</h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {voter.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Joined {formatDate(voter.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleVerification(voter._id, voter.isVerified)}
                    className="btn btn-secondary text-sm"
                  >
                    Unverify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unverified Voters */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Unverified Voters</h3>
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              {unverifiedVoters.length}
            </span>
          </div>

          {unverifiedVoters.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No unverified voters found</p>
          ) : (
            <div className="space-y-3">
              {unverifiedVoters.map((voter) => (
                <div key={voter._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-orange-600 mr-2" />
                      <h4 className="font-medium text-gray-900">{voter.name}</h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {voter.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Joined {formatDate(voter.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleVerification(voter._id, voter.isVerified)}
                    className="btn btn-primary text-sm"
                  >
                    Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Voters Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Voters</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVoters.map((voter) => (
                <tr key={voter._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voter.isVerified ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-orange-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {voter.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {voter.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(voter.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleVerification(voter._id, voter.isVerified)}
                      className={`btn text-sm ${
                        voter.isVerified ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {voter.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoterManagement;
