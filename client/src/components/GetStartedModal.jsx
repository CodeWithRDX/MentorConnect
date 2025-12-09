import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const GetStartedModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleFindMentor = () => {
    onClose();
    navigate('/mentors');
  };

  const handleBecomeMentor = () => {
    onClose();
    navigate('/mentor/apply');
  };

  const handleAdminDashboard = () => {
    onClose();
    navigate('/admin/dashboard');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Join MentorConnect</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              <p className="text-center text-neutral-600 text-sm mb-6">
                Choose your role to get started
              </p>

              {/* I'm an Entrepreneur Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFindMentor}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
              >
                <div className="text-base font-semibold">I'm an Entrepreneur</div>
                <div className="text-sm text-blue-100 mt-1">
                  Looking for guidance and mentorship
                </div>
              </motion.button>

              {/* I'm a Mentor Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBecomeMentor}
                className="w-full border-2 border-blue-600 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold py-4 px-6 rounded-lg transition-colors text-center"
              >
                <div className="text-base font-semibold">I'm a Mentor</div>
                <div className="text-sm text-blue-500 mt-1">
                  Ready to share my expertise
                </div>
              </motion.button>

              {/* I'm an Admin Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdminDashboard}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-4 px-6 rounded-lg transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={true}
              >
                <div className="text-base font-semibold">I'm an Admin</div>
                <div className="text-sm text-neutral-500 mt-1">
                  Platform management and oversight
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GetStartedModal;
