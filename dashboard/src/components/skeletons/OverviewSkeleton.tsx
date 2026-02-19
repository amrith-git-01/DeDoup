const OverviewSkeleton = () => {
  return (
    <section
      className="
        h-full flex flex-col
        bg-white rounded-2xl border border-gray-100 shadow-sm
        px-4 pt-4 pb-4
        sm:px-5 sm:pt-5 sm:pb-5
        lg:px-6 lg:pt-6 lg:pb-6
      "
    >
      {/* Header */}
      <header className="mb-3 sm:mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="h-3 w-20 bg-gray-100 rounded-full" />
          <div className="h-4 w-28 bg-gray-50 rounded-full" />
        </div>
      </header>

      {/* Body: match 3-row × 2-col layout */}
      <div className="grid grid-cols-2 grid-rows-[auto_1fr_1fr] gap-3 flex-1">
        {/* Hero card */}
        <div className="col-span-2">
          <div className="h-24 sm:h-28 lg:h-32 rounded-xl bg-gray-100 animate-pulse" />
        </div>

        {/* This Week */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 animate-pulse h-20 sm:h-24" />

        {/* This Month */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 animate-pulse h-20 sm:h-24" />

        {/* Peak Hour */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 animate-pulse h-20 sm:h-24" />

        {/* Peak Day */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 animate-pulse h-20 sm:h-24" />
      </div>
    </section>
  );
};

export default OverviewSkeleton;
