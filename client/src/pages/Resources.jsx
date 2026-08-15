import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, ExternalLink, ArrowLeft, Filter } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMentor, setFilterMentor] = useState('all');
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      // First get all mentors to get their resources
      const mentorsRes = await api.get('/mentors');
      const mentorList = mentorsRes.data.data;
      
      // Fetch full profile for each mentor to get resources
      const mentorPromises = mentorList.map(m => api.get(`/mentors/${m._id}`));
      const mentorResponses = await Promise.all(mentorPromises);
      const allMentors = mentorResponses.map(res => res.data.data);
      setMentors(allMentors);

      // Collect all resources with mentor info
      const allResources = [];
      allMentors.forEach(mentor => {
        if (mentor.resources && mentor.resources.length > 0) {
          mentor.resources.forEach(resource => {
            allResources.push({
              ...resource,
              mentorId: mentor._id,
              mentorName: mentor.user?.name || 'Unknown Mentor',
              mentorAvatar: mentor.user?.avatar,
            });
          });
        }
      });

      setResources(allResources);
    } catch (error) {
      logger.error('Error fetching resources', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = filterMentor === 'all' 
    ? resources 
    : resources.filter(r => r.mentorId === filterMentor);

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
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Resources</h1>
                <p className="text-neutral-600">Explore learning materials shared by your mentors</p>
              </div>
              <BookOpen className="h-12 w-12 text-primary-600" />
            </div>
          </motion.div>

          {/* Filter */}
          {mentors.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-neutral-600" />
                  <select
                    value={filterMentor}
                    onChange={(e) => setFilterMentor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Mentors</option>
                    {mentors.map(mentor => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.user?.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600 text-lg">No resources available yet.</p>
                  <p className="text-neutral-500 text-sm mt-2">
                    Your mentors haven't shared any resources yet. Check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start gap-2">
                        <BookOpen className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                        <span className="line-clamp-2">{resource.title || 'Untitled Resource'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {resource.mentorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{resource.mentorName}</p>
                          <p className="text-xs text-neutral-500">Mentor</p>
                        </div>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Resource
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;

