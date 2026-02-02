'use client';

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-md animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
              <div className="h-6 w-24 bg-muted rounded-md" />
              <div className="h-4 w-32 bg-muted rounded-md mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
