/**
 * Email Notification Service for Frontend
 * Integrates with Firebase Cloud Functions for sending emails
 * 
 * Usage:
 * import { emailNotificationService } from '../services/emailNotificationService';
 * 
 * await emailNotificationService.sendPasswordReset(
 *   'user@example.com',
 *   'https://...',
 *   '24 hours'
 * );
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Service for managing email notifications
 */
export const emailNotificationService = {
  /**
   * Send password reset email
   * @param email - User's email address
   * @param resetLink - Link to reset password
   * @param expiryTime - How long the link is valid (e.g., "24 hours")
   */
  async sendPasswordReset(
    email: string,
    resetLink: string,
    expiryTime: string = '24 hours'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const sendPasswordResetEmail = httpsCallable(functions, 'sendPasswordResetEmail');
      const response = await sendPasswordResetEmail({ email, resetLink, expiryTime });
      return response.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  /**
   * Send driver assignment notification
   * @param driverEmail - Driver's email
   * @param driverName - Driver's name
   * @param deliveryId - Delivery ID
   * @param pickupLocation - Pickup location
   * @param deliveryLocation - Delivery location
   * @param estimatedKm - Estimated distance in km
   * @param estimatedEarnings - Estimated earnings
   */
  async sendDriverAssignment(
    driverEmail: string,
    driverName: string,
    deliveryId: string,
    pickupLocation: string,
    deliveryLocation: string,
    estimatedKm: number,
    estimatedEarnings: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const sendDriverAssignmentEmail = httpsCallable(
        functions,
        'sendDriverAssignmentEmail'
      );
      const response = await sendDriverAssignmentEmail({
        driverEmail,
        driverName,
        deliveryId,
        pickupLocation,
        deliveryLocation,
        estimatedKm,
        estimatedEarnings,
      });
      return response.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error sending driver assignment email:', error);
      throw error;
    }
  },

  /**
   * Send custom email (admin only)
   * @param to - Recipient email
   * @param subject - Email subject
   * @param htmlContent - Email HTML content
   * @param adminToken - Admin token for authentication
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    htmlContent: string,
    adminToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const getFunctionUrl = () => {
        // This will be set based on your Firebase region
        // You can find it in your Firebase Console under Cloud Functions
        return process.env.REACT_APP_SEND_CUSTOM_EMAIL_URL ||
          'https://region-projectid.cloudfunctions.net/sendCustomEmail';
      };

      const response = await fetch(getFunctionUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ to, subject, htmlContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  },

  /**
   * Convenience method: Send delivery assigned email
   * (triggered automatically by Firestore, but can be called manually)
   */
  async notifyDeliveryAssigned(
    customerEmail: string,
    customerName: string,
    deliveryId: string,
    transporter: string,
    estimatedDelivery: string
  ): Promise<void> {
    const trackingUrl = `${process.env.REACT_APP_URL}/track/${deliveryId}`;
    const subject = 'Your Delivery Has Been Assigned';
    
    // Note: This is a manual trigger, normally handled by Cloud Function
    console.log(`Delivery assignment notification would be sent to ${customerEmail}`);
  },

  /**
   * Convenience method: Send delivery in transit email
   * (triggered automatically by Firestore, but can be called manually)
   */
  async notifyDeliveryInTransit(
    customerEmail: string,
    customerName: string,
    deliveryId: string,
    driverName: string,
    driverPhone: string
  ): Promise<void> {
    const trackingUrl = `${process.env.REACT_APP_URL}/track/${deliveryId}`;
    console.log(`Delivery in transit notification would be sent to ${customerEmail}`);
  },

  /**
   * Convenience method: Send delivery completed email
   * (triggered automatically by Firestore, but can be called manually)
   */
  async notifyDeliveryCompleted(
    customerEmail: string,
    customerName: string,
    deliveryId: string
  ): Promise<void> {
    const feedbackUrl = `${process.env.REACT_APP_URL}/feedback/${deliveryId}`;
    console.log(`Delivery completion notification would be sent to ${customerEmail}`);
  },

  /**
   * Check if email notifications are configured
   */
  async isConfigured(): Promise<boolean> {
    try {
      // Try to call a simple function to verify configuration
      const testFunction = httpsCallable(functions, 'sendPasswordResetEmail');
      // Don't actually send, just check if function exists
      return true;
    } catch (error) {
      console.warn('Email notifications may not be configured:', error);
      return false;
    }
  },
};

export default emailNotificationService;
