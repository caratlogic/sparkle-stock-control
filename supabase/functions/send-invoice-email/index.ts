
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDetails: {
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    taxAmount: number;
    total: number;
    dateCreated: string;
    dateDue: string;
  };
  ownerEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.log("RESEND_API_KEY not configured - email sending disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add RESEND_API_KEY." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(apiKey);
    const { customerEmail, customerName, invoiceNumber, invoiceDetails, ownerEmail }: InvoiceEmailRequest = await req.json();

    // Generate invoice HTML
    const invoiceHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Invoice ${invoiceNumber}</h1>
        
        <div style="margin: 20px 0;">
          <h3>Dear ${customerName},</h3>
          <p>Thank you for your purchase. Please find your invoice details below:</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Unit Price</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceDetails.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.totalPrice.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin: 20px 0;">
          <p><strong>Subtotal: $${invoiceDetails.subtotal.toLocaleString()}</strong></p>
          <p><strong>Tax: $${invoiceDetails.taxAmount.toLocaleString()}</strong></p>
          <p style="font-size: 18px;"><strong>Total: $${invoiceDetails.total.toLocaleString()}</strong></p>
        </div>

        <div style="margin: 30px 0;">
          <p><strong>Invoice Date:</strong> ${new Date(invoiceDetails.dateCreated).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoiceDetails.dateDue).toLocaleDateString()}</p>
        </div>

        <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <p>Thank you for your business! If you have any questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    `;

    // Send email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Diamond Inventory <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Invoice ${invoiceNumber} - Diamond Inventory`,
      html: invoiceHTML,
    });

    // Send notification to owner if provided
    let ownerEmailResponse = null;
    if (ownerEmail) {
      ownerEmailResponse = await resend.emails.send({
        from: "Diamond Inventory <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New Invoice Created: ${invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Invoice Created</h2>
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Total Amount:</strong> $${invoiceDetails.total.toLocaleString()}</p>
            <p><strong>Date Created:</strong> ${new Date(invoiceDetails.dateCreated).toLocaleDateString()}</p>
            <hr/>
            ${invoiceHTML}
          </div>
        `,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmailId: customerEmailResponse.data?.id,
        ownerEmailId: ownerEmailResponse?.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
