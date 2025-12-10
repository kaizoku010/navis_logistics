/**
 * EXAMPLE: How to integrate email notifications in your existing components
 * 
 * This file shows practical examples of using the email notification service
 * in your Navis app components.
 */

// ============================================================================
// EXAMPLE 1: Send Email on User Registration
// ============================================================================
// File: src/pages/RegCustomer.js (existing component)

import { emailNotificationService } from '../services/emailNotificationService';

// In your handleRegister function:
async function handleRegister(email, password, username, company, accountType) {
  try {
    // 1. Create user in Firebase
    const imageUrl = await handleImageUpload(imageFile);
    await register(email, password, username, company, accountType, imageUrl);

    // 2. Send welcome email (automatic trigger via Cloud Function)
    // The welcome email will be sent automatically when the user document
    // is created in Firestore. But if you want to send it manually:
    console.log('Welcome email will be sent automatically via Cloud Function');

    // 3. Show success message
    Modal.success({
      title: 'Registration Successful',
      content: 'A welcome email has been sent to ' + email,
    });

    // 4. Redirect
    if (accountType === 'cargo-mover') {
      navigate('/root/cargo-mover');
    } else if (accountType === 'track-owner') {
      navigate('/root/trucker');
    }
  } catch (error) {
    console.error('Registration error:', error);
    Modal.error({
      title: 'Registration Failed',
      content: error.message,
    });
  }
}

// ============================================================================
// EXAMPLE 2: Send Email When Delivery Status Changes
// ============================================================================
// File: src/pages/Deliveries.js (existing component)

import { emailNotificationService } from '../services/emailNotificationService';

