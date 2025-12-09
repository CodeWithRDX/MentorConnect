import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MentorCard from '../components/MentorCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Filter } from 'lucide-react';
import api from '../utils/api';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    skill: '',
    rating: '',
  });

  useEffect(() => {
    fetchMentors();
  }, [filters, searchTerm]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.rating) params.append('rating', filters.rating);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/mentors?${params.toString()}`);
      setMentors(response.data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Find Your Perfect Mentor
            </h1>
            <p className="text-xl text-neutral-600">
              Browse through our expert mentors and find the right match for your goals
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    placeholder="Search mentors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Input
                placeholder="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
              <Input
                placeholder="Min Rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              />
            </div>
          </div>

          {/* Mentors Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-neutral-600">No mentors found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <MentorCard key={mentor._id} mentor={mentor} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Mentors;

