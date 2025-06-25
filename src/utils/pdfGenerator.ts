
import { Invoice, Consignment } from '../types/customer';

export const generateInvoicePDF = (invoice: Invoice) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 32px; 
          font-weight: bold; 
          color: #1e293b; 
          margin-bottom: 5px;
        }
        .document-title { 
          font-size: 24px; 
          color: #475569; 
          margin: 0;
        }
        .invoice-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .invoice-details, .customer-details { 
          width: 48%; 
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #1e293b; 
          margin-bottom: 10px; 
          border-bottom: 1px solid #e2e8f0; 
          padding-bottom: 5px;
        }
        .detail-row { 
          margin-bottom: 5px; 
          font-size: 14px;
        }
        .label { 
          font-weight: bold; 
          color: #475569;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th { 
          background-color: #f1f5f9; 
          padding: 12px; 
          border: 1px solid #e2e8f0; 
          text-align: left; 
          font-weight: bold; 
          color: #1e293b;
        }
        td { 
          padding: 12px; 
          border: 1px solid #e2e8f0; 
          vertical-align: top;
        }
        tr:nth-child(even) { 
          background-color: #f8fafc; 
        }
        .totals { 
          margin-top: 30px; 
          text-align: right;
        }
        .totals table { 
          width: 300px; 
          margin-left: auto; 
          box-shadow: none;
        }
        .total-row { 
          font-weight: bold; 
          font-size: 18px; 
          background-color: #1e293b !important; 
          color: white;
        }
        .notes { 
          margin-top: 30px; 
          padding: 20px; 
          background-color: #f8fafc; 
          border-left: 4px solid #3b82f6;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-size: 12px; 
          color: #64748b; 
          border-top: 1px solid #e2e8f0; 
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Diamond Inventory</div>
        <div class="document-title">INVOICE</div>
      </div>
      
      <div class="invoice-info">
        <div class="invoice-details">
          <div class="section-title">Invoice Details</div>
          <div class="detail-row"><span class="label">Invoice Number:</span> ${invoice.invoiceNumber}</div>
          <div class="detail-row"><span class="label">Date Created:</span> ${new Date(invoice.dateCreated).toLocaleDateString()}</div>
          <div class="detail-row"><span class="label">Due Date:</span> ${new Date(invoice.dateDue).toLocaleDateString()}</div>
          <div class="detail-row"><span class="label">Status:</span> ${invoice.status}</div>
        </div>

        <div class="customer-details">
          <div class="section-title">Bill To</div>
          <div class="detail-row"><strong>${invoice.customerDetails.name}</strong></div>
          <div class="detail-row">${invoice.customerDetails.email}</div>
          <div class="detail-row">${invoice.customerDetails.phone}</div>
          ${invoice.customerDetails.company ? `<div class="detail-row">${invoice.customerDetails.company}</div>` : ''}
          <div class="detail-row">${invoice.customerDetails.address.street}</div>
          <div class="detail-row">${invoice.customerDetails.address.city}, ${invoice.customerDetails.address.state} ${invoice.customerDetails.address.zipCode}</div>
          ${invoice.customerDetails.address.country ? `<div class="detail-row">${invoice.customerDetails.address.country}</div>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td><strong>${item.productDetails.stockId}</strong></td>
              <td>
                ${item.productDetails.carat}ct ${item.productDetails.gemType || 'Diamond'} ${item.productDetails.cut}<br>
                <small>Color: ${item.productDetails.color} | Clarity: ${item.productDetails.clarity}</small><br>
                <small>Certificate: ${item.productDetails.certificateNumber}</small>
              </td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toLocaleString()}</td>
              <td>$${item.totalPrice.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td>$${invoice.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Tax (${invoice.taxRate}%):</strong></td>
            <td>$${invoice.taxAmount.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total:</strong></td>
            <td><strong>$${invoice.total.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <div class="section-title">Notes</div>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoice.invoiceNumber}.html`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const generateConsignmentPDF = (consignment: Consignment) => {
  const consignmentHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Consignment ${consignment.consignmentNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 32px; 
          font-weight: bold; 
          color: #1e293b; 
          margin-bottom: 5px;
        }
        .document-title { 
          font-size: 24px; 
          color: #7c3aed; 
          margin: 0;
        }
        .consignment-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .consignment-details, .customer-details { 
          width: 48%; 
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #1e293b; 
          margin-bottom: 10px; 
          border-bottom: 1px solid #e2e8f0; 
          padding-bottom: 5px;
        }
        .detail-row { 
          margin-bottom: 5px; 
          font-size: 14px;
        }
        .label { 
          font-weight: bold; 
          color: #475569;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th { 
          background-color: #f3e8ff; 
          padding: 12px; 
          border: 1px solid #e2e8f0; 
          text-align: left; 
          font-weight: bold; 
          color: #1e293b;
        }
        td { 
          padding: 12px; 
          border: 1px solid #e2e8f0; 
          vertical-align: top;
        }
        tr:nth-child(even) { 
          background-color: #faf5ff; 
        }
        .status-badge { 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: bold;
        }
        .status-pending { 
          background-color: #fef3c7; 
          color: #92400e;
        }
        .status-returned { 
          background-color: #fee2e2; 
          color: #991b1b;
        }
        .status-purchased { 
          background-color: #d1fae5; 
          color: #065f46;
        }
        .notes { 
          margin-top: 30px; 
          padding: 20px; 
          background-color: #f8fafc; 
          border-left: 4px solid #7c3aed;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-size: 12px; 
          color: #64748b; 
          border-top: 1px solid #e2e8f0; 
          padding-top: 20px;
        }
        .important-notice { 
          margin-top: 30px; 
          padding: 15px; 
          background-color: #fef3c7; 
          border: 1px solid #f59e0b; 
          border-radius: 4px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Diamond Inventory</div>
        <div class="document-title">CONSIGNMENT AGREEMENT</div>
      </div>
      
      <div class="consignment-info">
        <div class="consignment-details">
          <div class="section-title">Consignment Details</div>
          <div class="detail-row"><span class="label">Consignment Number:</span> ${consignment.consignmentNumber}</div>
          <div class="detail-row"><span class="label">Date Created:</span> ${new Date(consignment.dateCreated).toLocaleDateString()}</div>
          <div class="detail-row"><span class="label">Return Date:</span> ${new Date(consignment.returnDate).toLocaleDateString()}</div>
          <div class="detail-row">
            <span class="label">Status:</span> 
            <span class="status-badge status-${consignment.status}">${consignment.status.toUpperCase()}</span>
          </div>
        </div>

        <div class="customer-details">
          <div class="section-title">Customer Information</div>
          <div class="detail-row"><strong>${consignment.customerDetails.name}</strong></div>
          <div class="detail-row">${consignment.customerDetails.email}</div>
          <div class="detail-row">${consignment.customerDetails.phone}</div>
          ${consignment.customerDetails.company ? `<div class="detail-row">${consignment.customerDetails.company}</div>` : ''}
          <div class="detail-row">${consignment.customerDetails.address.street}</div>
          <div class="detail-row">${consignment.customerDetails.address.city}, ${consignment.customerDetails.address.state} ${consignment.customerDetails.address.zipCode}</div>
          ${consignment.customerDetails.address.country ? `<div class="detail-row">${consignment.customerDetails.address.country}</div>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Retail Value</th>
          </tr>
        </thead>
        <tbody>
          ${consignment.items.map(item => `
            <tr>
              <td><strong>${item.productDetails.stockId}</strong></td>
              <td>
                ${item.productDetails.carat}ct ${item.productDetails.gemType || 'Diamond'} ${item.productDetails.cut}<br>
                <small>Color: ${item.productDetails.color} | Clarity: ${item.productDetails.clarity}</small><br>
                <small>Certificate: ${item.productDetails.certificateNumber}</small>
              </td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="important-notice">
        <strong>Important Notice:</strong> This is a consignment agreement. The items listed above are provided for evaluation purposes only. 
        The customer has until ${new Date(consignment.returnDate).toLocaleDateString()} to decide whether to purchase or return the items.
      </div>

      ${consignment.notes ? `
        <div class="notes">
          <div class="section-title">Notes</div>
          <p>${consignment.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Please contact us if you have any questions about this consignment.</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([consignmentHTML], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consignment-${consignment.consignmentNumber}.html`;
  a.click();
  window.URL.revokeObjectURL(url);
};
