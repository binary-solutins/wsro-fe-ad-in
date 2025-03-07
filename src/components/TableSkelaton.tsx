export const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 border-b border-gray-200">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="px-6 py-6">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );