import Notification from '../models/Notification.js';

class SSEService {
  constructor() {
    // Map of userId string -> Set of Express Response objects
    this.clients = new Map();

    // Send heartbeat comment every 25 seconds to keep connections alive through proxies
    setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  /**
   * Register a new SSE client response stream for a user
   */
  addClient(userId, res) {
    const id = userId.toString();
    if (!this.clients.has(id)) {
      this.clients.set(id, new Set());
    }
    this.clients.get(id).add(res);

    // Initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date() })}\n\n`);

    // Clean up when client disconnects
    res.on('close', () => {
      this.removeClient(id, res);
    });
  }

  /**
   * Remove a client response stream
   */
  removeClient(userId, res) {
    const id = userId.toString();
    if (this.clients.has(id)) {
      const userClients = this.clients.get(id);
      userClients.delete(res);
      if (userClients.size === 0) {
        this.clients.delete(id);
      }
    }
  }

  /**
   * Send SSE event to a specific user across all their active tabs
   */
  sendToUser(userId, eventName, data) {
    if (!userId) return;
    const id = userId.toString();
    const userClients = this.clients.get(id);

    if (userClients && userClients.size > 0) {
      const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
      userClients.forEach((res) => {
        try {
          res.write(payload);
        } catch {
          this.removeClient(id, res);
        }
      });
    }
  }

  /**
   * Create a persistent Notification in DB and push it via SSE in real-time
   */
  async createAndSendNotification({ recipient, sender = null, type = 'system', title, message, link = '', metadata = {} }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link,
        metadata,
      });

      this.sendToUser(recipient, 'notification', notification);
      return notification;
    } catch (err) {
      console.error('[SSEService] Failed to create notification:', err.message);
      return null;
    }
  }

  /**
   * Broadcast an event to all connected users
   */
  broadcast(eventName, data) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((userClients, id) => {
      userClients.forEach((res) => {
        try {
          res.write(payload);
        } catch {
          this.removeClient(id, res);
        }
      });
    });
  }

  /**
   * Keep-alive ping comment to prevent intermediate proxies from dropping connections
   */
  sendHeartbeat() {
    this.clients.forEach((userClients, id) => {
      userClients.forEach((res) => {
        try {
          res.write(': keep-alive\n\n');
        } catch {
          this.removeClient(id, res);
        }
      });
    });
  }

  /**
   * Check if user is currently listening on SSE
   */
  isUserConnected(userId) {
    const id = userId?.toString();
    return this.clients.has(id) && this.clients.get(id).size > 0;
  }
}

const sseService = new SSEService();
export default sseService;
