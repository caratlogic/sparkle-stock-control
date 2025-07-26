import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Package, 
  Users, 
  Receipt, 
  CreditCard, 
  Bell, 
  MessageSquare, 
  FileText, 
  QrCode,
  Menu,
  Gem,
  Home,
  History,
  Building2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'partners', label: 'Partners', icon: Users },
  { id: 'associated-entities', label: 'Associated Entities', icon: Building2 },
  { id: 'transaction-tracking', label: 'Transaction Tracking', icon: BarChart3 },
  { id: 'merge-split-history', label: 'Merge & Split History', icon: History },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'credit-notes', label: 'Credit Notes', icon: FileText },
  { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
  { id: 'gem-settings', label: 'Gem Settings', icon: Settings },
];

export const MobileSidebar = ({ activeTab, onTabChange }: MobileSidebarProps) => {
  const [open, setOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 carat-gradient-luxury rounded-lg flex items-center justify-center">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold carat-heading">CaratLogic</SheetTitle>
              <p className="text-xs text-muted-foreground">Professional</p>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 px-3 transition-colors",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            CaratLogic v1.0
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};