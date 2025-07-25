import { useState } from 'react';
import { Customer, Invoice, InvoiceItem } from '../types/customer';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { useConsignments } from './useConsignments';
import { useInvoices } from './useInvoices';
import { useGems } from './useGems';
import { useCustomerCommunications } from './useCustomerCommunications';
import { usePartners, usePartnerTransactions } from './usePartners';
import { useAssociatedEntities, useAssociatedEntityTransactions } from './useAssociatedEntities';
import { supabase } from '@/integrations/supabase/client';

export const useInvoiceActions = () => {
  const { updateConsignmentStatus } = useConsignments();
  const { addInvoice } = useInvoices();
  const { gems, updateGemStatus, updateGemQuantityForInvoice } = useGems();
  const { addCommunication } = useCustomerCommunications();
  const { partners } = usePartners();
  const { addPartnerTransaction } = usePartnerTransactions();
  const { associatedEntities } = useAssociatedEntities();
  const { addAssociatedEntityTransaction } = useAssociatedEntityTransactions();
  const [isSaving, setIsSaving] = useState(false);

  const sendInvoiceEmail = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          customerEmail: invoice.customerDetails.email,
          customerName: invoice.customerDetails.name,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDetails: {
            items: invoice.items.map(item => ({
              description: `${item.caratPurchased}ct from ${item.productDetails.totalCarat}ct total ${item.productDetails.gemType || 'Diamond'} ${item.productDetails.cut} ${item.productDetails.color} - ${item.productDetails.stockId}`,
              quantity: item.quantity,
              pricePerCarat: item.pricePerCarat,
              totalPrice: item.totalPrice
            })),
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            dateCreated: invoice.dateCreated,
            dateDue: invoice.dateDue
          },
          ownerEmail: 'owner@business.com' // Replace with actual owner email
        }
      });

      if (error) throw error;

      console.log('Invoice email sent:', data);
      
      // Add communication record
      await addCommunication({
        customerId: invoice.customerId,
        communicationType: 'email',
        subject: `Invoice ${invoice.invoiceNumber} - Diamond Inventory`,
        message: `Invoice email sent automatically for invoice ${invoice.invoiceNumber}. Total amount: $${invoice.total.toLocaleString()}`,
        senderType: 'owner',
        senderName: 'System',
        senderEmail: 'system@business.com',
        isRead: true,
        responseStatus: 'pending',
        relatedInvoiceId: invoice.id
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleSaveInvoice = async (
    selectedCustomer: Customer | null,
    items: InvoiceItem[],
    subtotal: number,
    taxRate: number,
    taxAmount: number,
    total: number,
    notes: string,
    relatedConsignmentId: string | null,
    onSave: (invoice: Invoice) => void,
    currency?: string
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
        status: 'sent',
        dateCreated: new Date().toISOString().split('T')[0],
        dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes,
        currency: currency || selectedCustomer.currency || 'USD',
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
                unitPrice: item.pricePerCarat,
                totalPrice: item.totalPrice,
                caratPurchased: item.caratPurchased
              };
            } else {
              console.error(`❌ InvoiceCreation: No database gem found for stock ID ${item.productDetails.stockId}`);
              throw new Error(`Gem with stock ID ${item.productDetails.stockId} not found in database. Please ensure all gems are properly imported.`);
            }
          }
          
          return {
            gemId: item.productId,
            quantity: item.quantity,
            unitPrice: item.pricePerCarat,
            totalPrice: item.totalPrice,
            caratPurchased: item.caratPurchased
          };
        })
      };

      console.log('🔄 InvoiceCreation: Saving invoice data:', invoiceData);
      
      const result = await addInvoice(invoiceData);
      
      if (result.success) {
        console.log('✅ InvoiceCreation: Successfully saved invoice');
        
        // Update gem quantities for invoiced gems and create partner transactions
        for (const item of items) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
          let gemId = item.productId;
          
          if (!isUuid) {
            const dbGem = gems.find(g => g.stockId === item.productDetails.stockId);
            if (dbGem) {
              gemId = dbGem.id;
            }
          }
          
          // Use the updateGemQuantityForInvoice function that handles quantities and status
          const fromConsignment = relatedConsignmentId !== null;
          await updateGemQuantityForInvoice(gemId, item.quantity, item.caratPurchased, fromConsignment);
          console.log(`✅ InvoiceCreation: Updated gem ${gemId} quantities and status for invoice`);
          
          // Check if this gem belongs to a partner and create partner transaction
          const gem = gems.find(g => g.id === gemId);
          if (gem && gem.ownershipStatus === 'P' && gem.associatedEntity && gem.associatedEntity !== 'Self') {
            const partner = partners.find(p => p.name === gem.associatedEntity);
            if (partner) {
              const partnerShare = (item.totalPrice * partner.ownership_percentage) / 100;
              
              console.log(`🔄 Creating partner transaction for gem ${gemId}, partner ${partner.name}, share: $${partnerShare}`);
              
              const partnerTransactionResult = await addPartnerTransaction({
                partner_id: partner.id,
                transaction_type: 'invoice',
                transaction_id: result.data.id,
                ownership_status: gem.ownershipStatus,
                associated_entity: gem.associatedEntity,
                revenue_amount: item.totalPrice,
                partner_share: partnerShare,
                transaction_date: invoiceData.dateCreated
              });
              
              if (partnerTransactionResult.success) {
                console.log(`✅ Partner transaction created for ${partner.name}`);
              } else {
                console.error(`❌ Failed to create partner transaction: ${partnerTransactionResult.error}`);
              }
            }
          }
          
          // Check if this gem has "Memo" ownership status and create associated entity transaction
          if (gem && gem.ownershipStatus === 'M' && gem.associatedEntity && gem.associatedEntity !== 'Self') {
            const associatedEntity = associatedEntities.find(entity => entity.name === gem.associatedEntity);
            if (associatedEntity) {
              console.log(`🔄 Creating associated entity transaction for gem ${gemId}, entity ${associatedEntity.name}, revenue: $${item.totalPrice}`);
              
              const entityTransactionResult = await addAssociatedEntityTransaction({
                associated_entity_id: associatedEntity.id,
                associated_entity_name: associatedEntity.name,
                transaction_type: 'invoice',
                transaction_id: result.data.id,
                ownership_status: gem.ownershipStatus,
                revenue_amount: item.totalPrice,
                transaction_date: invoiceData.dateCreated
              });
              
              if (entityTransactionResult.success) {
                console.log(`✅ Associated entity transaction created for ${associatedEntity.name}`);
              } else {
                console.error(`❌ Failed to create associated entity transaction: ${entityTransactionResult.error}`);
              }
            }
          }
        }
        
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
          status: 'sent',
          dateCreated: invoiceData.dateCreated,
          dateDue: invoiceData.dateDue,
          notes,
          currency: currency || selectedCustomer.currency || 'USD',
        };
        
        // Send email notification
        const emailResult = await sendInvoiceEmail(invoice);
        if (!emailResult.success) {
          console.warn('Failed to send invoice email:', emailResult.error);
          // Don't fail the entire operation if email fails
        }
        
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
    notes: string,
    currency?: string
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
      status: 'sent',
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
      currency: currency || selectedCustomer.currency || 'USD',
    };

    generateInvoicePDF(invoice);
  };

  return {
    handleSaveInvoice,
    downloadInvoice,
    isSaving,
  };
};