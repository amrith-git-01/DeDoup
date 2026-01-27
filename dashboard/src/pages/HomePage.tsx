export default function HomePage() {
  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Home</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Welcome to your dashboard.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-600">Dashboard content will appear here.</p>
      </div>
    </div>
  );
}
