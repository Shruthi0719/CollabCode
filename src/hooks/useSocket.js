import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

/**
 * useSocket Hook
 * Manages Socket.io connection and event handling
 * 
 * Usage:
 * const { socket, connected, emit } = useSocket(roomId, handlers);
 */
export function useSocket(roomId, handlers = {}) {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    if (!roomId) return;

    const connectSocket = () => {
      // Connect to backend with session credentials
      socketRef.current = io(
        import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000',
        {
          withCredentials: true, // Send session cookies
          transports: ['websocket', 'polling'],
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        }
      );

      // Connection event
      socketRef.current.on('connect', () => {
        console.log('[Socket] Connected');
        
        // Join the room
        socketRef.current.emit('join_room', { roomId });
      });

      // Register all provided handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        if (socketRef.current) {
          socketRef.current.on(event, handler);
        }
      });

      // Error handling
      socketRef.current.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });

      socketRef.current.on('error', (error) => {
        console.error('[Socket] Error:', error);
      });

      socketRef.current.on('disconnect', () => {
        console.log('[Socket] Disconnected');
      });
    };

    connectSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [roomId, handlers]);

  /**
   * Emit event to server
   */
  const emit = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('[Socket] Not connected, cannot emit event:', event);
    }
  }, []);

  /**
   * Listen to event
   */
  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  /**
   * Remove event listener
   */
  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    emit,
    on,
    off,
  };
}
