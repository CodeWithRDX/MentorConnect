import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const MentorApply = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    categories: '',
    experience: '',
    hourlyRate: '',
    languages: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        experience: parseInt(formData.experience),
        hourlyRate: parseFloat(formData.hourlyRate),
      };

      await api.post('/mentors/apply', applicationData);
      toast('Application submitted successfully! Waiting for admin approval.', 'success');
      navigate('/mentor/dashboard');
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-neutral-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Become a Mentor</CardTitle>
                <CardDescription>
                  Fill out the form below to apply as a mentor. Your application will be reviewed by our admin team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                      placeholder="Tell us about yourself, your expertise, and what you can offer to mentees..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills (comma-separated) *</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., JavaScript, React, Node.js, Leadership"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="categories">Categories (comma-separated) *</Label>
                    <Input
                      id="categories"
                      name="categories"
                      value={formData.categories}
                      onChange={handleChange}
                      placeholder="e.g., Software Development, Career Coaching, Product Management"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input
                      id="languages"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MentorApply;

