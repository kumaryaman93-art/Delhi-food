export default function MenuLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 animate-pulse">
      {/* Search bar skeleton */}
      <div className="h-11 rounded-xl bg-gray-100 mb-4" />
      {/* Pills */}
      <div className="flex gap-2 mb-6 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 h-8 w-24 rounded-full bg-gray-100" />
        ))}
      </div>
      {/* Cards */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="h-5 w-40 rounded-lg bg-gray-100 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex gap-3 rounded-2xl overflow-hidden bg-white border border-gray-100 p-3">
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-7 w-20 rounded-xl bg-gray-100 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
