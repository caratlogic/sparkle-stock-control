
import { useState } from 'react';
import { Customer, Consignment, InvoiceItem } from '../types/customer';
import { useConsignments } from './useConsignments';
import { useGems } from './useGems';
import { useCustomerCommunications } from './useCustomerCommunications';
import { supabase } from '@/integrations/supabase/client';

export const useConsignmentActions = () => {
  const { addConsignment } = useConsignments();
  const { gems, updateGemStatus } = useGems();
  const { addCommunication } = useCustomerCommunications();
  const [isSaving, setIsSaving] = useState(false);

  const sendConsignmentEmail = async (consignment: Consignment) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-consignment-email', {
        body: {
          customerEmail: consignment.customerDetails.email,
          customerName: consignment.customerDetails.name,
          consignmentNumber: consignment.consignmentNumber,
          consignmentDetails: {
            items: consignment.items.map(item => ({
              description: `${item.productDetails.carat}ct ${item.productDetails.gemType || 'Diamond'} ${item.productDetails.cut} ${item.productDetails.color} - ${item.productDetails.stockId}`,
              quantity: item.quantity,
              estimatedValue: item.totalPrice
            })),
            returnDate: consignment.returnDate,
            dateCreated: consignment.dateCreated,
            notes: consignment.notes
          },
          ownerEmail: 'owner@business.com' // Replace with actual owner email
        }
      });

      if (error) throw error;

      console.log('Consignment email sent:', data);
      
      // Add communication record
      await addCommunication({
        customerId: consignment.customerId,
        communicationType: 'email',
        subject: `Consignment Agreement ${consignment.consignmentNumber} - Diamond Inventory`,
        message: `Consignment agreement email sent automatically for consignment ${consignment.consignmentNumber}. Return date: ${new Date(consignment.returnDate).toLocaleDateString()}`,
        senderType: 'owner',
        senderName: 'System',
        senderEmail: 'system@business.com',
        isRead: true,
        responseStatus: 'pending',
        relatedConsignmentId: consignment.id
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error sending consignment email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleSaveConsignment = async (
    selectedCustomer: Customer | null,
    items: InvoiceItem[],
    returnDate: string,
    notes: string,
    onSave: (consignment: Consignment) => void
  ) => {
    if (!selectedCustomer || items.length === 0 || !returnDate) return;

    setIsSaving(true);
    
    try {
      console.log('🔄 ConsignmentCreation: Preparing to save consignment');
      
      const consignmentData = {
        consignmentNumber: `CON-${Date.now()}`,
        customerId: selectedCustomer.id,
        status: 'pending',
        dateCreated: new Date().toISOString().split('T')[0],
        returnDate,
        notes,
        items: items.map(item => {
          // Check if this is a database gem (UUID format) or sample gem (numeric string)
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
          
          if (!isUuid) {
            // This is a sample gem, try to find corresponding database gem by stock ID
            const dbGem = gems.find(g => g.stockId === item.productDetails.stockId);
            if (dbGem) {
              console.log(`🔄 ConsignmentCreation: Mapping sample gem ${item.productId} to database gem ${dbGem.id}`);
              return {
                gemId: dbGem.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
              };
            } else {
              console.error(`❌ ConsignmentCreation: No database gem found for stock ID ${item.productDetails.stockId}`);
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

      console.log('🔄 ConsignmentCreation: Saving consignment data:', consignmentData);
      
      const result = await addConsignment(consignmentData);
      
      if (result.success) {
        console.log('✅ ConsignmentCreation: Successfully saved consignment');
        
        // Update gem statuses to 'Reserved' for consigned gems
        for (const item of items) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
          let gemId = item.productId;
          
          if (!isUuid) {
            const dbGem = gems.find(g => g.stockId === item.productDetails.stockId);
            if (dbGem) {
              gemId = dbGem.id;
            }
          }
          
          await updateGemStatus(gemId, 'Reserved');
          console.log(`✅ ConsignmentCreation: Updated gem ${gemId} status to Reserved`);
        }
        
        // Create the consignment object for the callback with proper ConsignmentItem structure
        const consignmentItems = items.map(item => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          gemId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productDetails: item.productDetails
        }));
        
        const consignment: Consignment = {
          id: result.data.id,
          consignmentNumber: consignmentData.consignmentNumber,
          customerId: selectedCustomer.id,
          customerDetails: selectedCustomer,
          items: consignmentItems,
          status: 'pending',
          dateCreated: consignmentData.dateCreated,
          returnDate,
          notes,
        };
        
        // Send email notification
        const emailResult = await sendConsignmentEmail(consignment);
        if (!emailResult.success) {
          console.warn('Failed to send consignment email:', emailResult.error);
          // Don't fail the entire operation if email fails
        }
        
        onSave(consignment);
      } else {
        console.error('❌ ConsignmentCreation: Failed to save consignment:', result.error);
        alert('Failed to save consignment: ' + result.error);
      }
    } catch (error) {
      console.error('❌ ConsignmentCreation: Error saving consignment:', error);
      alert('An error occurred while saving the consignment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSaveConsignment,
    isSaving,
  };
};
