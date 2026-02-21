import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RefreshCw } from 'lucide-react';
import {
  fetchBrowsingActivity,
  fetchTodayByDomain,
  fetchBrowsingPeriodStats,
  fetchRecentVisits,
} from '../store/slices/browsingSlice';
import type { RootState } from '../store/rootReducer';
import BrowsingActivityChart from '../components/metrics/BrowsingActivityChart';
import {
  ViewModeContainer,
  type ViewModeContainerItem,
} from '../components/metrics/ViewModeContainer';
import { Button } from '../components/ui/Button';
import type { ViewMode } from '../types/ui';

import { formatDuration, formatChangeSeconds, formatTimeAgo } from '../utils/format';

export default function BrowsingPage() {
  const dispatch = useAppDispatch();
  const recentVisits = useAppSelector((state: RootState) => state.browsing.recentVisits);
  const isRecentVisitsLoading = useAppSelector(
    (state: RootState) => state.browsing.isRecentVisitsLoading,
  );
  const dailyActivity = useAppSelector((state: RootState) => state.browsing.dailyActivity);
  const todayByDomain = useAppSelector((state: RootState) => state.browsing.todayByDomain);
  const periodStats = useAppSelector((state: RootState) => state.browsing.periodStats);
  const isActivityLoading = useAppSelector((state: RootState) => state.browsing.isActivityLoading);
  const isTodayByDomainLoading = useAppSelector(
    (state: RootState) => state.browsing.isTodayByDomainLoading,
  );
  const isPeriodStatsLoading = useAppSelector(
    (state: RootState) => state.browsing.isPeriodStatsLoading,
  );
  const [view, setView] = useState<ViewMode>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (dailyActivity.length === 0) dispatch(fetchBrowsingActivity() as any);
    if (todayByDomain.length === 0) dispatch(fetchTodayByDomain() as any);
    if (!periodStats) dispatch(fetchBrowsingPeriodStats() as any);
    if (recentVisits.length === 0) dispatch(fetchRecentVisits() as any);
  }, [dispatch, dailyActivity.length, todayByDomain.length, periodStats, recentVisits.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchBrowsingActivity() as any),
      dispatch(fetchTodayByDomain() as any),
      dispatch(fetchBrowsingPeriodStats() as any),
      dispatch(fetchRecentVisits() as any),
    ]);
    setIsRefreshing(false);
  };

  const todayByDomainItems: ViewModeContainerItem[] = useMemo(
    () =>
      todayByDomain.map((d) => ({
        name: d.domain,
        value: d.totalSeconds,
        secondary: d.visitCount ?? 0,
      })),
    [todayByDomain],
  );

  const totalTodaySeconds = useMemo(
    () => todayByDomain.reduce((s, d) => s + d.totalSeconds, 0),
    [todayByDomain],
  );
  const totalVisitsToday = useMemo(
    () => todayByDomain.reduce((s, d) => s + (d.visitCount ?? 0), 0),
    [todayByDomain],
  );

  const yesterdayDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const yesterdayActivity = useMemo(
    () => dailyActivity.find((a) => a.date === yesterdayDate),
    [dailyActivity, yesterdayDate],
  );

  const todayVsYesterdaySeconds = useMemo(() => {
    if (yesterdayActivity == null) return null;
    return totalTodaySeconds - yesterdayActivity.totalSeconds;
  }, [totalTodaySeconds, yesterdayActivity]);

  const todayVsYesterdayVisits = useMemo(() => {
    if (yesterdayActivity == null) return null;
    return totalVisitsToday - (yesterdayActivity.visitCount ?? 0);
  }, [totalVisitsToday, yesterdayActivity]);

  const todayVsYesterdaySites = useMemo(() => {
    if (yesterdayActivity == null) return null;
    const yesterdaySites = yesterdayActivity.siteCount ?? 0;
    return todayByDomain.length - yesterdaySites;
  }, [todayByDomain.length, yesterdayActivity]);

  const weekVsPrevWeekSeconds = useMemo(
    () => (periodStats ? periodStats.week.totalSeconds - periodStats.prevWeek.totalSeconds : null),
    [periodStats],
  );
  const weekVsPrevWeekVisits = useMemo(
    () => (periodStats ? periodStats.week.visitCount - periodStats.prevWeek.visitCount : null),
    [periodStats],
  );
  const weekVsPrevWeekSites = useMemo(
    () => (periodStats ? periodStats.week.siteCount - periodStats.prevWeek.siteCount : null),
    [periodStats],
  );
  const monthVsPrevMonthSeconds = useMemo(
    () =>
      periodStats ? periodStats.month.totalSeconds - periodStats.prevMonth.totalSeconds : null,
    [periodStats],
  );
  const monthVsPrevMonthVisits = useMemo(
    () => (periodStats ? periodStats.month.visitCount - periodStats.prevMonth.visitCount : null),
    [periodStats],
  );
  const monthVsPrevMonthSites = useMemo(
    () => (periodStats ? periodStats.month.siteCount - periodStats.prevMonth.siteCount : null),
    [periodStats],
  );

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Browsing Statistics
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Screen time and sites you spend time on.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: Single Screen Time Overview section — Today + This week + This month inside */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6 lg:px-6 lg:pt-6 lg:pb-7">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Screen Time Overview
          </h3>

          {/* Today */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen Time</p>
              <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                {formatDuration(totalTodaySeconds)}
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
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Visits</p>
              <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                {totalVisitsToday}
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
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sites</p>
              <p className="text-lg font-semibold text-gray-900 font-tabular-nums mt-1">
                {todayByDomain.length}
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

          {/* This week + This month — reduced padding, divider between columns */}
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* This week */}
            <div className="pr-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                This week
              </p>
              {isPeriodStatsLoading && !periodStats ? (
                <div className="rounded-xl bg-gray-50 p-4 h-24 animate-pulse" />
              ) : periodStats ? (
                <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen time</p>
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                        {formatDuration(periodStats.week.totalSeconds)}
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
                        {periodStats.week.visitCount}
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
                        {periodStats.week.siteCount}
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

            {/* Divider between week and month */}
            <div
              className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-px"
              aria-hidden
            />
            {/* This month — with left border as divider */}
            <div className="sm:border-l sm:border-gray-100 sm:pl-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                This month
              </p>
              {isPeriodStatsLoading && !periodStats ? (
                <div className="rounded-xl bg-gray-50 p-4 h-24 animate-pulse" />
              ) : periodStats ? (
                <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Screen time</p>
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-gray-900 font-tabular-nums">
                        {formatDuration(periodStats.month.totalSeconds)}
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
                        {periodStats.month.visitCount}
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
                        {periodStats.month.siteCount}
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

        {/* Right: Today by domain only */}
        <div className="min-h-[420px] xl:h-full flex flex-col min-h-0">
          {isTodayByDomainLoading && todayByDomain.length === 0 ? (
            <div className="flex-1 min-h-[280px] rounded-xl bg-gray-50 animate-pulse" />
          ) : (
            <ViewModeContainer
              className="flex-1 min-h-0 flex flex-col"
              view={view}
              onViewChange={setView}
              data={todayByDomainItems}
              title="Today by domain"
              valueLabel="Time"
              secondaryLabel="Visits"
              formatValue={formatDuration}
              formatSecondary={(n) => n.toLocaleString()}
              barDataKey="secondary"
              emptyMessage="No browsing today yet. Use the extension to see screen time by domain."
              minHeight="420px"
            />
          )}
        </div>
      </div>

      {/* Bottom: Screen time over time + Recent visits — fixed height like Download Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[400px]">
        <section className="lg:col-span-2 flex flex-col min-h-0 h-full bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5 lg:px-6 lg:pt-6 lg:pb-6">
          {isActivityLoading && dailyActivity.length === 0 ? (
            <div className="flex-1 min-h-[260px] rounded-xl bg-gray-50 animate-pulse" />
          ) : (
            <BrowsingActivityChart dailyActivity={dailyActivity} />
          )}
        </section>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Recent visits</h3>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
            {isRecentVisitsLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-gray-400">
                Loading…
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 py-8">
                No visits yet. Use the extension to see recent sites here.
              </div>
            ) : (
              recentVisits.slice(0, 10).map((visit, index) => (
                <div
                  key={`${visit.domain}-${visit.endTime}-${index}`}
                  className="ui-hover-row flex items-center gap-3 p-2 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={visit.domain}>
                      {visit.domain}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatDuration(visit.durationSeconds)} • {formatTimeAgo(visit.endTime)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
