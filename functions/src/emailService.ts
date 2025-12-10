import * as nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

let defaultTransporter: nodemailer.Transporter;
let deliveriesTransporter: nodemailer.Transporter;

/**
 * Initialize email transporter with your domain's mail configuration
 * Configure environment variables in Firebase Functions settings:
 * - MAIL_HOST: Your mail server host (e.g., mail.yourdomain.com)
 * - MAIL_PORT: SMTP port (usually 587 or 465)
 * - MAIL_USER: Email username (noreply account)
 * - MAIL_PASSWORD: Email password
 * - MAIL_FROM: From email address
 * - DELIVERIES_MAIL_USER: Deliveries email username
 * - DELIVERIES_MAIL_PASSWORD: Deliveries email password
 */
export function initializeEmailService(): nodemailer.Transporter {
  if (defaultTransporter) {
    return defaultTransporter;
  }

  const config: EmailConfig = {
    host: process.env.MAIL_HOST || 'mail.yourdomain.com',
    port: parseInt(process.env.MAIL_PORT || '465', 10),
    secure: process.env.MAIL_SECURE === 'true' || true,
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASSWORD || '',
    },
    from: process.env.MAIL_FROM || 'noreply@yourdomain.com',
  };

  defaultTransporter = nodemailer.createTransport(config);
  return defaultTransporter;
}

/**
 * Initialize deliveries-specific email transporter
 * Used for delivery status update notifications
 */
export function initializeDeliveriesEmailService(): nodemailer.Transporter {
  if (deliveriesTransporter) {
    return deliveriesTransporter;
  }

  const config: EmailConfig = {
    host: process.env.MAIL_HOST || 'mail.yourdomain.com',
    port: parseInt(process.env.MAIL_PORT || '465', 10),
    secure: process.env.MAIL_SECURE === 'true' || true,
    auth: {
      user: process.env.DELIVERIES_MAIL_USER || process.env.MAIL_USER || '',
      pass: process.env.DELIVERIES_MAIL_PASSWORD || process.env.MAIL_PASSWORD || '',
    },
    from: process.env.DELIVERIES_MAIL_FROM || 'deliveries@yourdomain.com',
  };

  deliveriesTransporter = nodemailer.createTransport(config);
  return deliveriesTransporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  emailType: 'default' | 'deliveries' = 'default'
): Promise<boolean> {
  try {
    const emailTransporter = emailType === 'deliveries' 
      ? initializeDeliveriesEmailService() 
      : initializeEmailService();
    
    const fromEmail = emailType === 'deliveries'
      ? (process.env.DELIVERIES_MAIL_FROM || 'deliveries@yourdomain.com')
      : (process.env.MAIL_FROM || 'noreply@yourdomain.com');

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
}

export function getTransporter(): nodemailer.Transporter {
  return initializeEmailService();
}