// In your component's update delivery status handler:
async function handleDeliveryStatusChange(deliveryId, newStatus, deliveryDetails) {
  try {
    // Update the delivery in Firestore
    await updateDeliveryStatusForDeliveryCollectionInAPI(
      deliveryId,
      newStatus,
      acceptedBy,
      truckId,
      driverId
    );

    // Email is sent automatically by Cloud Function trigger
    // (when status changes in Firestore)
    console.log('Status email will be sent automatically');

    // Show confirmation
    message.success(`Delivery status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating delivery:', error);
    message.error('Failed to update delivery');
  }
}

// ============================================================================
// EXAMPLE 3: Assign Delivery to Driver with Email Notification
// ============================================================================
// File: src/pages/Deliveries.js

import { emailNotificationService } from '../services/emailNotificationService';

async function handleAssignDeliveryToDriver(
  driverId,
  driverEmail,
  driverName,
  deliveryId,
  deliveryDetails
) {
  try {
    // 1. Get delivery and truck details
    const delivery = deliveryDetails;
    const estimatedKm = calculateDistance(
      delivery.pickupCoords,
      delivery.destinationCoords
    );
    const estimatedEarnings = calculateEarnings(estimatedKm);

    // 2. Update delivery with driver assignment
    await updateDeliveryStatusForDeliveryCollectionInAPI(
      deliveryId,
      'assigned',
      delivery.company,
      selectedTruck,
      driverId,
      null,
      null,
      null,
      { estimatedKm, estimatedEarnings }
    );

    // 3. Send driver assignment email
    await emailNotificationService.sendDriverAssignment(
      driverEmail,
      driverName,
      deliveryId,
      delivery.pickupPoint,
      delivery.destination,
      estimatedKm,
      `UGX ${estimatedEarnings.toLocaleString()}`
    );

    // 4. Update customer notification (optional)
    // Customer email is sent automatically by Cloud Function

    message.success(`Driver ${driverName} has been assigned and notified`);
  } catch (error) {
    console.error('Error assigning driver:', error);
    message.error('Failed to assign driver');
  }
}

// ============================================================================
// EXAMPLE 4: Password Reset with Email
// ============================================================================
// File: src/pages/Login.js (new component or add to existing)

import { emailNotificationService } from '../services/emailNotificationService';

async function handlePasswordReset(email) {
  try {
    // 1. Generate reset token (using Firebase Auth)
    // This is an example - Firebase has built-in password reset
    // but you can customize the email by calling the Cloud Function

    const resetLink = `https://navis.yourdomain.com/reset-password?email=${encodeURIComponent(email)}&mode=resetPassword`;

    // 2. Send reset email via Cloud Function
    await emailNotificationService.sendPasswordReset(
      email,
      resetLink,
      '24 hours'
    );

    message.success('Password reset email sent to ' + email);
  } catch (error) {
    console.error('Error sending reset email:', error);
    message.error('Failed to send reset email');
  }
}

// ============================================================================
// EXAMPLE 5: Send Custom Email to Admin/Manager
// ============================================================================
// File: src/pages/AdminAnalytics.js (or any admin component)

import { emailNotificationService } from '../services/emailNotificationService';

async function notifyAdminOfHighValueDelivery(delivery, adminEmail, adminToken) {
  try {
    const subject = `High Value Delivery Alert: ${delivery.name}`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>High Value Delivery Alert</h2>
          <p><strong>Delivery ID:</strong> ${delivery.id}</p>
          <p><strong>Customer:</strong> ${delivery.customerName}</p>
          <p><strong>From:</strong> ${delivery.pickupPoint}</p>
          <p><strong>To:</strong> ${delivery.destination}</p>
          <p><strong>Estimated Value:</strong> UGX ${delivery.value.toLocaleString()}</p>
          <p><strong>Status:</strong> ${delivery.status}</p>
          <p>Please ensure this delivery receives priority handling.</p>
        </body>
      </html>
    `;

    await emailNotificationService.sendCustomEmail(
      adminEmail,
      subject,
      htmlContent,
      adminToken
    );

    console.log('Admin notification sent');
  } catch (error) {
    console.error('Error sending admin email:', error);
  }
}

// ============================================================================
// EXAMPLE 6: Batch Email Notifications
// ============================================================================
// File: src/utils/notificationHelper.ts (new utility file)

import { emailNotificationService } from '../services/emailNotificationService';

/**
 * Notify all drivers about new deliveries in their area
 */
export async function notifyDriversOfNewDeliveries(
  drivers,
  deliveries,
  areaCoordinates
) {
  const results = [];

  for (const driver of drivers) {
    try {
      // Filter relevant deliveries for this driver's area
      const relevantDeliveries = deliveries.filter(d =>
        isWithinArea(d.destination, areaCoordinates)
      );

      if (relevantDeliveries.length > 0) {
        const totalEarnings = relevantDeliveries.reduce(
          (sum, d) => sum + calculateEarnings(d),
          0
        );

        await emailNotificationService.sendDriverAssignment(
          driver.email,
          driver.name,
          `batch_${Date.now()}`,
          'Multiple Locations',
          relevantDeliveries.length + ' deliveries available',
          100, // average km
          `UGX ${totalEarnings.toLocaleString()}`
        );

        results.push({ driverId: driver.id, sent: true });
      }
    } catch (error) {
      console.error(`Failed to notify driver ${driver.name}:`, error);
      results.push({ driverId: driver.id, sent: false, error });
    }
  }

  return results;
}

// ============================================================================
// EXAMPLE 7: Error Handling with Retry Logic
// ============================================================================
// File: src/utils/emailRetry.ts (new utility file)

import { emailNotificationService } from '../services/emailNotificationService';

/**
 * Send email with automatic retry on failure
 */
export async function sendEmailWithRetry(
  fn,
  maxRetries = 3,
  delayMs = 2000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Email send attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to send email after ${maxRetries} attempts`);
      }

      // Wait before retrying (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage:
async function sendEmailWithRetry(
  driverEmail,
  driverName,
  deliveryId,
  pickup,
  destination,
  km,
  earnings
) {
  await sendEmailWithRetry(() =>
    emailNotificationService.sendDriverAssignment(
      driverEmail,
      driverName,
      deliveryId,
      pickup,
      destination,
      km,
      earnings
    )
  );
}

// ============================================================================
// EXAMPLE 8: Check if Email Service is Available
// ============================================================================
// File: src/components/Header.js or similar

import { useEffect, useState } from 'react';
import { emailNotificationService } from '../services/emailNotificationService';

function Header() {
  const [emailServiceAvailable, setEmailServiceAvailable] = useState(false);

  useEffect(() => {
    async function checkEmailService() {
      const available = await emailNotificationService.isConfigured();
      setEmailServiceAvailable(available);
    }

    checkEmailService();
  }, []);

  return (
    <div>
      {emailServiceAvailable ? (
        <p>✓ Email notifications active</p>
      ) : (
        <p>⚠️ Email notifications not configured</p>
      )}
    </div>
  );
}

export default Header;

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/*
☐ 1. Firebase Functions deployed
☐ 2. Email configuration set in Firebase
☐ 3. emailNotificationService.ts copied to src/services/
☐ 4. Import service in components where needed
☐ 5. Add email field to Firestore collections
☐ 6. Test welcome email on new user registration
☐ 7. Test delivery status emails
☐ 8. Test driver assignment notification
☐ 9. Check function logs for errors
☐ 10. Verify emails not going to spam
☐ 11. Monitor email delivery rates
☐ 12. Update email templates for branding
*/

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Async email (don't wait for response)
async function registerUserAndSendEmail(userData) {
  await register(userData);
  
  // Fire and forget (don't await)
  emailNotificationService
    .sendDriverAssignment(...)
    .catch(err => console.error('Email send failed:', err));

  return userData;
}

// Pattern 2: Wait for email before confirming
async function updateDeliveryAndNotifyCustomer(deliveryId, newStatus) {
  await updateInFirestore('deliveries', deliveryId, { status: newStatus });
  
  // Wait for email (Cloud Function handles it automatically)
  // The automatic trigger will send email within 1-2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return { success: true };
}

// Pattern 3: Conditional email (only send if conditions met)
async function complexDeliveryUpdate(delivery, updates) {
  const before = delivery.status;
  await updateDeliveryStatus(delivery.id, updates.status);

  // Only send email if status actually changed to specific states
  if (before !== updates.status && ['assigned', 'in_transit', 'delivered'].includes(updates.status)) {
    console.log('Email will be sent automatically by Cloud Function');
  }
}
