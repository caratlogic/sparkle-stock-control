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
  X,
  ClipboardList
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
      purpose: 'Monitor business performance and key metrics with real-time insights',
      features: [
        'Revenue tracking with monthly/yearly trends and comparisons',
        'Sales performance analysis by gem type, customer, and time period',
        'Customer analytics including top customers and buying patterns',
        'Inventory insights: stock levels, turnover rates, most popular items',
        'Payment analytics: collection rates, overdue trends, cash flow',
        'Profit margin analysis with cost vs selling price comparisons',
        'Interactive charts and graphs for visual data representation',
        'Export reports for external analysis and presentations',
        'Key performance indicators (KPIs) dashboard',
        'Seasonal trends and demand forecasting'
      ],
      alerts: [
        'Performance threshold notifications',
        'Unusual activity detection',
        'Monthly/quarterly report generation'
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: Gem,
      purpose: 'Comprehensive diamond and gemstone inventory management with advanced tracking capabilities',
      features: [
        'Add/edit gems with complete specifications (4Cs, measurements, certificates)',
        'Real-time stock tracking: In Stock (available), Reserved (on consignment), Sold (through invoices)',
        'Advanced filtering by gem type, cut, color, carat range, price range, status',
        'Certificate management with number tracking and types',
        'Supplier information and purchase history tracking',
        'Treatment and origin documentation',
        'Professional QR code generation with customizable field selection',
        'Bulk operations for efficient inventory management',
        'CSV export for external systems integration',
        'Transaction history showing complete gem lifecycle',
        'Photo attachments and detailed descriptions',
        'Cost price tracking for profit analysis (owner only)',
        'Automated calculations: price per carat, total values',
        'Column customization for personalized views',
        'Real-time updates when gems are sold or consigned'
      ],
      alerts: [
        'Low stock notifications when inventory drops below threshold',
        'Price change alerts for market fluctuations',
        'Certificate expiration reminders',
        'Long-term inventory aging alerts'
      ]
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: Users,
      purpose: 'Complete customer relationship management with detailed profiles and financial tracking',
      features: [
        'Comprehensive customer profiles (contact, company, address details)',
        'Tax information management (Tax ID, VAT numbers for business customers)',
        'KYC (Know Your Customer) status tracking for compliance',
        'Purchase history with total lifetime value and frequency analysis',
        'Payment tracking: outstanding balances, overdue amounts, payment patterns',
        'Communication history: emails, calls, meetings, follow-up notes',
        'Customer status management (Active/Inactive with business rule validation)',
        'Automated reminders for overdue payments and scheduled follow-ups',
        'Advanced filtering by status, location, payment behavior, purchase volume',
        'Customer segmentation for targeted marketing and communications',
        'Credit limit management and risk assessment',
        'Customer loyalty program tracking and rewards management'
      ],
      alerts: [
        'Payment overdue notifications (30, 60, 90+ days)',
        'Follow-up reminders for customer communications',
        'Birthday and anniversary notifications',
        'Large purchase opportunities based on buying patterns'
      ]
    },
    {
      id: 'transactions',
      title: 'Transaction Management',
      icon: FileText,
      purpose: 'Complete transaction lifecycle management for invoices and consignments with automated workflows',
      features: [
        'Professional invoice creation with automated numbering and tax calculations',
        'Consignment management with flexible terms and return tracking',
        'Multi-item transactions with quantity controls and bulk pricing',
        'Payment recording with multiple methods (cash, bank, card, check)',
        'Automated workflow: Draft → Sent → Paid/Overdue status progression',
        'Professional PDF generation for invoices and consignment agreements',
        'Email integration for direct document delivery to customers',
        'Advanced filtering by customer, date range, status, amount, item type',
        'Seamless consignment-to-invoice conversion when items sell',
        'Credit note generation for returns, exchanges, and adjustments',
        'Comprehensive audit trail with timestamps and user tracking',
        'Bulk operations for efficiency (bulk emails, status updates)',
        'VAT/Tax handling with configurable rates and exemptions'
      ],
      alerts: [
        'Invoice due date reminders (configurable lead times)',
        'Consignment return date notifications',
        'Payment confirmation alerts',
        'Overdue payment escalation workflows'
      ]
    },
    {
      id: 'payments',
      title: 'Payment Management',
      icon: CreditCard,
      purpose: 'Advanced payment tracking and cash flow management with automated calculations and reporting',
      features: [
        'Real-time payment dashboard with summary cards (Total Received, Pending, Outstanding)',
        'Automated overdue detection with aging analysis (30, 60, 90+ days)',
        'Multiple payment method support (Cash, Bank Transfer, Credit Card, Check, Other)',
        'Partial payment tracking with automatic remaining balance calculations',
        'Complete payment transaction history with searchable audit trail',
        'Automatic invoice status updates when payments are recorded',
        'Receivables aging reports for cash flow management',
        'Payment reminder system with escalation procedures',
        'Customer payment pattern analysis for credit decisions',
        'Payment export functionality for accounting system integration',
        'Credit note management for refunds and adjustments',
        'Cash flow forecasting based on invoice due dates and payment patterns',
        'Payment reconciliation tools for bank statement matching'
      ],
      alerts: [
        'Overdue payment notifications with automatic escalation',
        'Large payment confirmations',
        'Unusual payment pattern detection',
        'Cash flow threshold warnings'
      ]
    },
    {
      id: 'reminders',
      title: 'Reminder System',
      icon: Bell,
      purpose: 'Automated reminder and notification system for proactive business management',
      features: [
        'Automated overdue payment reminders with customizable schedules',
        'Consignment return date notifications',
        'Follow-up reminders for customer communications',
        'Certificate renewal and compliance reminders',
        'Staff task and appointment reminders',
        'Customizable reminder templates and messaging',
        'Escalation workflows for critical reminders',
        'Reminder history and response tracking'
      ],
      alerts: [
        'Critical overdue situations requiring immediate attention',
        'Missed reminder acknowledgments',
        'System-wide important updates and notices'
      ]
    },
    {
      id: 'communications',
      title: 'Communication Center',
      icon: MessageSquare,
      purpose: 'Centralized communication management for customer interactions and internal coordination',
      features: [
        'Unified communication history (emails, calls, meetings, notes)',
        'Email integration with template library',
        'Customer communication preferences and contact methods',
        'Team collaboration tools and internal messaging',
        'Communication scheduling and follow-up tracking',
        'Response tracking and customer engagement metrics',
        'Mass communication tools for announcements and marketing'
      ],
      alerts: [
        'Pending customer responses requiring follow-up',
        'Important customer communications flagged for review',
        'Communication schedule reminders'
      ]
    },
    {
      id: 'credit-notes',
      title: 'Credit Note Management',
      icon: ClipboardList,
      purpose: 'Professional credit note processing for returns, exchanges, and customer adjustments',
      features: [
        'Credit note creation with automated numbering',
        'Multiple credit reasons (return, exchange, discount, error correction)',
        'Integration with original invoices and payment history',
        'Professional PDF generation and email delivery',
        'Credit balance tracking and customer account adjustments',
        'Approval workflows for large credit amounts',
        'Credit note reporting and financial impact analysis'
      ],
      alerts: [
        'Large credit note approvals pending',
        'Credit balance utilization reminders',
        'Credit note processing confirmations'
      ]
    },
    {
      id: 'qr-codes',
      title: 'QR Code Management',
      icon: QrCode,
      purpose: 'Professional QR code generation system for inventory tracking and customer information sharing',
      features: [
        'Customizable QR code field selection (choose which gem details to include)',
        'Multiple QR code formats and sizes for different use cases',
        'Bulk QR code generation for entire inventory batches',
        'QR code scanning integration for quick inventory lookup',
        'Professional formatting with company branding options',
        'Print-ready layouts for labels and certificates',
        'Digital sharing capabilities for online catalogs',
        'QR code analytics: scan tracking and customer engagement',
        'Custom QR code templates for different gem categories',
        'Settings persistence: your preferred QR code configuration is saved permanently'
      ],
      alerts: [
        'QR code generation completion notifications',
        'Bulk operation status updates',
        'Print queue processing confirmations'
      ]
    }
  ];

  const systemFeatures = [
    {
      title: 'User Management & Security',
      features: [
        'Role-based access control (Owner, Staff, View-only)',
        'Secure authentication and session management',
        'Data privacy and GDPR compliance features',
        'Audit trails for all system activities',
        'Two-factor authentication options',
        'Regular security updates and backups'
      ]
    },
    {
      title: 'Integration & Export',
      features: [
        'CSV export for all major data types',
        'PDF generation for professional documents',
        'Email integration for direct communication',
        'API access for third-party integrations',
        'Backup and restore functionality',
        'Data migration tools'
      ]
    },
    {
      title: 'Mobile & Accessibility',
      features: [
        'Responsive design for mobile and tablet access',
        'Touch-friendly interface for in-store use',
        'Offline capability for critical functions',
        'Accessibility compliance for all users',
        'Fast loading times and optimized performance'
      ]
    }
  ];

  const workflowExamples = [
    {
      title: 'New Gem Acquisition Workflow',
      steps: [
        'Add gem to inventory with complete specifications',
        'Generate QR code for physical labeling',
        'Set up certificate tracking and documentation',
        'Configure pricing and cost information',
        'Make available for consignment or sale'
      ]
    },
    {
      title: 'Customer Sale Process',
      steps: [
        'Customer selects gems from inventory',
        'Create invoice with selected items',
        'Send professional invoice via email',
        'Record payments as they are received',
        'Automatic status updates (Draft → Sent → Paid)',
        'Generate delivery documentation'
      ]
    },
    {
      title: 'Consignment Management',
      steps: [
        'Create consignment agreement with return date',
        'Reserve gems in inventory (status changes to Reserved)',
        'Track return date and send reminders',
        'Convert to invoice if items sell',
        'Return unsold items and update inventory'
      ]
    },
    {
      title: 'Payment Collection Process',
      steps: [
        'Monitor overdue payments in Payment Dashboard',
        'Automated reminder system sends notifications',
        'Record partial or full payments',
        'Automatic invoice status updates',
        'Generate payment confirmations and receipts'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">System Help & Documentation</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] p-0">
          <Tabs defaultValue="dashboards" className="w-full">
            <div className="border-b bg-muted/30 p-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
                <TabsTrigger value="features">System Features</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboards" className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Dashboard Overview</h3>
                <p className="text-muted-foreground mb-6">
                  Each dashboard is designed for specific business functions. Click on any section below to learn more about its features and capabilities.
                </p>
              </div>
              
              {dashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                const isOpen = openSections[dashboard.id];
                
                return (
                  <Collapsible key={dashboard.id} open={isOpen} onOpenChange={() => toggleSection(dashboard.id)}>
                    <CollapsibleTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-primary" />
                              <div>
                                <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{dashboard.purpose}</p>
                              </div>
                            </div>
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <Card className="ml-8 mr-0 mt-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-green-700 mb-2">Key Features:</h4>
                              <ul className="space-y-1">
                                {dashboard.features.map((feature, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {dashboard.alerts && (
                              <div>
                                <h4 className="font-medium text-amber-700 mb-2">Alerts & Notifications:</h4>
                                <ul className="space-y-1">
                                  {dashboard.alerts.map((alert, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                                      {alert}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </TabsContent>

            <TabsContent value="features" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">System Features</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive features that power your jewelry business management.
                </p>
              </div>
              
              {systemFeatures.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="workflows" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Common Workflows</h3>
                <p className="text-muted-foreground mb-6">
                  Step-by-step guides for common business processes.
                </p>
              </div>
              
              {workflowExamples.map((workflow, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{workflow.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {workflow.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-sm text-muted-foreground flex items-start gap-3">
                          <Badge variant="outline" className="text-xs px-2 py-1 min-w-fit">
                            {stepIdx + 1}
                          </Badge>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="alerts" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Alerts & Notifications</h3>
                <p className="text-muted-foreground mb-6">
                  Automated alerts help you stay on top of your business operations.
                </p>
              </div>
              
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        Overdue payments (30+ days) requiring immediate attention
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        Consignments significantly past return dates
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        System security or data integrity issues
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-600 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Business Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        Invoice due date reminders (configurable lead time)
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        Low inventory levels below threshold
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        Customer follow-up reminders
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        Large transaction confirmations
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Operational Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Data export completion notifications
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Backup and sync status updates
                      </li>
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        System maintenance and update notifications
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};