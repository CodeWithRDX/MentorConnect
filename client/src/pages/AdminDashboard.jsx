import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, UserCheck, AlertCircle, TrendingUp, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedMentors: 0,
    pendingMentors: 0,
    totalBookings: 0,
  });
  const [pendingMentors, setPendingMentors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, mentorsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: stats } })),
        api.get('/mentors?isApproved=false').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data || stats);
      setPendingMentors(mentorsRes.data.data || []);
      
      // Mock issues data
      setIssues([
        {
          _id: 1,
          title: 'Payment not processed',
          description: 'I booked a session 3 days ago but the payment is still showing as pending.',
          user: 'Alex Thompson (entrepreneur)',
          priority: 'High Priority',
          status: 'Open',
          type: 'payment',
          date: '12/4/2025',
        },
        {
          _id: 2,
          title: 'Unable to access video call',
          description: 'Technical issue preventing access to the video call feature.',
          user: 'Sarah Chen (mentor)',
          priority: 'High Priority',
          status: 'In Progress',
          type: 'technical',
          date: '12/3/2025',
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/approve/${mentorId}`);
      toast('Mentor approved successfully', 'success');
      fetchData();
    } catch (error) {
      toast('Failed to approve mentor', 'error');
    }
  };

  const handleRejectMentor = async (mentorId) => {
    try {
      await api.put(`/admin/mentor/reject/${mentorId}`);
      toast('Mentor request rejected', 'success');
      fetchData();
    } catch (error) {
      toast('Failed to reject mentor', 'error');
    }
  };

  const filteredMentors = pendingMentors.filter(mentor => {
    if (filterStatus !== 'All' && mentor.status !== filterStatus) return false;
    if (!searchTerm) return true;
    return (
      mentor.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Button className="bg-primary-600">Admin Panel</Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Pending Approvals</p>
                      <p className="text-3xl font-bold">{stats.pendingMentors || 0}</p>
                    </div>
                    <div className="relative">
                      <Users className="h-10 w-10 text-blue-600" />
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {stats.pendingMentors || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">High Priority Issues</p>
                      <p className="text-3xl font-bold">2</p>
                    </div>
                    <div className="relative">
                      <AlertCircle className="h-10 w-10 text-red-600" />
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Open Issues</p>
                      <p className="text-3xl font-bold">3</p>
                    </div>
                    <AlertCircle className="h-10 w-10 text-yellow-600 bg-yellow-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Total Mentors</p>
                      <p className="text-3xl font-bold">512</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600 bg-green-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex gap-4 border-b border-neutral-200 mb-6">
              {['overview', 'requests', 'issues'].map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-4 font-medium transition relative ${
                    activeTab === tab
                      ? 'text-primary-600'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                  )}
                  {tab === 'requests' && (
                    <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.pendingMentors}
                    </span>
                  )}
                  {tab === 'issues' && (
                    <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Mentor Requests</CardTitle>
                    <Button variant="link" className="text-primary-600">View All</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingMentors.slice(0, 3).map((mentor) => (
                      <motion.div
                        key={mentor._id}
                        whileHover={{ x: 4 }}
                        className="p-4 border rounded-lg"
                      >
                        <p className="font-semibold">{mentor.user?.name}</p>
                        <p className="text-sm text-neutral-600">{mentor.expertise?.join(', ')}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>High Priority Issues</CardTitle>
                    <Button variant="link" className="text-primary-600">View All</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {issues.slice(0, 3).map((issue) => (
                      <motion.div
                        key={issue._id}
                        whileHover={{ x: 4 }}
                        className="p-4 border rounded-lg"
                      >
                        <p className="font-semibold text-neutral-900">{issue.title}</p>
                        <p className="text-sm text-neutral-600">{issue.user}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {issue.priority}
                        </span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Mentor Requests Tab */}
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

            {/* Issues Tab */}
            {activeTab === 'issues' && (
              <Card>
                <CardHeader>
                  <CardTitle>Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        placeholder="Search issues by subject, description, or user..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <select className="px-4 py-2 border rounded-lg">
                        <option>All Statuses</option>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                      <select className="px-4 py-2 border rounded-lg">
                        <option>All Priorities</option>
                        <option>High Priority</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <select className="px-4 py-2 border rounded-lg">
                        <option>All Categories</option>
                        <option>Payment</option>
                        <option>Technical</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-lg">{issue.title}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                {issue.status}
                              </span>
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                {issue.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-neutral-600 mb-3">{issue.description}</p>
                        <p className="text-sm text-neutral-500 mb-4">👤 {issue.user}</p>
                        <p className="text-sm text-neutral-500 mb-4">📅 {issue.date}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                            Mark In Progress
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Mark Resolved
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact User
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

