import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from './emailService';
import { emailTemplates } from './emailTemplates';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Trigger email when a user is created
 * Firestore trigger: onCreate on 'users' collection
 */
export const sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap) => {
    try {
      const userData = snap.data();
      const { email, username, company } = userData;

      if (!email) {
        console.warn('User created without email:', snap.id);
        return;
      }

      const htmlContent = emailTemplates.welcomeEmail(username, company);
      await sendEmail(
        email,
        'Welcome to Navis Logistics!',
        htmlContent
      );

      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  });

/**
 * Trigger email when a delivery status changes
 * Firestore trigger: onUpdate on 'deliveries' collection
 */
export const sendDeliveryStatusEmail = functions.firestore
  .document('deliveries/{deliveryId}')
  .onUpdate(async (change) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const deliveryId = change.after.id;

      // Only send if status changed
      if (beforeData.status === afterData.status) {
        return;
      }

      const newStatus = afterData.status;
      const customerEmail = afterData.customerEmail || afterData.email;
      const customerName = afterData.customerName || afterData.name || 'Valued Customer';
      const trackingUrl = `${process.env.APP_URL || 'https://navis.yourdomain.com'}/track/${deliveryId}`;

      if (!customerEmail) {
        console.warn('Delivery without customer email:', deliveryId);
        return;
      }

      let subject = '';
      let htmlContent = '';

      switch (newStatus.toLowerCase()) {
        case 'assigned':
          subject = 'Your Delivery Has Been Assigned';
          const transporter = afterData.acceptedBy || 'Our Partner Transporter';
          const estimatedDelivery = afterData.estimatedDeliveryTime || 'Soon';
          htmlContent = emailTemplates.deliveryAssignedEmail(
            customerName,
            deliveryId,
            transporter,
            estimatedDelivery,
            trackingUrl
          );
          break;

        case 'in_transit':
        case 'on_delivery':
          subject = 'Your Package is on the Way!';
          const driverName = afterData.driverName || 'Our Driver';
          const driverPhone = afterData.driverPhone || 'Contact Support';
          htmlContent = emailTemplates.deliveryInTransitEmail(
            customerName,
            deliveryId,
            driverName,
            driverPhone,
            trackingUrl
          );
          break;

        case 'delivered':
        case 'completed':
          subject = 'Your Delivery Has Been Completed';
          const completionTime = new Date(afterData.completedAt || Date.now()).toLocaleString();
          const feedbackUrl = `${process.env.APP_URL || 'https://navis.yourdomain.com'}/feedback/${deliveryId}`;
          htmlContent = emailTemplates.deliveryCompletedEmail(
            customerName,
            deliveryId,
            completionTime,
            feedbackUrl
          );
          break;

        case 'cancelled':
          subject = 'Your Delivery Has Been Cancelled';
          htmlContent = `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Delivery Cancelled</h2>
                <p>Hi ${customerName},</p>
                <p>Your delivery <strong>${deliveryId}</strong> has been cancelled.</p>
                <p>Please contact support for more information.</p>
              </body>
            </html>
          `;
          break;

        default:
          return; // Don't send email for other statuses
      }

      if (htmlContent) {
        await sendEmail(customerEmail, subject, htmlContent, undefined, 'deliveries');
        console.log(`Delivery status email sent to ${customerEmail} for delivery ${deliveryId}`);
      }
    } catch (error) {
      console.error('Error sending delivery status email:', error);
      throw error;
    }
  });

/**
 * Callable function to send password reset email
 * Call from frontend: firebase.functions().httpsCallable('sendPasswordResetEmail')
 */
export const sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, resetLink, expiryTime } = data;

    if (!email || !resetLink) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email and resetLink are required'
      );
    }

    const htmlContent = emailTemplates.passwordResetEmail(
      email.split('@')[0], // Use part of email as name if not provided
      resetLink,
      expiryTime || '24 hours'
    );

    await sendEmail(
      email,
      'Reset Your Navis Password',
      htmlContent
    );

    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send reset email');
  }
});

/**
 * Callable function to send driver assignment notification
 * Call from frontend when assigning a delivery to a driver
 */
export const sendDriverAssignmentEmail = functions.https.onCall(async (data, context) => {
  try {
    const {
      driverEmail,
      driverName,
      deliveryId,
      pickupLocation,
      deliveryLocation,
      estimatedKm,
      estimatedEarnings,
    } = data;

    if (!driverEmail || !deliveryId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'driverEmail and deliveryId are required'
      );
    }

    const htmlContent = emailTemplates.driverAssignmentEmail(
      driverName,
      deliveryId,
      pickupLocation,
      deliveryLocation,
      estimatedKm,
      estimatedEarnings
    );

    await sendEmail(
      driverEmail,
      'New Delivery Assignment - Navis',
      htmlContent
    );

    return { success: true, message: 'Assignment email sent to driver' };
  } catch (error) {
    console.error('Error sending driver assignment email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send assignment email');
  }
});

/**
 * HTTP endpoint to send custom emails (with authentication)
 * POST to /sendCustomEmail with bearer token
 */
export const sendCustomEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Verify authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, htmlContent',
      });
    }

    await sendEmail(to, subject, htmlContent);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in sendCustomEmail:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});
