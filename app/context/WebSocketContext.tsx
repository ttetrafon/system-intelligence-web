import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { WsClientMessage, WsIncoming } from '../../types/websocket';
import { useUser } from './UserContext';

type WsStatus = 'connecting' | 'connected' | 'disconnected';
type WsSubscriber = (msg: WsIncoming) => void;

interface WebSocketContextType {
  sendCommand: (msg: WsClientMessage) => void;
  status: WsStatus;
  subscribe: (handler: WsSubscriber) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const MAX_RECONNECT_DELAY = 30_000;

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useUser();
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Set<WsSubscriber>>(new Set());
  const reconnectDelayRef = useRef(1_000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<WsStatus>('disconnected');

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/system/ws`);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      reconnectDelayRef.current = 1_000;
    };

    ws.onmessage = (e: MessageEvent<string>) => {
      let msg: WsIncoming;
      try {
        msg = JSON.parse(e.data) as WsIncoming;
      } catch {
        console.log('WebSocket: failed to parse message', e.data);
        return;
      }
      for (const handler of subscribersRef.current) {
        handler(msg);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      wsRef.current = null;
      setStatus('disconnected');
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose will fire after onerror, which handles reconnection
      ws.close();
    };
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    const delay = reconnectDelayRef.current;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
      connect();
    }, delay);
  }, [connect]);

  // Connect when session is available, disconnect on unmount or logout
  useEffect(() => {
    if (!session) {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [session?.id, connect]);

  const sendCommand = useCallback((msg: WsClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket: cannot send, not connected');
      return;
    }
    ws.send(JSON.stringify(msg));
  }, []);

  const subscribe = useCallback((handler: WsSubscriber): (() => void) => {
    subscribersRef.current.add(handler);
    return () => {
      subscribersRef.current.delete(handler);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ sendCommand, status, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
