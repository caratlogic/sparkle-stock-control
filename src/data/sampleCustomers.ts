
import { Customer } from '../types/customer';

export const sampleCustomers: Customer[] = [
  {
    id: '1',
    customerId: 'CUST001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    company: 'Smith Jewelry Co.',
    taxId: 'TAX123456',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    dateAdded: '2024-01-15',
    totalPurchases: 45000,
    lastPurchaseDate: '2024-06-15',
    notes: 'Frequent customer, prefers emeralds'
  },
  {
    id: '2',
    customerId: 'CUST002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0124',
    company: 'Elite Gems LLC',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    dateAdded: '2024-02-20',
    totalPurchases: 78000,
    lastPurchaseDate: '2024-06-20',
    notes: 'High-end client, interested in large diamonds'
  },
  {
    id: '3',
    customerId: 'CUST003',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0125',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    dateAdded: '2024-03-10',
    totalPurchases: 23000,
    lastPurchaseDate: '2024-05-30',
    notes: 'Collector, focuses on rare colored stones'
  }
];
