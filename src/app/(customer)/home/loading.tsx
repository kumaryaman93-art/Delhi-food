export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-[60vh] bg-gray-100" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-48 rounded-lg bg-gray-100" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
