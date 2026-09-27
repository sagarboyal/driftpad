import { useState, useEffect, useRef, ChangeEvent } from 'react';
import socketService from '../services/socket';
import { ConnectionStatus, DocumentEditMessage } from '../types';

interface DocumentPageProps {
  token?: string;
}

export default function DocumentPage({ token = 'test-doc' }: DocumentPageProps) {
  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Generate a persistent anonymous client ID for this tab session
  const senderIdRef = useRef<string>(
    'client-' + Math.random().toString(36).substring(2, 9)
  );

  useEffect(() => {
    setStatus('connecting');

    const handleConnect = () => {
      setStatus('connected');
      socketService.subscribeToDocument(token, (message: DocumentEditMessage) => {
        if (message.senderId !== senderIdRef.current) {
          setText(message.text || '');
          setLastSynced(new Date());
        }
      });
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
    };

    const handleError = () => {
      setStatus('disconnected');
    };

    socketService.connect(handleConnect, handleDisconnect, handleError);

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setLastSynced(new Date());

    socketService.publishEdit(token, newText, senderIdRef.current);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-area">
          <span className="brand-name">Driftpad</span>
          <span className="doc-token-badge">#{token}</span>
        </div>
        <div className={`status-badge ${status}`}>
          <span className="status-dot"></span>
          <span>{status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Offline'}</span>
        </div>
      </header>

      <main className="editor-wrapper">
        <textarea
          className="editor-textarea"
          value={text}
          onChange={handleChange}
          placeholder="Start typing your plain-text notes here... Open another tab to test live synchronization."
          spellCheck={false}
          autoFocus
        />
      </main>

      <footer className="footer">
        <span>Session ID: {senderIdRef.current}</span>
        <span>
          {lastSynced ? `Last synced at ${lastSynced.toLocaleTimeString()}` : 'Syncing in real-time'}
        </span>
      </footer>
    </div>
  );
}
