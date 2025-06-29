
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { PaymentSummary } from '../../types/payment';

interface PaymentSummaryCardsProps {
  summary: PaymentSummary;
  loading: boolean;
}

export const PaymentSummaryCards = ({ summary, loading }: PaymentSummaryCardsProps) => {
  const cards = [
    {
      title: 'Total Amount Received',
      value: summary.totalReceived,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Pending Payments',
      value: summary.pendingPayments,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      format: 'currency'
    },
    {
      title: 'Overdue Payments',
      value: summary.overduePayments,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      format: 'currency'
    },
    {
      title: 'Total Refunds Issued',
      value: summary.totalRefunds,
      icon: RefreshCw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      format: 'currency'
    }
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {loading ? (
                <div className="animate-pulse bg-slate-200 h-8 w-24 rounded"></div>
              ) : (
                formatValue(card.value, card.format)
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
