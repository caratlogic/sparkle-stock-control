import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  X,
  Gem,
  Home,
  Building2,
  Settings,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
  { id: 'diamond-settings', label: 'Diamond Settings', icon: Settings },
  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
  { id: 'purchases', label: 'Purchases', icon: Package },
];

export const Sidebar = ({ activeTab, onTabChange, collapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col h-full",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 carat-gradient-luxury rounded-lg flex items-center justify-center">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold carat-heading">CaratLogic</h1>
                <p className="text-xs text-muted-foreground">Professional</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2 hover:bg-accent"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
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
                  "w-full justify-start h-10 transition-colors",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  !isActive && "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", !collapsed && "mr-3")} />
                {!collapsed && (
                  <span className="truncate text-sm font-medium">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            CaratLogic v1.0
          </div>
        </div>
      )}
    </div>
  );
};