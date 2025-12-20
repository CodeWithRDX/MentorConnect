import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GetStartedModal from '../components/GetStartedModal';
import { ArrowRight, Users, BookOpen, Award, Star, CheckCircle, DollarSign } from 'lucide-react';
import api from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);

  // Don't show modal automatically for logged-in users - they already have a role
  // Modal should only be shown when user clicks "Get Started" button
  // If user is logged in and has a role, they shouldn't see this modal

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Expert Mentors',
      description: 'Connect with experienced professionals in your field',
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Personalized Learning',
      description: 'Get tailored guidance based on your goals',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Career Growth',
      description: 'Accelerate your professional development',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'MentorConnect helped me transition into a senior role. The guidance was invaluable!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      content: 'Found the perfect mentor who understood my career goals. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      content: 'The platform made it easy to find mentors in my niche. Great experience!',
      rating: 5,
    },
  ];

  const [bestMentors, setBestMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    const fetchBestMentors = async () => {
      try {
        const res = await api.get('/mentors/top?limit=6');
        setBestMentors(res.data?.data || []);
      } catch (error) {
        console.error('Error fetching top mentors:', error);
      } finally {
        setMentorsLoading(false);
      }
    };

    fetchBestMentors();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <GetStartedModal isOpen={showGetStartedModal} onClose={() => setShowGetStartedModal(false)} />

      {/* Hero Section with Spline-style animation */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-950 dark:to-neutral-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Connect with <span className="text-primary-600">Expert Mentors</span> in 3D
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Visualize your growth journey with an interactive 3D experience while you discover the perfect mentor for your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/select-role">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/mentors">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Browse Mentors
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Live 1:1 sessions
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Curated mentors
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Flexible schedules
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative h-72 md:h-96 lg:h-[420px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-purple-500/10 to-amber-400/10 blur-3xl rounded-3xl" />
              <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/40 dark:border-primary-900/60 shadow-2xl bg-neutral-900/90">
                {/* Spline 3D Animation */}
                <spline-viewer 
                  url={import.meta.env.VITE_SPLINE_SCENE_URL || "https://prod.spline.design/7NZHW3H-6jQEOxOn/scene.splinecode"}
                  className="h-full w-full"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 flex items-center justify-between bg-white/90 dark:bg-neutral-900/90 border border-border rounded-2xl px-4 py-3 shadow-lg backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Live Sessions Today</p>
                  <p className="text-sm font-semibold text-foreground">Mentors ready to help you grow</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Interactive 3D powered by Spline</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose MentorConnect?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find the perfect mentor and grow your career
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account as a mentee or mentor' },
              { step: '2', title: 'Find Match', desc: 'Browse and connect with mentors in your field' },
              { step: '3', title: 'Start Learning', desc: 'Book sessions and begin your mentorship journey' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg border border-border shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Best Mentors Carousel */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-bold text-foreground mb-3">
              Best Mentors for You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hand-picked mentors with the most sessions booked by entrepreneurs like you.
            </p>
          </motion.div>

          {mentorsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            </div>
          ) : bestMentors.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              Top mentors will appear here once bookings start coming in.
            </p>
          ) : (
            <div
              className="overflow-hidden"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              <motion.div
                className="flex gap-6"
                animate={
                  isCarouselPaused
                    ? { x: 0 }
                    : { x: ['0%', '-50%'] }
                }
                transition={
                  isCarouselPaused
                    ? { duration: 0 }
                    : {
                        duration: 30,
                        ease: 'linear',
                        repeat: Infinity,
                      }
                }
              >
                {[...bestMentors, ...bestMentors].map((mentor, index) => (
                  <motion.div
                    key={`${mentor._id}-${index}`}
                    whileHover={{ scale: 1.07 }}
                    className="min-w-[340px] max-w-sm bg-card text-card-foreground border border-border rounded-2xl shadow-sm p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                        {mentor.user?.avatar ? (
                          <img
                            src={mentor.user.avatar}
                            alt={mentor.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-foreground">
                            {mentor.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-base text-foreground">
                          {mentor.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mentor.categories?.[0] || 'Mentor'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                        <span className="font-medium text-foreground text-sm">
                          {mentor.rating?.toFixed(1) || '4.9'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({mentor.totalReviews || 0})
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">
                          {mentor.bookingsCount}
                        </span>{' '}
                        <span className="text-muted-foreground">sessions</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between rounded-xl border border-border bg-neutral-50 dark:bg-neutral-950 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 text-foreground" />
                        <span>Price</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ${mentor.hourlyRate ?? 0}
                          <span className="text-xs font-medium text-muted-foreground">/hr</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {mentor.skills?.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-[11px] text-neutral-700 dark:text-neutral-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.skills?.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-[11px] text-neutral-500">
                          +{mentor.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of professionals growing their careers with MentorConnect
            </p>
            <Link to="/select-role">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

