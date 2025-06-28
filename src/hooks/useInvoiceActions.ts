
import { useState } from 'react';
import { Customer, Invoice, InvoiceItem } from '../types/customer';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { useConsignments } from './useConsignments';
import { useInvoices } from './useInvoices';
import { useGems } from './useGems';

export const useInvoiceActions = () => {
  const { updateConsignmentStatus } = useConsignments();
  const { addInvoice } = useInvoices();
  const { gems } = useGems();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInvoice = async (
    selectedCustomer: Customer | null,
    items: InvoiceItem[],
    subtotal: number,
    taxRate: number,
    taxAmount: number,
    total: number,
    notes: string,
    relatedConsignmentId: string | null,
    onSave: (invoice: Invoice) => void
  ) => {
    if (!selectedCustomer || items.length === 0) return;

    setIsSaving(true);
    
    try {
      console.log('🔄 InvoiceCreation: Preparing to save invoice');
      
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: selectedCustomer.id,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: 'draft',
        dateCreated: new Date().toISOString().split('T')[0],
        dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes,
        items: items.map(item => {
          // Check if this is a database gem (UUID format) or sample gem (numeric string)
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
          
          if (!isUuid) {
            // This is a sample gem, try to find corresponding database gem by stock ID
            const dbGem = gems.find(g => g.stockId === item.productDetails.stockId);
            if (dbGem) {
              console.log(`🔄 InvoiceCreation: Mapping sample gem ${item.productId} to database gem ${dbGem.id}`);
              return {
                gemId: dbGem.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
              };
            } else {
              console.error(`❌ InvoiceCreation: No database gem found for stock ID ${item.productDetails.stockId}`);
              throw new Error(`Gem with stock ID ${item.productDetails.stockId} not found in database. Please ensure all gems are properly imported.`);
            }
          }
          
          return {
            gemId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          };
        })
      };

      console.log('🔄 InvoiceCreation: Saving invoice data:', invoiceData);
      
      const result = await addInvoice(invoiceData);
      
      if (result.success) {
        console.log('✅ InvoiceCreation: Successfully saved invoice');
        
        // If there's a related consignment, mark it as inactive
        if (relatedConsignmentId) {
          await updateConsignmentStatus(relatedConsignmentId, 'inactive');
        }
        
        // Create the invoice object for the callback
        const invoice: Invoice = {
          id: result.data.id,
          invoiceNumber: invoiceData.invoiceNumber,
          customerId: selectedCustomer.id,
          customerDetails: selectedCustomer,
          items,
          subtotal,
          taxRate,
          taxAmount,
          total,
          status: 'draft',
          dateCreated: invoiceData.dateCreated,
          dateDue: invoiceData.dateDue,
          notes,
        };
        
        onSave(invoice);
      } else {
        console.error('❌ InvoiceCreation: Failed to save invoice:', result.error);
        alert('Failed to save invoice: ' + result.error);
      }
    } catch (error) {
      console.error('❌ InvoiceCreation: Error saving invoice:', error);
      alert('An error occurred while saving the invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const downloadInvoice = (
    selectedCustomer: Customer | null,
    items: InvoiceItem[],
    subtotal: number,
    taxRate: number,
    taxAmount: number,
    total: number,
    notes: string
  ) => {
    if (!selectedCustomer || items.length === 0) return;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerDetails: selectedCustomer,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft',
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
    };

    generateInvoicePDF(invoice);
  };

  return {
    handleSaveInvoice,
    downloadInvoice,
    isSaving,
  };
};
