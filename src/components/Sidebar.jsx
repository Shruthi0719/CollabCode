import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './ui/Logo';
import ThemeToggle from './ui/ThemeToggle';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { useToast } from '../hooks/useToast';
import api from '../utils/api';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose?.();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    try {
      await api.post(`/rooms/${roomId.trim()}/join`);
      toast.success('Successfully joined room!');
      setRoomId('');
      setIsJoinRoomOpen(false);
      navigate(`/room/${roomId.trim()}`);
      onClose?.();
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error(error.response?.data?.error || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const navItems = [
    {
      id: 'my-rooms',
      label: 'My Rooms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h1m5-5v10a1 1 0 001 1h1" />
        </svg>
      ),
      action: () => {
        navigate('/dashboard');
        onClose?.();
      },
    },
    {
      id: 'browse',
      label: 'Browse Rooms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => {
        navigate('/dashboard');
        onClose?.();
      },
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative 
          top-0 left-0 
          h-screen w-72
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col 
          z-50 lg:z-0
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo - Desktop only */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <Logo size="sm" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workspace</span>
        </div>

        {/* Main Navigation Section */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {/* Navigation Items */}
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">
              Navigation
            </p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 group font-medium text-sm hover:scale-105 hover:-translate-x-0.5"
                title={item.label}
              >
                {/* Icon background */}
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-200 text-gray-600 dark:text-gray-400 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Join Room Action */}
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4">
              Quick Actions
            </p>
            <button
              onClick={() => setIsJoinRoomOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/40 dark:hover:to-cyan-900/40 text-blue-700 dark:text-blue-400 transition-all duration-200 group font-medium text-sm hover:scale-105 hover:-translate-x-0.5 border border-blue-200 dark:border-blue-800/50"
              title="Join Room"
            >
              {/* Icon background */}
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-all duration-200 text-blue-600 dark:text-blue-400 group-hover:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform duration-200">Join Room</span>
            </button>
          </div>
        </nav>

        {/* Divider */}
        <div className="px-4">
          <div className="border-t border-gray-200 dark:border-gray-800" />
        </div>

        {/* Settings Section */}
        <div className="px-4 py-4 space-y-3 border-b border-gray-200 dark:border-gray-800">
          <p className="px-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            Settings
          </p>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 6.636L5.636 5.222M18.364 5.636l-1.414 1.414M7.05 17.364l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 space-y-4">
          {/* User Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-200 group">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all duration-200 font-medium text-sm border border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-900 group hover:scale-105"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinRoomOpen}
        onClose={() => {
          setIsJoinRoomOpen(false);
          setRoomId('');
        }}
        title="Join Room"
        size="md"
      >
        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the room ID to join a collaborative editing session.
          </p>
          <Input
            label="Room ID"
            placeholder="e.g., room-123456"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isJoining) {
                handleJoinRoom();
              }
            }}
            required
            disabled={isJoining}
            description="Ask your team for the room ID"
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setIsJoinRoomOpen(false);
                setRoomId('');
              }}
              disabled={isJoining}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200 font-medium text-sm disabled:opacity-50 hover:scale-105"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
