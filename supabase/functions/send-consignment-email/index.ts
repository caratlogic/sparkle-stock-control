
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConsignmentEmailRequest {
  customerEmail: string;
  customerName: string;
  consignmentNumber: string;
  consignmentDetails: {
    items: Array<{
      description: string;
      quantity: number;
      estimatedValue: number;
    }>;
    returnDate: string;
    dateCreated: string;
    notes?: string;
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
    const { customerEmail, customerName, consignmentNumber, consignmentDetails, ownerEmail }: ConsignmentEmailRequest = await req.json();

    // Generate consignment HTML
    const consignmentHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Consignment Agreement ${consignmentNumber}</h1>
        
        <div style="margin: 20px 0;">
          <h3>Dear ${customerName},</h3>
          <p>Thank you for choosing our consignment service. Please find your consignment agreement details below:</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item Description</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Estimated Value</th>
            </tr>
          </thead>
          <tbody>
            ${consignmentDetails.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.estimatedValue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin: 30px 0;">
          <p><strong>Consignment Date:</strong> ${new Date(consignmentDetails.dateCreated).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(consignmentDetails.returnDate).toLocaleDateString()}</p>
        </div>

        ${consignmentDetails.notes ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <h4>Additional Notes:</h4>
            <p>${consignmentDetails.notes}</p>
          </div>
        ` : ''}

        <div style="margin: 30px 0; padding: 20px; background-color: #e8f4fd; border-radius: 5px;">
          <h4>Important Terms:</h4>
          <ul>
            <li>Items must be returned by the specified return date in original condition</li>
            <li>You are responsible for the security and care of items during the consignment period</li>
            <li>Any damage or loss will be charged at full replacement value</li>
          </ul>
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
      subject: `Consignment Agreement ${consignmentNumber} - Diamond Inventory`,
      html: consignmentHTML,
    });

    // Send notification to owner if provided
    let ownerEmailResponse = null;
    if (ownerEmail) {
      ownerEmailResponse = await resend.emails.send({
        from: "Diamond Inventory <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New Consignment Created: ${consignmentNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Consignment Created</h2>
            <p><strong>Consignment Number:</strong> ${consignmentNumber}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Return Date:</strong> ${new Date(consignmentDetails.returnDate).toLocaleDateString()}</p>
            <p><strong>Date Created:</strong> ${new Date(consignmentDetails.dateCreated).toLocaleDateString()}</p>
            <hr/>
            ${consignmentHTML}
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
    console.error("Error sending consignment email:", error);
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
