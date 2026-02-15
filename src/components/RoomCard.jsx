import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';

export const RoomCard = ({ room, onDelete }) => {
  const navigate = useNavigate();
  const memberCount = room.members?.length || 0;
  const createdAt = new Date(room.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: room.createdAt && new Date(room.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  const handleJoin = () => {
    navigate(`/room/${room._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(room._id);
    }
  };

  // Get gradient colors based on language
  const languageGradients = {
    javascript: 'from-yellow-400 to-orange-500',
    typescript: 'from-blue-500 to-cyan-500',
    python: 'from-blue-600 to-yellow-400',
    java: 'from-red-600 to-orange-500',
    cpp: 'from-blue-700 to-blue-400',
    csharp: 'from-purple-600 to-pink-500',
    go: 'from-cyan-500 to-blue-600',
    rust: 'from-orange-600 to-orange-400',
    php: 'from-purple-600 to-indigo-600',
    ruby: 'from-red-700 to-pink-500',
    sql: 'from-orange-500 to-yellow-500',
    html: 'from-orange-600 to-red-600',
    css: 'from-blue-600 to-cyan-500',
    json: 'from-yellow-600 to-orange-600',
    markdown: 'from-gray-700 to-gray-500',
  };

  const gradient = languageGradients[room.language] || 'from-cyan-500 to-purple-600';

  return (
    <Card
      variant="default"
      interactive
      hoverable
      className="h-full flex flex-col group transition-all duration-normal p-4 rounded-md shadow-sm"
      onClick={handleJoin}
    >
      {/* Header with language icon */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-xs group-hover:shadow-md transition-all duration-200`}>
          {room.language?.slice(0, 2).toUpperCase() || 'JS'}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
            {room.name || room.title}
          </h3>
          {room.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {room.description}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Delete room"
            aria-label="Delete room"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Language badge and footer info */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800/40">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
            {room.language?.charAt(0).toUpperCase() + room.language?.slice(1)}
          </span>
          <div className="flex -space-x-1 items-center">
            {room.members?.slice(0, 3).map((member, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-white font-semibold"
                title={member.username || member.email}
              >
                {member.username?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-gray-700 dark:text-gray-300 font-semibold">
                +{memberCount - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</span>
      </div>
    </Card>
  );
};

export default RoomCard;
