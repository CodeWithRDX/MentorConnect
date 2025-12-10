import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Star, DollarSign, Clock, Calendar, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/toaster';

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    sessionDate: '',
    sessionTime: { start: '', end: '' },
    duration: 60,
    notes: '',
  });
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchMentor();
  }, [id]);

  const fetchMentor = async () => {
    try {
      const response = await api.get(`/mentors/${id}`);
      setMentor(response.data.data);
    } catch (error) {
      console.error('Error fetching mentor:', error);
      toast('Failed to load mentor details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/bookings', {
        mentor: mentor._id,
        ...bookingData,
      });
      toast('Booking created successfully!', 'success');
      setShowBookingModal(false);
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to create booking', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Mentor not found</p>
      </div>
    );
  }

  const mentorUser = mentor.user || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {mentorUser.avatar ? (
                    <img src={mentorUser.avatar} alt={mentorUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary-600">
                      {mentorUser.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">{mentorUser.name}</h1>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 fill-warning-400 text-warning-400" />
                        <span className="ml-1 font-semibold">{mentor.rating.toFixed(1)}</span>
                        <span className="ml-1 text-neutral-500">({mentor.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-2xl font-bold text-primary-600 mb-2">
                      <DollarSign className="h-6 w-6 mr-1" />
                      {mentor.hourlyRate}/hr
                    </div>
                    <Button onClick={() => setShowBookingModal(true)}>
                      Book Session
                    </Button>
                  </div>
                </div>
                
                <p className="text-neutral-700 mb-6">{mentor.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Experience</p>
                    <p className="font-semibold">{mentor.experience} years</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Total Reviews</p>
                    <p className="font-semibold">{mentor.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Status</p>
                    <p className="font-semibold text-success-600">
                      {mentor.isApproved ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold mb-4">Book a Session</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingData.sessionDate}
                      onChange={(e) => setBookingData({ ...bookingData, sessionDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      value={bookingData.sessionTime.start}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        sessionTime: { ...bookingData.sessionTime, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                      min="30"
                      step="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleBooking} className="flex-1">
                    Confirm Booking
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MentorDetail;

