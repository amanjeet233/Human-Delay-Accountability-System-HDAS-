'use client';

export default function ClerkTasksLoading() {
  return (
    <div className="p-6">
      <div className="h-6 w-48 bg-muted rounded-md animate-pulse mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 w-64 bg-muted rounded-md" />
            <div className="h-3 w-48 bg-muted rounded-md mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
