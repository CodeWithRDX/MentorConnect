import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MentorEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const statsFromState = location.state?.stats;

  useEffect(() => {
    const load = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }
        const mentorProfileId = user?.mentorProfile?._id || user?.mentorProfile || user._id || user.id;
        const res = await api.get(`/bookings/mentor/${mentorProfileId}`);
        setBookings(res.data?.data || []);
      } catch (error) {
        logger.error('Error loading earnings bookings', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const paidCompleted = bookings.filter(
    (b) => b.status === 'completed' && b.paymentStatus === 'paid'
  );

  const totalEarnings =
    statsFromState?.totalEarnings ??
    paidCompleted.reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/mentor/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
                <p className="text-sm text-muted-foreground">
                  Track your completed sessions and income over time
                </p>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card text-card-foreground border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${totalEarnings.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Paid Sessions
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {paidCompleted.length}
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-600 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Average Session Value
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      $
                      {paidCompleted.length
                        ? (totalEarnings / paidCompleted.length).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle>Paid Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {paidCompleted.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">
                    You don&apos;t have any paid completed sessions yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-border">
                        <tr>
                          <th className="p-3 text-left font-semibold">Mentee</th>
                          <th className="p-3 text-left font-semibold">Date</th>
                          <th className="p-3 text-left font-semibold">Time</th>
                          <th className="p-3 text-left font-semibold">Duration</th>
                          <th className="p-3 text-left font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidCompleted.map((booking) => (
                          <tr
                            key={booking._id}
                            className="border-b border-border/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                          >
                            <td className="p-3">
                              {booking.mentee?.name || 'Mentee'}
                            </td>
                            <td className="p-3">
                              {new Date(booking.sessionDate).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              {booking.sessionTime?.start || 'TBD'} –{' '}
                              {booking.sessionTime?.end || 'TBD'}
                            </td>
                            <td className="p-3">{booking.duration} min</td>
                            <td className="p-3 font-semibold">
                              ${booking.amount?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MentorEarnings;


