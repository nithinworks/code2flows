import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, credits, amount } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "CodetoFlows <notifications@codetoflows.com>",
      to: email,
      subject: "Credits Purchase Successful! - CodetoFlows",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credits Purchase Successful!</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #fbf9f6;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#fbf9f6">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: white; border-radius: 8px; border: 2px solid #001e2b; padding: 32px;">
                    <tr>
                      <td align="center">
                        <img src="https://www.codetoflows.com/favicon.png" alt="CodetoFlows Logo" width="100" style="margin-bottom: 24px;">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h1 style="color: #001e2b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">
                          Thank you for your purchase!
                        </h1>
                        <div style="background-color: #00ed6410; border: 2px solid #00ed64; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                          <p style="color: #001e2b; font-size: 16px; margin: 0 0 16px 0; text-align: center;">
                            Your account has been credited with:
                          </p>
                          <p style="color: #001e2b; font-size: 32px; font-weight: 600; margin: 0; text-align: center;">
                            ${credits} credits
                          </p>
                        </div>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 16px; border-bottom: 1px solid #001e2b20;">
                              <span style="color: #001e2b99; font-size: 14px;">Amount Paid</span>
                            </td>
                            <td align="right" style="padding: 16px; border-bottom: 1px solid #001e2b20;">
                              <span style="color: #001e2b; font-size: 14px; font-weight: 500;">$${(
                                amount / 100
                              ).toFixed(2)}</span>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #001e2b; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                          Happy diagramming! Start creating your diagrams now.
                        </p>
                        <div style="text-align: center;">
                          <a href="${
                            process.env.NEXT_PUBLIC_BASE_URL
                          }" style="display: inline-block; background-color: #001e2b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
                            Go to Website
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 32px; text-align: center; color: #001e2b99; font-size: 14px;">
                        <p style="margin: 0 0 8px 0;">
                          CodetoFlows Team
                        </p>
                        <a href="${
                          process.env.NEXT_PUBLIC_BASE_URL
                        }" style="color: #065828; text-decoration: none;">
                          www.codetoflows.com
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
