import { Link } from 'react-router-dom';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

const MentorCard = ({ mentor, index = 0 }) => {
  const user = mentor.user || {};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex-1">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                <span className="text-sm text-neutral-500">({mentor.totalReviews})</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{mentor.bio}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.skills?.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded-full"
              >
                {skill}
              </span>
            ))}
            {mentor.skills?.length > 3 && (
              <span className="px-2 py-1 text-xs text-neutral-500">
                +{mentor.skills.length - 3} more
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-semibold">${mentor.hourlyRate}/hr</span>
            </div>
            <div className="flex items-center">
              <span>{mentor.experience} years exp.</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0">
          <Link to={`/mentors/${mentor._id}`} className="w-full">
            <Button className="w-full">View Profile</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MentorCard;

