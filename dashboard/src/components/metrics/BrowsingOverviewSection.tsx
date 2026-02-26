import { useMemo } from 'react';
import { formatDuration, formatChangeSeconds } from '../../utils/format';
import type { BrowsingOverview } from '../../types/browsing';

export interface BrowsingOverviewSectionProps {
  overview: BrowsingOverview | null;
  isOverviewLoading: boolean;
  onTodayClick: () => void;
  onSitesClick: () => void;
  onWeekClick: () => void;
  onMonthClick: () => void;
}

export function BrowsingOverviewSection({
  overview,
  isOverviewLoading,
  onTodayClick,
  onSitesClick,
  onWeekClick,
  onMonthClick,
}: BrowsingOverviewSectionProps) {
  const todayVsYesterdaySeconds = useMemo(
    () =>
      overview
        ? overview.today.totalSeconds - overview.yesterday.totalSeconds
        : null,
    [overview],
  );
  const todayVsYesterdayVisits = useMemo(
    () =>
      overview
        ? overview.today.visitCount - overview.yesterday.visitCount
        : null,
    [overview],
  );
  const todayVsYesterdaySites = useMemo(
    () =>
      overview
        ? overview.today.siteCount - overview.yesterday.siteCount
        : null,
    [overview],
  );

  const weekVsPrevWeekSeconds = useMemo(
    () =>
      overview
        ? overview.week.totalSeconds - overview.prevWeek.totalSeconds
        : null,
    [overview],
  );
  const weekVsPrevWeekVisits = useMemo(
    () =>
      overview
        ? overview.week.visitCount - overview.prevWeek.visitCount
        : null,
    [overview],
  );
  const weekVsPrevWeekSites = useMemo(
    () =>
      overview
        ? overview.week.siteCount - overview.prevWeek.siteCount
        : null,
    [overview],
  );

  const monthVsPrevMonthSeconds = useMemo(
    () =>
      overview
        ? overview.month.totalSeconds - overview.prevMonth.totalSeconds
        : null,
    [overview],
  );
  const monthVsPrevMonthVisits = useMemo(
    () =>
      overview
        ? overview.month.visitCount - overview.prevMonth.visitCount
        : null,
    [overview],
  );
  const monthVsPrevMonthSites = useMemo(
    () =>
      overview
        ? overview.month.siteCount - overview.prevMonth.siteCount
        : null,
    [overview],
  );

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6 lg:px-6 lg:pt-6 lg:pb-7">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Screen Time Overview
      </h3>

      {/* Today — three individual cards with own hover */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isOverviewLoading && !overview ? (
          <>
            <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-20 animate-pulse" />
            <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-20 animate-pulse" />
            <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-20 animate-pulse" />
          </>
        ) : (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={onTodayClick}
              onKeyDown={(e) => e.key === 'Enter' && onTodayClick()}
              className="cursor-pointer focus:outline-none"
            >
              <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-full">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen Time</p>
                <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                  {formatDuration(overview?.today.totalSeconds ?? 0)}
                </p>
                {todayVsYesterdaySeconds != null && (
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      todayVsYesterdaySeconds > 0
                        ? 'text-green-600'
                        : todayVsYesterdaySeconds < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {formatChangeSeconds(todayVsYesterdaySeconds)} vs yesterday
                  </p>
                )}
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={onTodayClick}
              onKeyDown={(e) => e.key === 'Enter' && onTodayClick()}
              className="cursor-pointer focus:outline-none"
            >
              <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-full">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visits</p>
                <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                  {overview?.today.visitCount ?? 0}
                </p>
                {todayVsYesterdayVisits != null && (
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      todayVsYesterdayVisits > 0
                        ? 'text-green-600'
                        : todayVsYesterdayVisits < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {todayVsYesterdayVisits > 0 ? '+' : ''}
                    {todayVsYesterdayVisits} vs yesterday
                  </p>
                )}
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={onSitesClick}
              onKeyDown={(e) => e.key === 'Enter' && onSitesClick()}
              className="cursor-pointer focus:outline-none"
            >
              <div className="ui-hover-card rounded-xl bg-gray-50 p-5 h-full">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sites</p>
                <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                  {overview?.today.siteCount ?? 0}
                </p>
                {todayVsYesterdaySites != null && (
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      todayVsYesterdaySites > 0
                        ? 'text-green-600'
                        : todayVsYesterdaySites < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {todayVsYesterdaySites > 0 ? '+' : ''}
                    {todayVsYesterdaySites} vs yesterday
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* This week + This month — reduced padding, divider between columns */}
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-0">
        {/* This week */}
        <div
          role="button"
          tabIndex={0}
          onClick={onWeekClick}
          onKeyDown={(e) => e.key === 'Enter' && onWeekClick()}
          className="pr-4 cursor-pointer focus:outline-none -m-1 p-1"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            This week
          </p>
          {isOverviewLoading && !overview ? (
            <div className="ui-hover-card rounded-xl bg-gray-50 p-4 h-24 animate-pulse" />
          ) : overview ? (
            <div className="ui-hover-card rounded-xl bg-gray-50 p-4 space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen time</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {formatDuration(overview.week.totalSeconds)}
                  </span>
                  {weekVsPrevWeekSeconds != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        weekVsPrevWeekSeconds > 0
                          ? 'text-green-600'
                          : weekVsPrevWeekSeconds < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {formatChangeSeconds(weekVsPrevWeekSeconds)} vs prev week
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visits</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {overview.week.visitCount}
                  </span>
                  {weekVsPrevWeekVisits != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        weekVsPrevWeekVisits > 0
                          ? 'text-green-600'
                          : weekVsPrevWeekVisits < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {weekVsPrevWeekVisits > 0 ? '+' : ''}
                      {weekVsPrevWeekVisits} vs prev week
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sites</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {overview.week.siteCount}
                  </span>
                  {weekVsPrevWeekSites != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        weekVsPrevWeekSites > 0
                          ? 'text-green-600'
                          : weekVsPrevWeekSites < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {weekVsPrevWeekSites > 0 ? '+' : ''}
                      {weekVsPrevWeekSites} vs prev week
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* This month — left border is the only divider */}
        <div
          role="button"
          tabIndex={0}
          onClick={onMonthClick}
          onKeyDown={(e) => e.key === 'Enter' && onMonthClick()}
          className="sm:border-l sm:border-gray-100 sm:pl-4 cursor-pointer focus:outline-none -m-1 p-1"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            This month
          </p>
          {isOverviewLoading && !overview ? (
            <div className="ui-hover-card rounded-xl bg-gray-50 p-4 h-24 animate-pulse" />
          ) : overview ? (
            <div className="ui-hover-card rounded-xl bg-gray-50 p-4 space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen time</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {formatDuration(overview.month.totalSeconds)}
                  </span>
                  {monthVsPrevMonthSeconds != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        monthVsPrevMonthSeconds > 0
                          ? 'text-green-600'
                          : monthVsPrevMonthSeconds < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {formatChangeSeconds(monthVsPrevMonthSeconds)} vs prev month
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visits</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {overview.month.visitCount}
                  </span>
                  {monthVsPrevMonthVisits != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        monthVsPrevMonthVisits > 0
                          ? 'text-green-600'
                          : monthVsPrevMonthVisits < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {monthVsPrevMonthVisits > 0 ? '+' : ''}
                      {monthVsPrevMonthVisits} vs prev month
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sites</p>
                <div className="flex justify-between items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                    {overview.month.siteCount}
                  </span>
                  {monthVsPrevMonthSites != null && (
                    <p
                      className={`text-xs font-medium shrink-0 ${
                        monthVsPrevMonthSites > 0
                          ? 'text-green-600'
                          : monthVsPrevMonthSites < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {monthVsPrevMonthSites > 0 ? '+' : ''}
                      {monthVsPrevMonthSites} vs prev month
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
