import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      await api.post('/auth/verify-email', { token });
      setStatus('success');
      toast('Email verified successfully!', 'success');
    } catch (error) {
      setStatus('error');
      toast(error.response?.data?.message || 'Verification failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'verifying' && (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p>Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div>
                <CheckCircle className="h-16 w-16 text-success-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Email Verified!</p>
                <p className="text-neutral-600 mb-4">Your email has been successfully verified.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            )}
            {status === 'error' && (
              <div>
                <XCircle className="h-16 w-16 text-error-600 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Verification Failed</p>
                <p className="text-neutral-600 mb-4">The verification link is invalid or has expired.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

