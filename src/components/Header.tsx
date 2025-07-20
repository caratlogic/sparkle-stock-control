import { Gem, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Header = () => {
  const {
    user,
    logout,
    isOwner
  } = useAuth();
  
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 carat-shadow">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 carat-gradient-luxury rounded-2xl flex items-center justify-center carat-shadow">
              <Gem className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold carat-heading">CaratLogic</h1>
              <p className="text-xs text-muted-foreground font-medium carat-text-luxury">Professional Gem & Diamond Solutions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <ThemeSwitcher />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                <Badge variant={isOwner ? "default" : "secondary"} className="text-xs w-fit">
                  {isOwner ? "Owner" : "Admin"}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};