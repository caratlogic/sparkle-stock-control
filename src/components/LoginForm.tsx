import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gem, User, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OverdueNotificationModal } from './OverdueNotificationModal';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Show overdue modal 3 seconds after successful login when user exists  
    let timer: NodeJS.Timeout;
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage && !loading) {
      timer = setTimeout(() => {
        setShowOverdueModal(true);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    } else {
      // Show overdue modal after successful login
      setTimeout(() => {
        setShowOverdueModal(true);
      }, 2000);
    }
    setLoading(false);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Back to Home Button */}
      <Button 
        variant="ghost" 
        className="absolute top-6 left-6 flex items-center space-x-2 hover:bg-primary/10"
        onClick={handleBackToHome}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Button>

      <Card className="w-full max-w-md carat-card border-0 carat-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 carat-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gem className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold carat-heading">CaratLogic</CardTitle>
          <p className="text-muted-foreground">Professional Inventory Management</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-10" 
                  required 
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full carat-gradient carat-shadow" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Demo Accounts - Contact kevalai24@gmail.com for more info
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-mono">owner@diamond.com / owner123</span>
              </div>
              <div className="flex justify-between">
                <span>Admin:</span>
                <span className="font-mono">admin@diamond.com / admin123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OverdueNotificationModal 
        isOpen={showOverdueModal} 
        onClose={() => setShowOverdueModal(false)} 
      />
    </div>
  );
};