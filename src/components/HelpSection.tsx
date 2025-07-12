import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Gem, 
  Users, 
  FileText, 
  CreditCard, 
  QrCode,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Package,
  Bell,
  X
} from 'lucide-react';

interface HelpSectionProps {
  onClose: () => void;
}

export const HelpSection = ({ onClose }: HelpSectionProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const dashboards = [
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      icon: BarChart3,
      purpose: 'Monitor business performance and key metrics',
      features: [
        'Revenue tracking and trends',
        'Sales performance analysis',
        'Customer analytics',
        'Inventory insights',
        'Monthly/yearly comparisons',
        'Export reports'
      ],
      alerts: [
        'Low inventory warnings',
        'Revenue milestone alerts',
        'Performance notifications'
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: Gem,
      purpose: 'Manage your diamond and gemstone inventory',
      features: [
        'Add/edit gems with detailed specifications',
        'Track carat, color, clarity, cut details',
        'Certificate management',
        'Stock status tracking (In Stock, Reserved, Sold)',
        'Pricing and cost management',
        'QR code generation for gems',
        'Bulk operations',
        'Advanced search and filtering'
      ],
      alerts: [
        'Low stock notifications',
        'Price change alerts',
        'Certificate expiry warnings'
      ]
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: Users,
      purpose: 'Manage customer relationships and information',
      features: [
        'Customer profile management',
        'Contact information tracking',
        'Purchase history',
        'Discount management',
        'KYC status tracking',
        'VAT number management',
        'Customer communications',
        'Revenue tracking per customer'
      ],
      alerts: [
        'New customer registration',
        'Customer birthday reminders',
        'Communication follow-ups'
      ]
    },
    {
      id: 'transactions',
      title: 'Transaction Dashboard',
      icon: FileText,
      purpose: 'Manage invoices and consignments',
      features: [
        'Create and manage invoices',
        'Consignment tracking',
        'Status management (Draft, Sent, Paid, Overdue)',
        'Invoice to consignment conversion',
        'PDF generation and email',
        'Due date tracking',
        'Tax calculations'
      ],
      alerts: [
        'Overdue invoice notifications',
        'Consignment return reminders',
        'Payment confirmations'
      ]
    },
    {
      id: 'payments',
      title: 'Payment Dashboard',
      icon: CreditCard,
      purpose: 'Track payments and financial transactions',
      features: [
        'Record payments against invoices',
        'Multiple payment methods support',
        'Payment status tracking',
        'Outstanding amount calculations',
        'Overdue payment identification',
        'Receivables tracking',
        'Payment export functionality',
        'Credit note management'
      ],
      alerts: [
        'Payment received notifications',
        'Overdue payment warnings',
        'Credit limit alerts'
      ]
    },
    {
      id: 'communications',
      title: 'Communications Dashboard',
      icon: MessageSquare,
      purpose: 'Manage customer communications and follow-ups',
      features: [
        'Email communication tracking',
        'SMS notifications',
        'Communication history',
        'Template management',
        'Automated follow-ups',
        'Response tracking',
        'Bulk messaging'
      ],
      alerts: [
        'New messages received',
        'Follow-up reminders',
        'Communication failures'
      ]
    },
    {
      id: 'reminders',
      title: 'Reminder Dashboard',
      icon: Bell,
      purpose: 'Manage automated reminders and notifications',
      features: [
        'Payment reminder scheduling',
        'Consignment return reminders',
        'Custom reminder creation',
        'Reminder history tracking',
        'Automated scheduling',
        'Multiple reminder types'
      ],
      alerts: [
        'Reminder due notifications',
        'Escalation alerts',
        'Reminder delivery status'
      ]
    },
    {
      id: 'creditnotes',
      title: 'Credit Notes Dashboard',
      icon: Package,
      purpose: 'Manage credit notes and refunds',
      features: [
        'Create credit notes',
        'Track credit balances',
        'Apply credits to invoices',
        'Reason code management',
        'Credit note reporting',
        'Status tracking'
      ],
      alerts: [
        'Credit note creation',
        'Credit application notifications',
        'Unused credit alerts'
      ]
    },
    {
      id: 'qrcodes',
      title: 'QR Code Management',
      icon: QrCode,
      purpose: 'Generate and manage QR codes for inventory',
      features: [
        'Custom QR code field selection',
        'Bulk QR code generation',
        'QR code customization',
        'Print-ready formats',
        'Field mapping configuration',
        'Preview functionality'
      ],
      alerts: [
        'QR code generation completion',
        'Field mapping changes',
        'Print queue notifications'
      ]
    }
  ];

  const systemFeatures = [
    {
      title: 'Authentication & Security',
      features: [
        'Secure user login/logout',
        'Role-based access control',
        'Session management',
        'Data encryption'
      ]
    },
    {
      title: 'Data Management',
      features: [
        'Real-time data synchronization',
        'Automated backups',
        'Data export capabilities',
        'Search and filtering'
      ]
    },
    {
      title: 'Automation',
      features: [
        'Automated invoice status updates',
        'Payment reconciliation',
        'Reminder scheduling',
        'Email notifications'
      ]
    },
    {
      title: 'Reporting',
      features: [
        'Financial reports',
        'Inventory reports',
        'Customer analytics',
        'Custom report generation'
      ]
    }
  ];

  const alertTypes = [
    {
      type: 'Payment Alerts',
      icon: CreditCard,
      color: 'text-green-600',
      alerts: [
        'Payment received confirmation',
        'Overdue payment warnings (1 month+)',
        'Partial payment notifications',
        'Credit note applications'
      ]
    },
    {
      type: 'Invoice Alerts',
      icon: FileText,
      color: 'text-blue-600',
      alerts: [
        'Invoice creation notifications',
        'Invoice status changes',
        'Due date reminders',
        'Overdue invoice warnings'
      ]
    },
    {
      type: 'Consignment Alerts',
      icon: Package,
      color: 'text-purple-600',
      alerts: [
        'Consignment creation confirmations',
        'Return date reminders (1 month+)',
        'Status change notifications',
        'Overdue return warnings'
      ]
    },
    {
      type: 'Inventory Alerts',
      icon: Gem,
      color: 'text-yellow-600',
      alerts: [
        'Low stock warnings',
        'New item additions',
        'Price change notifications',
        'Status updates'
      ]
    },
    {
      type: 'System Alerts',
      icon: AlertTriangle,
      color: 'text-red-600',
      alerts: [
        'Login notifications on startup',
        'Data sync status',
        'Error notifications',
        'System maintenance alerts'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Help & Documentation</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="dashboards" className="h-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              <TabsTrigger value="features">System Features</TabsTrigger>
              <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
              <TabsTrigger value="workflow">How It Works</TabsTrigger>
            </TabsList>
            
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
              <TabsContent value="dashboards" className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">Dashboard Overview</h3>
                <div className="space-y-4">
                  {dashboards.map((dashboard) => (
                    <Collapsible
                      key={dashboard.id}
                      open={openSections[dashboard.id]}
                      onOpenChange={() => toggleSection(dashboard.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <dashboard.icon className="w-6 h-6 text-primary" />
                                <div>
                                  <h4 className="text-lg font-semibold">{dashboard.title}</h4>
                                  <p className="text-sm text-muted-foreground">{dashboard.purpose}</p>
                                </div>
                              </div>
                              {openSections[dashboard.id] ? 
                                <ChevronDown className="w-5 h-5" /> : 
                                <ChevronRight className="w-5 h-5" />
                              }
                            </div>
                          </CardHeader>
                        </Card>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <Card className="mt-2 ml-4">
                          <CardContent className="pt-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-semibold mb-2 text-green-700">Key Features</h5>
                                <ul className="space-y-1 text-sm">
                                  {dashboard.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-green-600 mt-1">•</span>
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold mb-2 text-orange-700">Alert Types</h5>
                                <ul className="space-y-1 text-sm">
                                  {dashboard.alerts.map((alert, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <AlertTriangle className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                                      {alert}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features" className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">System Features</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {systemFeatures.map((category, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.features.map((feature, featureIdx) => (
                            <li key={featureIdx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">Alerts & Notifications</h3>
                <div className="space-y-4">
                  {alertTypes.map((category, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <category.icon className={`w-6 h-6 ${category.color}`} />
                          <CardTitle className="text-lg">{category.type}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.alerts.map((alert, alertIdx) => (
                            <li key={alertIdx} className="flex items-start gap-2 text-sm">
                              <Bell className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                              {alert}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="workflow" className="p-6 space-y-6">
                <h3 className="text-xl font-semibold">How the System Works</h3>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Flow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">1</Badge>
                          <span>Add gems to inventory with detailed specifications</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">2</Badge>
                          <span>Register customers with contact and business details</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">3</Badge>
                          <span>Create consignments for customers to view inventory</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">4</Badge>
                          <span>Convert consignments to invoices when customer decides to purchase</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">5</Badge>
                          <span>Track payments and update invoice status automatically</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">6</Badge>
                          <span>Monitor overdue payments and consignment returns</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Automations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span><strong>Invoice Status:</strong> Automatically updates to "Paid" when full payment received</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span><strong>Overdue Detection:</strong> Automatically identifies overdue invoices and consignments (1 month+)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span><strong>Customer Totals:</strong> Automatically calculates customer purchase totals and last purchase date</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span><strong>Stock Updates:</strong> Inventory status updates when items are sold</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span><strong>Login Alerts:</strong> Shows overdue notifications on system startup</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        All dashboards are connected and share data in real-time:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Customer data flows to invoices, consignments, and payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Inventory updates reflect in all transactions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Payment records automatically update invoice and customer balances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>QR codes can be customized to show any inventory field</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};