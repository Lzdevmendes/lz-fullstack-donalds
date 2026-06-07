export default function OrderLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Order card */}
      <div className="w-full max-w-sm rounded-2xl border p-5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-2 border-b py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="flex justify-between border-b py-4">
          <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Status tracker */}
        <div className="pt-5">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="flex justify-between">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-10 w-full max-w-sm animate-pulse rounded-full bg-gray-200" />
    </div>
  );
}
