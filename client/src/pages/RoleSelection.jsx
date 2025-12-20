import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Shield, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'mentee',
      title: "I'm an Entrepreneur",
      description: 'Looking for guidance and mentorship',
      icon: <Briefcase className="h-12 w-12" />,
      color: 'from-blue-500 to-blue-600',
      details: [
        'Find expert mentors in your industry',
        'Get personalized guidance',
        'Accelerate your growth',
        'Access resources and insights',
      ],
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Ready to share my expertise',
      icon: <Users className="h-12 w-12" />,
      color: 'from-purple-500 to-purple-600',
      details: [
        'Help entrepreneurs succeed',
        'Share your knowledge',
        'Build your mentoring profile',
        'Earn recognition',
      ],
    },
    {
      id: 'admin',
      title: "I'm an Admin",
      description: 'Manage and oversee the platform',
      icon: <Shield className="h-12 w-12" />,
      color: 'from-green-500 to-green-600',
      details: [
        'Oversee platform operations',
        'Manage user roles and permissions',
        'Ensure platform security',
        'Access detailed analytics',
      ],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);

    // Redirect to different login pages based on the role
    const targetPage = roleId === 'admin' ? '/admin/login' : '/login';

    setTimeout(() => {
      navigate(targetPage, { state: { selectedRole: roleId } });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Welcome to MentorConnect
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your role to get started and join thousands of successful mentorship connections
            </p>
          </motion.div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleRoleSelect(role.id)}
                className="group cursor-pointer"
              >
                <div className="h-full bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary-200 dark:hover:border-primary-800 overflow-hidden">
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${role.color} p-8 text-white`}>
                    <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {role.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-center">{role.title}</h2>
                    <p className="text-center text-white text-opacity-90 mt-2">
                      {role.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {role.details.map((detail, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1 + idx * 0.05) }}
                          className="flex items-start gap-3"
                        >
                          <div className={`bg-gradient-to-r ${role.color} rounded-full p-1 mt-1 flex-shrink-0`}>
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-muted-foreground">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedRole === role.id}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole === role.id
                        ? `bg-gradient-to-r ${role.color} text-white`
                        : `bg-muted hover:bg-muted/80 text-foreground`
                        }`}
                    >
                      {selectedRole === role.id ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Already have an account?</h3>
            <p className="text-muted-foreground mb-6">
              You can change your role anytime in your account settings after logging in.
            </p>
            <p className="text-sm text-muted-foreground">
              All features are available regardless of your selected role. You can explore both mentor and mentee functionalities.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoleSelection;
