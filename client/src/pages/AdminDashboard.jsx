import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, AlertCircle, TrendingUp, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedMentors: 0,
    pendingMentors: 0,
    totalBookings: 0,
    openIssues: 0,
    totalCategories: 0,
  });
  const [allMentors, setAllMentors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [remarksModal, setRemarksModal] = useState({ open: false, issueId: null, remarks: '' });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data for the dashboard
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, mentorsRes, issuesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/all-mentors?status=pending'),
        api.get('/issues'),
      ]);

      setStats(statsRes.data.data || stats);
      setPendingMentors(mentorsRes.data.data || []);
      setIssues(issuesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Approve a mentor
  const handleApproveMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/approve/${mentorId}`);
      toast('Mentor approved successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error approving mentor:', error);
      toast(error.response?.data?.message || 'Failed to approve mentor', 'error');
    }
  };

  // Reject a mentor
  const handleRejectMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/reject/${mentorId}`);
      toast('Mentor request rejected', 'success');
      fetchData();
    } catch (error) {
      console.error('Error rejecting mentor:', error);
      toast('Failed to reject mentor', 'error');
    }
  };

  // Filter mentors based on search term and status
  const filteredMentors = pendingMentors.filter((mentor) => {
    if (!searchTerm) return true;
    return (
      mentor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills?.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.categories?.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
                <p className="text-neutral-600">Manage mentor approvals and platform issues</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Pending Approvals</p>
                    <p className="text-3xl font-bold">{stats.pendingMentors || 0}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Open Issues</p>
                    <p className="text-3xl font-bold">{stats.openIssues || 0}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Open Issues</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Total Mentors</p>
                    <p className="text-3xl font-bold">{stats.approvedMentors || 0}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-neutral-200 mb-6">
            {['overview', 'requests', 'issues'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 font-medium transition ${
                  activeTab === tab ? 'text-primary-600' : 'text-neutral-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              {/* Add overview content here */}
            </div>
          )}

          {activeTab === 'requests' && (
            <Card>
              <CardHeader>
                <CardTitle>Mentor Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                    <Input
                      placeholder="Search by name, title, or expertise..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          filterStatus === status
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mentor List */}
                <div className="space-y-4">
                  {filteredMentors.length === 0 ? (
                    <p className="text-center text-neutral-600 py-8">No mentor requests found</p>
                  ) : (
                    filteredMentors.map((mentor) => (
                      <motion.div
                        key={mentor._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-lg">{mentor.user?.name}</p>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                Pending
                              </span>
                            </div>
                            <p className="text-neutral-600 mb-3">{mentor.title}</p>
                            <p className="text-neutral-500 text-sm mb-3">{mentor.email || mentor.user?.email}</p>
                            
                            {/* Skills/Expertise */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(mentor.expertise || []).slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Bio */}
                            <p className="text-sm text-neutral-600">
                              <strong>Bio:</strong> {mentor.bio?.substring(0, 100)}...
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveMentor(mentor._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Mentor
                          </Button>
                          <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleRejectMentor(mentor._id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Request
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'issues' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Issues</h2>
              {/* Issues content */}
            </div>
          )}
        </div>
      </div>

      {/* Remarks Modal */}
      {remarksModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Remarks</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[120px]"
              placeholder="Enter remarks..."
              value={remarksModal.remarks}
              onChange={(e) => setRemarksModal({ ...remarksModal, remarks: e.target.value })}
            />
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddRemarks}
              >
                Save Remarks
              </Button>
              <Button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => setRemarksModal({ open: false, issueId: null, remarks: '' })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;