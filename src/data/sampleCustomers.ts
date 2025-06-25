
import { Customer } from '../types/customer';

export const sampleCustomers: Customer[] = [
  {
    id: '1',
    customerId: 'CUST001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    company: 'Smith Jewelry Co.',
    taxId: 'TAX123456',
    dateAdded: '2024-01-15',
    totalPurchases: 45000,
    lastPurchaseDate: '2024-06-15',
    notes: 'Preferred customer, bulk orders'
  },
  {
    id: '2',
    customerId: 'CUST002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 987-6543',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    company: 'Elegant Gems LLC',
    taxId: 'TAX789012',
    dateAdded: '2024-02-20',
    totalPurchases: 28000,
    lastPurchaseDate: '2024-06-10',
    notes: 'Specialty in rare diamonds'
  },
  {
    id: '3',
    customerId: 'CUST003',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 456-7890',
    address: {
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    dateAdded: '2024-03-10',
    totalPurchases: 15000,
    lastPurchaseDate: '2024-05-20',
    notes: 'Individual collector'
  }
];
