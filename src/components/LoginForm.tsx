import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Diamond, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OverdueNotificationModal } from './OverdueNotificationModal';
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const {
    login
  } = useAuth();
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
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md diamond-sparkle">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-diamond-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Diamond className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Gems & Diamond  Inventory Management System</CardTitle>
          <p className="text-slate-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>

            {error && <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>}

            <Button type="submit" className="w-full bg-diamond-gradient hover:opacity-90" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center mb-3">Demo Accounts: 
Please contact kevalai24@gmail.com for more info</p>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span>owner@diamond.com / owner123</span>
              </div>
              <div className="flex justify-between">
                <span>Admin:</span>
                <span>admin@diamond.com / admin123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <OverdueNotificationModal isOpen={showOverdueModal} onClose={() => setShowOverdueModal(false)} />
    </div>;
};