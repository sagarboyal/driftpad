export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface DocumentEditMessage {
  text: string;
  senderId: string;
  timestamp?: number;
}
