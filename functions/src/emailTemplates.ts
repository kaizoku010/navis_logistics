/**
 * Email templates for different notification types
 */

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcomeEmail: (userName: string, company: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Navis Logistics</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Welcome to Navis! We're excited to have <strong>${company}</strong> on board.</p>
              <p>You can now:</p>
              <ul>
                <li>Create and manage shipments</li>
                <li>Track deliveries in real-time</li>
                <li>Manage your fleet and drivers</li>
                <li>Access detailed analytics and reports</li>
              </ul>
              <a href="${process.env.APP_URL || 'https://navis.yourdomain.com'}" class="button">Go to Dashboard</a>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Delivery assigned notification
   */
  deliveryAssignedEmail: (
    customerName: string,
    deliveryId: string,
    transporter: string,
    estimatedDelivery: string,
    trackingUrl: string
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .info-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Delivery is on the Way!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>Great news! Your delivery has been assigned to a transporter.</p>
              
              <div class="info-box">
                <p><strong>Delivery ID:</strong> ${deliveryId}</p>
                <p><strong>Transporter:</strong> ${transporter}</p>
                <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
              </div>
              
              <p>You can track your shipment in real-time using the link below:</p>
              <a href="${trackingUrl}" class="button">Track Your Delivery</a>
              
              <p>We'll keep you updated every step of the way.</p>
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Delivery in transit notification
   */
  deliveryInTransitEmail: (
    customerName: string,
    deliveryId: string,
    driverName: string,
    driverPhone: string,
    trackingUrl: string
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .info-box { background: #fff3e0; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Package is in Transit!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>Your delivery is now on its way to you!</p>
              
              <div class="info-box">
                <p><strong>Delivery ID:</strong> ${deliveryId}</p>
                <p><strong>Driver:</strong> ${driverName}</p>
                <p><strong>Contact:</strong> ${driverPhone}</p>
              </div>
              
              <p>Track your package in real-time:</p>
              <a href="${trackingUrl}" class="button">Live Tracking</a>
              
              <p>Estimated arrival today. Our driver will contact you with more details.</p>
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Delivery completed notification
   */
  deliveryCompletedEmail: (
    customerName: string,
    deliveryId: string,
    completionTime: string,
    feedbackUrl: string
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: #333; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .success-box { background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Delivery Completed!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>Your delivery has been successfully completed!</p>
              
              <div class="success-box">
                <p><strong>Delivery ID:</strong> ${deliveryId}</p>
                <p><strong>Completed at:</strong> ${completionTime}</p>
              </div>
              
              <p>We'd love to hear about your experience. Your feedback helps us improve:</p>
              <a href="${feedbackUrl}" class="button">Share Feedback</a>
              
              <p>Thank you for choosing Navis Logistics!</p>
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Password reset email
   */
  passwordResetEmail: (userName: string, resetLink: string, expiryTime: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .warning { background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <p>This link will expire in ${expiryTime}. If you didn't request this, please ignore this email.</p>
              </div>
              
              <p>If the button doesn't work, copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px;">${resetLink}</p>
              
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Driver assignment notification
   */
  driverAssignmentEmail: (
    driverName: string,
    deliveryId: string,
    pickupLocation: string,
    deliveryLocation: string,
    estimatedKm: number,
    estimatedEarnings: string
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Delivery Assignment</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${driverName}</strong>,</p>
              <p>You have a new delivery assignment!</p>
              
              <div class="info-box">
                <p><strong>Delivery ID:</strong> ${deliveryId}</p>
                <p><strong>Pickup:</strong> ${pickupLocation}</p>
                <p><strong>Delivery Location:</strong> ${deliveryLocation}</p>
                <p><strong>Estimated Distance:</strong> ${estimatedKm} km</p>
                <p><strong>Estimated Earnings:</strong> ${estimatedEarnings}</p>
              </div>
              
              <p>Log in to your driver app to view details and accept the assignment.</p>
              <a href="${process.env.APP_URL || 'https://navis.yourdomain.com'}/driver" class="button">View Assignment</a>
              
              <p>Best regards,<br/>The Navis Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Navis Logistics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};
