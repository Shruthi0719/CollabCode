import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'sql',
  'html',
  'css',
  'json',
  'markdown',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('my-rooms'); // 'my-rooms' or 'browse'
  const [myRooms, setMyRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loadingMyRooms, setLoadingMyRooms] = useState(true);
  const [loadingAllRooms, setLoadingAllRooms] = useState(false);
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set()); // Track which rooms user has joined
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript',
    description: '',
  });

  useEffect(() => {
    fetchMyRooms();
  }, []);

  // Fetch user's own rooms
  const fetchMyRooms = async () => {
    try {
      setLoadingMyRooms(true);
      const response = await api.get('/rooms?mine=true');
      setMyRooms(response.data.rooms || []);
      // Track these room IDs as already joined
      setJoinedRoomIds(new Set((response.data.rooms || []).map(r => r._id)));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load your rooms');
    } finally {
      setLoadingMyRooms(false);
    }
  };

  // Fetch all public rooms for browsing
  const fetchAllRooms = async () => {
    try {
      setLoadingAllRooms(true);
      const response = await api.get('/rooms'); // No ?mine=true param = all rooms
      setAllRooms(response.data.rooms || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load rooms');
    } finally {
      setLoadingAllRooms(false);
    }
  };

  // Switch to browse tab and fetch rooms if not fetched yet
  const handleBrowseTab = () => {
    setActiveTab('browse');
    if (allRooms.length === 0) {
      fetchAllRooms();
    }
  };

  // Join a room
  const handleJoinRoom = async (roomId) => {
    try {
      const response = await api.post(`/rooms/${roomId}/join`);
      toast.success('Room joined successfully!');
      setJoinedRoomIds(prev => new Set([...prev, roomId]));
      // Optionally navigate to the room
      // navigate(`/room/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join room');
    }
  };

  // Leave a room
  const handleLeaveRoom = async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
      toast.success('Left room');
      setJoinedRoomIds(prev => {
        const updated = new Set(prev);
        updated.delete(roomId);
        return updated;
      });
      // Remove from my rooms list if currently viewing it
      if (activeTab === 'my-rooms') {
        setMyRooms(myRooms.filter(r => r._id !== roomId));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to leave room');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Room title is required');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/rooms', {
        title: formData.title,
        description: formData.description,
        language: formData.language,
      });
      
      setMyRooms([response.data.room, ...myRooms]);
      setJoinedRoomIds(prev => new Set([...prev, response.data.room._id]));
      setFormData({ title: '', language: 'javascript', description: '' });
      setShowCreateModal(false);
      toast.success('Room created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      await api.delete(`/rooms/${roomId}`);
      setMyRooms(myRooms.filter(r => r._id !== roomId));
      toast.success('Room deleted');
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with tabs */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-normal"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Code Rooms</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>

            {/* Create button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="gradient"
              className="flex items-center gap-2 hidden sm:flex"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Room
            </Button>
          </div>

          {/* Tab navigation */}
          <div className="flex border-t border-gray-200 dark:border-gray-800 px-6">
            <button
              onClick={() => setActiveTab('my-rooms')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'my-rooms'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              My Rooms
            </button>
            <button
              onClick={handleBrowseTab}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'browse'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Browse Rooms
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* My Rooms Tab */}
            {activeTab === 'my-rooms' && (
              <div className="space-y-8">
                {loadingMyRooms ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-cyan-500 rounded-full animate-spin" />
                      <p className="text-gray-600 dark:text-gray-400">Loading your rooms...</p>
                    </div>
                  </div>
                ) : myRooms.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-sm">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 dark:from-cyan-900/30 to-purple-100 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h6m0-6h-6m0 0H6m0 0H0" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No rooms yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first collaborative code editor room to get started.</p>
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        variant="primary"
                      >
                        Create Room
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Your Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myRooms.map((room) => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onDelete={handleDeleteRoom}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Browse Rooms Tab */}
            {activeTab === 'browse' && (
              <div className="space-y-8">
                {loadingAllRooms ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-cyan-500 rounded-full animate-spin" />
                      <p className="text-gray-600 dark:text-gray-400">Loading available rooms...</p>
                    </div>
                  </div>
                ) : allRooms.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-sm">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 dark:from-cyan-900/30 to-purple-100 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No rooms available</h3>
                      <p className="text-gray-600 dark:text-gray-400">Create a room to get started collaborating!</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Available Rooms ({allRooms.length})</h2>
                    <div className="space-y-4">
                      {allRooms.map((room) => (
                        <div
                          key={room._id}
                          className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mb-2">
                                {room.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {room.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-4 flex-wrap">
                                {/* Language badge */}
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                                  {room.language}
                                </span>
                                {/* Creator info */}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  By <span className="font-medium">{room.createdBy?.username || 'Unknown'}</span>
                                </span>
                                {/* Member count */}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  👥 {room.members?.length || 0} members
                                </span>
                              </div>
                            </div>

                            {/* Join/Leave button */}
                            <div className="flex-shrink-0 flex flex-col gap-2">
                              {joinedRoomIds.has(room._id) ? (
                                <>
                                  <Button
                                    onClick={() => navigate(`/room/${room._id}`)}
                                    variant="primary"
                                    className="text-sm px-4 py-2"
                                  >
                                    Open
                                  </Button>
                                  <Button
                                    onClick={() => handleLeaveRoom(room._id)}
                                    variant="outline"
                                    className="text-sm px-4 py-2"
                                  >
                                    Leave
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => handleJoinRoom(room._id)}
                                  variant="gradient"
                                  className="text-sm px-4 py-2"
                                >
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile create button */}
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 p-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="gradient"
            className="flex items-center justify-center gap-2 w-full"
            fullWidth
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Room
          </Button>
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Room"
        size="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <Input
            label="Room Title"
            id="room-title"
            type="text"
            placeholder="e.g., React Component Design"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
            required
          />

          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Programming Language
            </label>
            <select
              id="language-select"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className={`
                w-full px-4 py-2.5
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-normal
              `}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              placeholder="What's this room about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`
                w-full px-4 py-2.5
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-normal
                resize-none
              `}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              loading={creating}
              disabled={creating}
              fullWidth
            >
              Create Room
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
