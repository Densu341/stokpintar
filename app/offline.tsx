export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-5xl">📴</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">You're Offline</h1>
        <p className="text-muted-foreground mb-6">
          StokPintar requires an internet connection. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
        >
          Retry Connection
        </button>
      </div>
    </div>
  )
}
