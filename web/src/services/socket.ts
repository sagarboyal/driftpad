import { Client, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { DocumentEditMessage } from '../types';

class SocketService {
  private client: Client | null = null;
  public connected: boolean = false;
  private activeSubscription: StompSubscription | null = null;
  private serverUrl: string = 'http://localhost:8080/ws';

  public connect(
    onConnect?: (frame: IFrame) => void,
    onDisconnect?: () => void,
    onError?: (frame: IFrame) => void
  ): void {
    if (this.client && this.client.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.serverUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame: IFrame) => {
        this.connected = true;
        if (onConnect) onConnect(frame);
      },
      onDisconnect: () => {
        this.connected = false;
        if (onDisconnect) onDisconnect();
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame);
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        this.connected = false;
        if (onDisconnect) onDisconnect();
      },
    });

    this.client.activate();
  }

  public subscribeToDocument(
    token: string,
    onMessageReceived: (message: DocumentEditMessage) => void
  ): StompSubscription | null {
    if (!this.client || !this.connected) {
      return null;
    }

    if (this.activeSubscription) {
      this.activeSubscription.unsubscribe();
      this.activeSubscription = null;
    }

    const destination = `/topic/document/${token}`;
    this.activeSubscription = this.client.subscribe(destination, (message) => {
      try {
        const payload: DocumentEditMessage = JSON.parse(message.body);
        onMessageReceived(payload);
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message:', err);
      }
    });

    return this.activeSubscription;
  }

  public publishEdit(token: string, text: string, senderId: string): void {
    if (!this.client || !this.connected) {
      return;
    }

    const destination = `/app/document/${token}/edit`;
    const payload: DocumentEditMessage = {
      text,
      senderId,
      timestamp: Date.now(),
    };

    this.client.publish({
      destination,
      body: JSON.stringify(payload),
    });
  }

  public disconnect(): void {
    if (this.activeSubscription) {
      this.activeSubscription.unsubscribe();
      this.activeSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connected = false;
  }
}

export const socketService = new SocketService();
export default socketService;
