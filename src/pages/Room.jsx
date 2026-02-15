import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../hooks/useRoom';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import Editor from '../components/Editor';
import UserPresence from '../components/UserPresence';
import ChatPanel from '../components/ChatPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { 
    room, 
    code, 
    setCode, 
    loading, 
    error, 
    getRoomData,
    submitEdit,
    applyRemoteOp,
    ackOp,
    syncCode,
    getOTClient,
  } = useRoom(id);
  
  const [isLocalChange, setIsLocalChange] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  /**
   * Socket event handlers with OT integration
   */
  const socketHandlers = useCallback(() => ({
    user_joined: (data) => {
      console.log('[Room] User joined:', data);
      toast.info(`${data.username} joined the room`);
    },
    
    user_left: (data) => {
      console.log('[Room] User left:', data);
      toast.info(`${data.username} left the room`);
    },
    
    operation: (data) => {
      console.log('[Room] Received operation:', data);
      const { operation } = data;
      
      if (!operation) return;
      
      try {
        const newCode = applyRemoteOp(operation);
        setCode(newCode);
        console.log('[Room] Applied remote operation, new code length:', newCode.length);
      } catch (err) {
        console.error('[Room] Error applying remote operation:', err);
      }
    },
    
    operation_ack: (data) => {
      console.log('[Room] Operation acknowledged by server');
      ackOp();
    },

    chat_message: (data) => {
      setChatMessages(prev => [...prev, {
        author: data.username,
        text: data.message,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    },
    
    remote_cursor_move: (data) => {
      console.log('[Room] Remote cursor:', data);
    },
  }), [applyRemoteOp, setCode, ackOp, toast]);

  const { socket, emit } = useSocket(id, socketHandlers());

  useEffect(() => {
    getRoomData();
  }, [getRoomData]);

  /**
   * Handle local code changes with OT
   */
  const handleCodeChange = useCallback((newCode) => {
    setIsLocalChange(true);
    
    try {
      const operation = submitEdit(newCode);
      setCode(newCode);
      
      if (socket && operation) {
        console.log('[Room] Broadcasting operation:', operation);
        emit('code_change', {
          roomId: id,
          operation,
          version: getOTClient().version,
        });
      }
    } catch (err) {
      console.error('[Room] Error handling code change:', err);
      toast.error('Failed to sync changes');
    } finally {
      setIsLocalChange(false);
    }
  }, [submitEdit, socket, emit, id, setCode, getOTClient, toast]);

  const handleLanguageChange = (newLanguage) => {
    console.log('[Room] Language changed to:', newLanguage);
  };

  const handleSendMessage = (message) => {
    if (socket) {
      emit('send_message', {
        roomId: id,
        message,
      });
      setChatMessages(prev => [...prev, {
        author: user?.username || 'You',
        text: message,
        time: 'just now'
      }]);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/rooms/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied!');
  };

  const handleLeaveRoom = async () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Opening room..." />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg font-semibold">{error}</div>
          <Button onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={handleLeaveRoom}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Back to dashboard"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-gray-100">{room?.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{room?.language?.toUpperCase() || 'JAVASCRIPT'}</span>
              <span className="text-gray-700">•</span>
              <span className="text-xs text-gray-400">{room?.members?.length || 0} member{room?.members?.length !== 1 ? 's' : ''}</span>
              <span className={`w-2 h-2 rounded-full ${socket ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-3">
          {/* Share button */}
          <button
            onClick={copyRoomLink}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
            title="Copy room link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Chat button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-gray-100 transition-colors"
            title="Open chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {chatMessages.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Settings/more options */}
          <button
            onClick={() => toast.info('More options coming soon')}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-gray-100 transition-colors"
            title="More options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Editor with floating user presence */}
        <div className="flex-1 relative overflow-hidden group">
          <Editor
            value={code}
            onChange={handleCodeChange}
            language={room?.language || 'javascript'}
            onLanguageChange={handleLanguageChange}
          />

          {/* Floating user presence */}
          <UserPresence members={room?.members || []} />

          {/* Floating action button (mobile) */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute bottom-4 right-4 md:hidden w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* Chat panel */}
        <ChatPanel
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
