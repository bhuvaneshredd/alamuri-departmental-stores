import prisma from '../config/prisma';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_UPDATE' | 'OFFER' | 'SYSTEM';
  metadata?: Record<string, any>;
}

export interface INotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}

// In-app Database Channel
export class DatabaseNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create DB notification:', error);
    }
  }
}

// Extensible SMS Channel Adapter (e.g. Twilio / Fast2SMS)
export class SmsNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    // Log SMS delivery trigger (ready for Twilio / Fast2SMS API key integration)
    console.log(`[SMS Notification Adapter] Sent to User ${payload.userId}: ${payload.title} - ${payload.message}`);
  }
}

// Extensible WhatsApp Channel Adapter (e.g. WhatsApp Cloud API / Gupshup)
export class WhatsAppNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    console.log(`[WhatsApp Notification Adapter] Sent to User ${payload.userId}: ${payload.title}`);
  }
}

export class NotificationDispatcher {
  private channels: INotificationChannel[] = [
    new DatabaseNotificationChannel(),
    new SmsNotificationChannel(),
    new WhatsAppNotificationChannel(),
  ];

  async dispatch(payload: NotificationPayload): Promise<void> {
    await Promise.allSettled(this.channels.map((channel) => channel.send(payload)));
  }

  async sendOrderStatusNotification(
    userId: string,
    orderNumber: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, { title: string; message: string }> = {
      PLACED: {
        title: 'Order Placed Successfully! 🛒',
        message: `Your order #${orderNumber} has been placed and received by our store.`,
      },
      CONFIRMED: {
        title: 'Order Confirmed! ✅',
        message: `Store has accepted order #${orderNumber}. Preparing items now.`,
      },
      PACKING: {
        title: 'Packing Your Items 📦',
        message: `Order #${orderNumber} is being packed fresh at the store.`,
      },
      READY_FOR_DELIVERY: {
        title: 'Order Packed & Ready 🛵',
        message: `Order #${orderNumber} is ready for dispatch.`,
      },
      OUT_FOR_DELIVERY: {
        title: 'Out for Delivery! ⚡',
        message: `Our delivery partner is on the way with your order #${orderNumber}.`,
      },
      DELIVERED: {
        title: 'Order Delivered! 🎉',
        message: `Order #${orderNumber} was delivered successfully. Enjoy your groceries!`,
      },
      CANCELLED: {
        title: 'Order Cancelled ❌',
        message: `Order #${orderNumber} has been cancelled.`,
      },
    };

    const notification = statusMessages[status] || {
      title: 'Order Status Update',
      message: `Order #${orderNumber} status changed to ${status}.`,
    };

    await this.dispatch({
      userId,
      title: notification.title,
      message: notification.message,
      type: 'ORDER_UPDATE',
      metadata: { orderNumber, status },
    });
  }
}

export const notificationDispatcher = new NotificationDispatcher();
