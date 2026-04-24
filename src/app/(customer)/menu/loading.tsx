// Shown instantly while the server fetches menu data.
// Matches the actual menu card layout (image left, info right, variant rows below).
export default function MenuLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex">

        {/* Desktop sidebar skeleton */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 border-r border-gray-100 bg-white p-4 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-100 mb-3" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Search bar skeleton */}
          <div className="sticky top-14 z-40 bg-white px-4 pt-3 pb-3 border-b border-gray-100">
            <div className="flex gap-2">
              <div className="flex-1 h-10 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-10 w-16 rounded-xl bg-gray-100 animate-pulse" />
            </div>
            {/* Mobile pills */}
            <div className="lg:hidden flex gap-2 mt-2 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 h-7 w-24 rounded-full bg-gray-100 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          </div>

          {/* Category sections */}
          <div className="px-4 pt-6 space-y-10 pb-36">
            {[...Array(3)].map((_, catIdx) => (
              <div key={catIdx}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>

                {/* Item cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white"
                      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", animationDelay: `${i * 60}ms` }}>
                      {/* Top row: image + info */}
                      <div className="flex gap-3">
                        <div className="w-22 h-22 bg-gray-100 animate-pulse flex-shrink-0" style={{ width: 88, height: 88 }} />
                        <div className="flex-1 py-3 pr-3 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                          <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                          <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
                        </div>
                      </div>
                      {/* Variant rows */}
                      {i % 2 === 0 && (
                        <div className="border-t border-gray-100 px-3 py-2 space-y-2">
                          {["Half", "Full"].map((label) => (
                            <div key={label} className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <div className="h-3 w-10 rounded bg-gray-100 animate-pulse" />
                                <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
                              </div>
                              <div className="h-7 w-16 rounded-lg bg-gray-100 animate-pulse" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
