export default function SkeletorStats() {
  return (
    <>
      {[1, 2, 3, 4].map((index) => (
        <div 
          key={index}
          className="bg-white p-4 rounded-lg shadow w-1/4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}