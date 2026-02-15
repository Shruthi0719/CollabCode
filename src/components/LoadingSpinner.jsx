/**
 * LoadingSpinner Component
 * Shows a spinner with optional message
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
