import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Users, DollarSign, Star, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MentorDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    completedSessions: 0,
    activeMentees: 0,
    averageRating: 4.9,
  });
  const [loading, setLoading] = useState(true);

  const mentorProfile = user?.mentorProfile;
  const isApproved = mentorProfile?.isApproved;
  const isPending = mentorProfile && !mentorProfile.isApproved;

  useEffect(() => {
    // If user has a mentor profile, load bookings; otherwise stop the spinner
    if (isApproved) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/mentor/${user.mentorProfile}`);
      setBookings(response.data.data);
      const upcoming = response.data.data.filter(
        b => new Date(b.sessionDate) > new Date() && b.status === 'confirmed'
      ).length;
      const completed = response.data.data.filter(b => b.status === 'completed').length;
      const activeMentees = new Set(response.data.data.map(b => b.mentee?._id)).size;
      
      setStats({
        totalBookings: response.data.data.length,
        upcomingSessions: upcoming,
        completedSessions: completed,
        activeMentees: activeMentees,
        totalEarnings: response.data.data
          .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + (b.amount || 0), 0),
        averageRating: 4.9,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // New mentor (no profile yet)
  if (!mentorProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You need to apply as a mentor first.</p>
              <Link to="/mentor/apply">
                <Button>Apply Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Pending approval view
  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Application Pending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Your mentor application is pending admin approval. We’ll notify you once reviewed.</p>
              <div className="flex gap-3">
                <Link to="/mentor/apply">
                  <Button variant="outline">Edit Application</Button>
                </Link>
                <Button variant="default">Raise Request</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
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
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Welcome back, Mentor!</h1>
                <p className="text-neutral-600">View your upcoming sessions and manage your mentees</p>
              </div>
              <Link to="/mentors">
                <Button>Dashboard</Button>
              </Link>
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
                      <p className="text-sm text-neutral-600 mb-1">Upcoming Sessions</p>
                      <p className="text-3xl font-bold">{stats.upcomingSessions}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-600 bg-blue-100 p-2 rounded-full" />
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
                      <p className="text-sm text-neutral-600 mb-1">Completed Sessions</p>
                      <p className="text-3xl font-bold">{stats.completedSessions}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600 bg-green-100 p-2 rounded-full" />
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
                      <p className="text-sm text-neutral-600 mb-1">Active Mentees</p>
                      <p className="text-3xl font-bold">{stats.activeMentees}</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-600 bg-purple-100 p-2 rounded-full" />
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
                      <p className="text-sm text-neutral-600 mb-1">Average Rating</p>
                      <p className="text-3xl font-bold">{stats.averageRating}</p>
                    </div>
                    <Star className="h-10 w-10 text-yellow-600 bg-yellow-100 p-2 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.filter(b => b.status === 'confirmed' && new Date(b.sessionDate) > new Date()).length === 0 ? (
                    <p className="text-neutral-600 text-center py-8">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings
                        .filter(b => b.status === 'confirmed' && new Date(b.sessionDate) > new Date())
                        .slice(0, 5)
                        .map((booking) => (
                          <motion.div
                            key={booking._id}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-neutral-50 transition"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-900">{booking.mentee?.name}</p>
                              <p className="text-sm text-neutral-600 mt-1">
                                📅 {new Date(booking.sessionDate).toLocaleDateString()} at {booking.sessionTime?.start || 'TBD'}
                              </p>
                              <p className="text-sm text-neutral-500 mt-1">{booking.topic || 'General Session'}</p>
                            </div>
                            <Button className="ml-4" size="sm">
                              Join Call
                            </Button>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Update Availability
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share Resources
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MentorDashboard;

