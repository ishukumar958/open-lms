import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authStorage } from './auth';

class ChatSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.typingSubscriptions = new Map();
    this.listeners = new Set();
  }

  connect() {
    if (this.client && (this.connected || this.client.active)) {
      return;
    }

    const token = authStorage.getToken();
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8081';

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws/chat`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str) => {
        if (import.meta.env.DEV) {
          // console.debug('[STOMP]', str);
        }
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connected = true;
        this.notifyStatus(true);
        // Resubscribe active subscriptions on reconnect
        for (const [groupId, callback] of this.subscriptions.entries()) {
          this.doSubscribeGroup(groupId, callback);
        }
        for (const [groupId, callback] of this.typingSubscriptions.entries()) {
          this.doSubscribeTyping(groupId, callback);
        }
      },
      onDisconnect: () => {
        this.connected = false;
        this.notifyStatus(false);
      },
      onStompError: (frame) => {
        console.error('[STOMP Error]', frame.headers['message'], frame.body);
        this.connected = false;
        this.notifyStatus(false);
      },
    });

    try {
      this.client.activate();
    } catch (e) {
      console.warn('STOMP activation error:', e);
    }
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
      this.connected = false;
      this.subscriptions.clear();
      this.typingSubscriptions.clear();
      this.notifyStatus(false);
    }
  }

  // Force-reconnect with the current token (e.g. after login / user switch)
  reconnect() {
    this.disconnect();
    setTimeout(() => this.connect(), 100);
  }

  onStatusChange(listener) {
    this.listeners.add(listener);
    listener(this.connected);
    return () => this.listeners.delete(listener);
  }

  notifyStatus(status) {
    this.listeners.forEach((l) => {
      try {
        l(status);
      } catch (e) {}
    });
  }

  subscribeToGroup(groupId, onMessageReceived) {
    this.subscriptions.set(groupId, onMessageReceived);
    if (this.connected && this.client) {
      return this.doSubscribeGroup(groupId, onMessageReceived);
    }
    return () => this.unsubscribeFromGroup(groupId);
  }

  doSubscribeGroup(groupId, callback) {
    if (!this.client || !this.connected) return () => {};
    try {
      const sub = this.client.subscribe(`/topic/groups.${groupId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Failed to parse STOMP message:', e);
        }
      });
      return () => {
        try {
          sub.unsubscribe();
        } catch (e) {}
      };
    } catch (e) {
      return () => {};
    }
  }

  unsubscribeFromGroup(groupId) {
    this.subscriptions.delete(groupId);
  }

  subscribeToTyping(groupId, onTypingReceived) {
    this.typingSubscriptions.set(groupId, onTypingReceived);
    if (this.connected && this.client) {
      return this.doSubscribeTyping(groupId, onTypingReceived);
    }
    return () => this.typingSubscriptions.delete(groupId);
  }

  doSubscribeTyping(groupId, callback) {
    if (!this.client || !this.connected) return () => {};
    try {
      const sub = this.client.subscribe(`/topic/groups.${groupId}.typing`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          callback(payload);
        } catch (e) {
          console.error('Failed to parse typing payload:', e);
        }
      });
      return () => {
        try {
          sub.unsubscribe();
        } catch (e) {}
      };
    } catch (e) {
      return () => {};
    }
  }

  sendMessage(groupId, messageContent, messageType = 'TEXT') {
    if (this.client && this.connected) {
      this.client.publish({
        destination: `/app/chat.sendMessage/${groupId}`,
        body: JSON.stringify({ messageContent, messageType }),
      });
      return true;
    }
    return false;
  }

  sendTyping(groupId, isTyping) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: `/app/chat.typing/${groupId}`,
        body: JSON.stringify({ isTyping }),
      });
    }
  }
}

export const chatSocket = new ChatSocketService();
