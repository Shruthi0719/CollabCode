/**
 * UserPresence Component
 * Shows active users in the room with floating avatars
 * 
 * Displays member list with real-time status indicators
 */

export default function UserPresence({ members = [] }) {
  return (
    <>
      {/* Floating avatars in editor */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {members.map((member, idx) => (
          <div
            key={member._id}
            className="group relative"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-800 hover:border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 cursor-pointer"
              style={{
                backgroundColor: stringToColor(member._id),
                zIndex: members.length - idx,
              }}
              title={member.username}
            >
              {member.username?.[0]?.toUpperCase() || '?'}
            </div>
            
            {/* Tooltip */}
            <div className="absolute top-12 right-0 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <p className="font-medium">{member.username}</p>
              <p className="text-xs text-gray-400">
                {member.status === 'editing' ? '✎ Editing' : 'Viewing'}
              </p>
            </div>
            
            {/* Active indicator */}
            {member.status === 'editing' && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-900 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Member list sidebar (visible on hover or always on desktop) */}
      <div className="absolute bottom-4 left-4 max-w-xs z-20 hidden group-hover:block">
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700/50">
            <h3 className="font-semibold text-gray-100 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {members.length} Member{members.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: stringToColor(member._id),
                  }}
                >
                  {member.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{member.username}</p>
                </div>
                {member.status === 'editing' && (
                  <span className="text-xs text-yellow-400">✎</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Generate consistent color from user ID
 */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
