export default function ReportsLoading() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded-md mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-32 bg-muted rounded-md mt-3 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-4 w-40 bg-muted rounded-md animate-pulse" />
                <div className="h-5 w-5 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-64 w-full bg-muted rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
