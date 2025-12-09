import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GetStartedModal from '../components/GetStartedModal';
import { ArrowRight, Users, BookOpen, Award, Star, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);

  // Show modal on first login (check localStorage to avoid showing on every page load)
  useEffect(() => {
    const hasShownModal = localStorage.getItem('mentorconnect_shown_modal');
    if (user && !hasShownModal) {
      setShowGetStartedModal(true);
      localStorage.setItem('mentorconnect_shown_modal', 'true');
    }
  }, [user]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <GetStartedModal isOpen={showGetStartedModal} onClose={() => setShowGetStartedModal(false)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Connect with Expert Mentors
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Accelerate your career growth with personalized mentorship from industry professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Why Choose MentorConnect?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
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
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
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
                className="bg-neutral-50 p-6 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
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

