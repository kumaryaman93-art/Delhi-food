export default function HomeLoading() {
  return (
    <div className="fade-in pb-8">
      {/* Hero skeleton */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />

      {/* Stats row */}
      <section className="px-4 mt-6">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </section>

      {/* Featured banner */}
      <section className="px-4 mt-6">
        <div className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
      </section>

      {/* Categories grid */}
      <section className="px-4 mt-6">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-44 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 h-40 rounded-2xl bg-gray-100 animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse"
              style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </section>
    </div>
  );
}
