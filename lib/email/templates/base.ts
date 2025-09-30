/**
 * Base Email Template
 * Provides consistent styling and layout for all email templates
 */

export interface EmailTemplateProps {
  title: string
  content: string
  ctaText?: string
  ctaUrl?: string
  footerText?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CitizenSpace'

/**
 * Generate base HTML email template with consistent branding
 */
export function generateEmailHTML({
  title,
  content,
  ctaText,
  ctaUrl,
  footerText,
}: EmailTemplateProps): string {
  const currentYear = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title} - ${APP_NAME}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            background: #ffffff;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content p {
            color: #555555;
            font-size: 16px;
            line-height: 1.6;
            margin: 16px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);
            margin: 20px 0;
          }
          .cta-container {
            text-align: center;
            margin: 30px 0;
          }
          .divider {
            border: none;
            border-top: 1px solid #dddddd;
            margin: 30px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #999999;
            font-size: 12px;
            padding: 20px;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .content {
              padding: 30px 20px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0">
                <!-- Header -->
                <tr>
                  <td class="header">
                    <h1>${APP_NAME}</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td class="content">
                    ${content}
                    ${
                      ctaText && ctaUrl
                        ? `
                    <div class="cta-container">
                      <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
                    </div>
                    `
                        : ''
                    }
                    ${
                      footerText
                        ? `
                    <hr class="divider">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      ${footerText}
                    </p>
                    `
                        : ''
                    }
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="footer">
                    <p>&copy; ${currentYear} ${APP_NAME}. All rights reserved.</p>
                    <p>
                      <a href="${APP_URL}">Visit our website</a> |
                      <a href="${APP_URL}/contact">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

/**
 * Generate plain text version of email
 */
export function generateEmailText({
  title,
  content,
  ctaText,
  ctaUrl,
  footerText,
}: EmailTemplateProps): string {
  const currentYear = new Date().getFullYear()

  // Strip HTML tags from content
  const textContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `
${title} - ${APP_NAME}

${textContent}

${ctaText && ctaUrl ? `${ctaText}: ${ctaUrl}\n` : ''}
${footerText ? `\n${footerText}\n` : ''}

---
© ${currentYear} ${APP_NAME}. All rights reserved.
Visit our website: ${APP_URL}
Contact Support: ${APP_URL}/contact
  `.trim()
}