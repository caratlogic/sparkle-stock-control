
import { useState } from 'react';
import { Search, Settings, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-diamond-gradient rounded-lg flex items-center justify-center diamond-sparkle">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Diamond Inventory</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors">Dashboard</a>
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors">Inventory</a>
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors">Reports</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search diamonds..."
                className="pl-10 w-64 bg-slate-50 border-slate-200"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <a href="#" className="py-2 text-slate-600 hover:text-slate-800 transition-colors">Dashboard</a>
              <a href="#" className="py-2 text-slate-600 hover:text-slate-800 transition-colors">Inventory</a>
              <a href="#" className="py-2 text-slate-600 hover:text-slate-800 transition-colors">Reports</a>
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Input
                placeholder="Search diamonds..."
                className="mb-3 bg-slate-50 border-slate-200"
              />
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
