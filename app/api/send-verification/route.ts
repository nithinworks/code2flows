import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();

    // Create verification token
    const token = Buffer.from(userId).toString("base64");
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: "CodetoFlows <notifications@codetoflows.com>",
      to: email,
      subject: "Verify your email - CodetoFlows",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verify your email</title>
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
                          Verify your email address
                        </h1>
                        <p style="color: #001e2b; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                          Click the button below to verify your email address and start generating diagrams.
                        </p>
                        <div style="text-align: center;">
                          <a href="${verificationLink}" style="display: inline-block; background-color: #001e2b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
                            Verify Email
                          </a>
                        </div>
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
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
