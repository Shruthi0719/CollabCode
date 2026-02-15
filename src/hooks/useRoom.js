import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../utils/api';
import { OTClient } from '../utils/otClient';

/**
 * useRoom Hook
 * Manages room state with OT support for real-time collaboration
 * 
 * Usage:
 * const { room, code, setCode, error, loading, getRoomData, submitEdit } = useRoom(roomId);
 */
export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const otClientRef = useRef(null);

  /**
   * Initialize OT client when code is loaded
   */
  useEffect(() => {
    if (code && !otClientRef.current) {
      otClientRef.current = new OTClient(code);
    }
  }, [code]);

  /**
   * Fetch room data from server
   */
  const getRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data.room);
      const roomCode = response.data.room.code || '';
      setCode(roomCode);
      
      // Initialize OT client with fetched code
      if (!otClientRef.current) {
        otClientRef.current = new OTClient(roomCode);
      } else {
        otClientRef.current.sync(roomCode);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load room';
      setError(errorMessage);
      console.error('[Room] Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /**
   * Submit local edit
   * Creates operation and returns it for sending to server
   */
  const submitEdit = useCallback(
    (newCode) => {
      if (!otClientRef.current) {
        otClientRef.current = new OTClient(newCode);
      }

      const op = otClientRef.current.submitEdit(newCode);
      setCode(newCode); // Update local state immediately (optimistic update)

      return op;
    },
    []
  );

  /**
   * Apply remote operation from another user
   */
  const applyRemoteOp = useCallback((op) => {
    if (!otClientRef.current) return;

    const newText = otClientRef.current.applyRemoteOp(op);
    setCode(newText);

    return newText;
  }, []);

  /**
   * Handle operation acknowledgment from server
   */
  const ackOp = useCallback(() => {
    if (otClientRef.current) {
      otClientRef.current.ackOp();
    }
  }, []);

  /**
   * Sync code with server (full update)
   * Used when rejoining or after conflict
   */
  const syncCode = useCallback((newCode) => {
    if (otClientRef.current) {
      otClientRef.current.sync(newCode);
    }
    setCode(newCode);
  }, []);

  /**
   * Update room code in local state
   */
  const updateCode = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  /**
   * Leave room
   */
  const leaveRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      await api.post(`/rooms/${roomId}/leave`);
      // Reset OT client when leaving
      otClientRef.current = null;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to leave room';
      setError(errorMessage);
      console.error('[Room] Leave error:', errorMessage);
    }
  }, [roomId]);

  /**
   * Join room
   */
  const joinRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/rooms/${roomId}/join`);
      setRoom(response.data.room);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to join room';
      setError(errorMessage);
      console.error('[Room] Join error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /**
   * Get room messages with pagination
   */
  const getMessages = useCallback(
    async (limit = 50, page = 1) => {
      if (!roomId) return null;

      try {
        const response = await api.get(`/rooms/${roomId}/messages`, {
          params: { limit, page },
        });
        return response.data;
      } catch (err) {
        console.error('[Room] Get messages error:', err);
        return null;
      }
    },
    [roomId]
  );

  /**
   * Get OT client (for advanced use cases)
   */
  const getOTClient = useCallback(() => {
    return otClientRef.current;
  }, []);

  return {
    room,
    code,
    setCode: updateCode,
    loading,
    error,
    getRoomData,
    submitEdit,      // New: Submit operation
    applyRemoteOp,   // New: Apply remote operation
    ackOp,            // New: Acknowledge sent operation
    syncCode,         // New: Full sync from server
    leaveRoom,
    joinRoom,
    getMessages,
    getOTClient,      // New: Get OT client for debugging
  };
}
