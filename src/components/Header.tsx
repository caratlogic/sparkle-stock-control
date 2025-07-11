import { Gem, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
export const Header = () => {
  const {
    user,
    logout,
    isOwner
  } = useAuth();
  return <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Inventory Management</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "Owner" : "Admin"}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>;
};