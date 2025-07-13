import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GemInventoryEmailRequest {
  to: string;
  customerName: string;
  subject: string;
  message: string;
  gems: Array<{
    stockId: string;
    gemType: string;
    carat: number;
    cut: string;
    color: string;
    measurements: string;
    price: number;
    description: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, customerName, subject, message, gems }: GemInventoryEmailRequest = await req.json();

    console.log(`Sending gem inventory email to: ${to}`);

    const gemRows = gems.map(gem => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${gem.stockId}</td>
        <td style="padding: 12px; text-align: left;">${gem.gemType}</td>
        <td style="padding: 12px; text-align: center;">${gem.carat} ct</td>
        <td style="padding: 12px; text-align: left;">${gem.cut}</td>
        <td style="padding: 12px; text-align: left;">${gem.color}</td>
        <td style="padding: 12px; text-align: left;">${gem.measurements}</td>
        <td style="padding: 12px; text-align: right;">$${gem.price.toLocaleString()}</td>
        <td style="padding: 12px; text-align: left;">${gem.description}</td>
      </tr>
    `).join('');

    const totalValue = gems.reduce((sum, gem) => sum + gem.price, 0);

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937;">Selected Gem Inventory</h1>
          <p style="color: #6b7280;">Dear ${customerName},</p>
        </div>

        <div style="margin-bottom: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Stock ID</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Type</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Carat</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Cut</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Color</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Measurements</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Price</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: bold;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${gemRows}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #1f2937; color: white; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 16px; font-weight: bold;">
            Total Gems: ${gems.length} | Total Value: $${totalValue.toLocaleString()}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Please contact us if you have any questions about these gems or would like to schedule a viewing.
          </p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
            Thank you for your interest in our collection.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Gem Inventory <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHTML,
    });

    console.log("Gem inventory email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-gem-inventory-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);