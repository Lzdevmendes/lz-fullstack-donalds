export default function RestaurantLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cover image skeleton */}
      <div className="h-[250px] w-full animate-pulse bg-gray-200" />

      {/* Content skeleton */}
      <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white p-5">
        {/* Restaurant info */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-52 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Open status */}
        <div className="mt-3 h-3 w-16 animate-pulse rounded bg-gray-200" />

        {/* Search bar */}
        <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 overflow-hidden px-5 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 flex-shrink-0 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>

      {/* Product list skeleton */}
      <div className="space-y-3 px-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-10 border-b py-3"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-52 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-[82px] w-[120px] flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
