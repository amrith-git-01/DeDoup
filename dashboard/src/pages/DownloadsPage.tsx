import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  FileQuestion,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react';
import DownloadListSkeleton from '../components/skeletons/DownloadListSkeleton';
import HealthBarSkeleton from '../components/skeletons/HealthBarSkeleton';
import TimeInsightsSkeleton from '../components/skeletons/TimeInsightsSkeleton';
import FileAnalyticsSkeleton from '../components/skeletons/FileAnalyticsSkeleton';
import OverviewSkeleton from '../components/skeletons/OverviewSkeleton';
import {
  fetchSummaryMetrics,
  fetchFilteredHistory,
  fetchTrends,
  fetchActivity,
  fetchHabits,
  fetchFileMetrics,
  fetchRecentDownloads,
  fetchSourceStats,
} from '../store/slices/statsSlice';
import type { RootState } from '../store/rootReducer';
import HealthBar from '../components/metrics/HealthBar';
import TimeInsights from '../components/metrics/TimeInsights';
import FileAnalytics from '../components/metrics/FileAnalytics';
import OverviewCard from '../components/metrics/OverviewCard';
import DetailsDrawer from '../components/ui/DetailsDrawer';
import { Button } from '../components/ui/Button';
import DownloadListItem from '../components/ui/DownloadListItem';
import { selectSummaryWithDefaults } from '../store/slices/statsSlice';
import type { DrawerFilter } from '../types/pages';

import { formatBytes } from '../utils/format';
import SourceAnalytics from '../components/metrics/SourceAnalytics';
import SourceAnalyticsSkeleton from '../components/skeletons/SourceAnalyticsSkeleton';

const DownloadsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const summaryMetrics = useAppSelector((state: RootState) => state.stats.summaryMetrics);
  const isSummaryLoading = useAppSelector((state: RootState) => state.stats.isSummaryLoading);

  const history = useAppSelector((state: RootState) => state.stats.history);
  const historyPagination = useAppSelector((state: RootState) => state.stats.historyPagination);
  const isHistoryLoading = useAppSelector((state: RootState) => state.stats.isHistoryLoading);

  const activityTrends = useAppSelector((state: RootState) => state.stats.activityTrends);
  const isTrendsLoading = useAppSelector((state: RootState) => state.stats.isTrendsLoading);

  const dailyActivity = useAppSelector((state: RootState) => state.stats.dailyActivity);
  const isActivityLoading = useAppSelector((state: RootState) => state.stats.isActivityLoading);

  const habits = useAppSelector((state: RootState) => state.stats.habits);
  const isHabitsLoading = useAppSelector((state: RootState) => state.stats.isHabitsLoading);

  const recentDownloads = useAppSelector((state: RootState) => state.stats.recentDownloads);
  const isRecentDownloadsLoading = useAppSelector(
    (state: RootState) => state.stats.isRecentDownloadsLoading,
  );

  const fileMetrics = useAppSelector((state: RootState) => state.stats.fileMetrics);
  const isFileMetricsLoading = useAppSelector(
    (state: RootState) => state.stats.isFileMetricsLoading,
  );

  const sourceStats = useAppSelector((state: RootState) => state.stats.sourceStats);
  const isSourceStatsLoading = useAppSelector(
    (state: RootState) => state.stats.isSourceStatsLoading,
  );

  const summary = useAppSelector(selectSummaryWithDefaults);

  const safeActivityTrends = activityTrends ?? {
    today: { count: 0, change: 0 },
    week: { count: 0, change: 0 },
    month: { count: 0, change: 0 },
  };

  const safeHabits = habits ?? {
    mostActiveHour: null,
    mostActiveHourDate: null,
    mostActiveHourCount: null,
    mostActiveDay: '',
    mostActiveDayCount: null,
  };

  const [page, setPage] = useState(1);
  const limit = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerFilter, setDrawerFilter] = useState<DrawerFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [selectedSourceDomain, setSelectedSourceDomain] = useState<string | null>(null);
  const [excludedSourceDomains, setExcludedSourceDomains] = useState<string[] | null>(null);

  useEffect(() => {
    // Only fetch if data is missing (Throttling)
    if (!summaryMetrics) dispatch(fetchSummaryMetrics() as any);
    if (!activityTrends) dispatch(fetchTrends() as any);
    if (dailyActivity.length === 0) dispatch(fetchActivity() as any);
    if (!habits) dispatch(fetchHabits() as any);
    if (!fileMetrics) dispatch(fetchFileMetrics({}) as any);
    if (recentDownloads.length === 0) dispatch(fetchRecentDownloads() as any);
    if (!sourceStats) dispatch(fetchSourceStats() as any);
  }, [
    dispatch,
    summaryMetrics,
    activityTrends,
    dailyActivity.length,
    habits,
    fileMetrics,
    recentDownloads.length,
    sourceStats,
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchSummaryMetrics() as any),
      dispatch(fetchTrends() as any),
      dispatch(fetchActivity() as any),
      dispatch(fetchHabits() as any),
      dispatch(fetchFileMetrics({}) as any),
      dispatch(fetchRecentDownloads() as any),
      dispatch(fetchSourceStats() as any),
    ]);
    setIsRefreshing(false);
  };

  const handleHealthBarClick = useCallback((key: string) => {
    if (key === 'unique') setDrawerFilter('unique');
    else if (key === 'duplicates') setDrawerFilter('duplicate');
    else setDrawerFilter('all');
    setShowDrawer(true);
  }, []);

  const handleOverviewClick = useCallback((type: DrawerFilter) => {
    setDrawerFilter(type);
    setShowDrawer(true);
  }, []);

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
    setDrawerFilter('date');
    setShowDrawer(true);
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
    setDrawerFilter('category');
    setShowDrawer(true);
  }, []);

  const handleExtensionClick = useCallback((ext: string) => {
    setSelectedExtension(ext);
    setDrawerFilter('extension');
    setShowDrawer(true);
  }, []);

  const handleViewAllClick = useCallback(() => {
    setDrawerFilter('all');
    setShowDrawer(true);
  }, []);

  const handleSourceDomainClick = useCallback((domain: string) => {
    setSelectedSourceDomain(domain);
    setDrawerFilter('source');
    setShowDrawer(true);
  }, []);

  const handleSourceOthersClick = useCallback((excludedDomains: string[]) => {
    setExcludedSourceDomains(excludedDomains.length > 0 ? excludedDomains : null);
    setDrawerFilter('source-others');
    setShowDrawer(true);
  }, []);

  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setDrawerFilter('single-event'); // Using 'as any' since type update is implicit
    setShowDrawer(true);
  }, []);

  // Fetch filtered history when drawer filters change
  useEffect(() => {
    if (!showDrawer) return;

    // Prevent fetching if dependencies for specific filters aren't ready
    if ((drawerFilter === 'peak-hour' || drawerFilter === 'peak-day') && !habits) return;

    const filters: Record<string, string | number | undefined> = {};

    switch (drawerFilter) {
      case 'duplicate':
        filters.status = 'duplicate';
        break;
      case 'unique':
        filters.status = 'new';
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.startDate = today.toISOString();
        break;
      case 'week':
        const week = new Date();
        const day = week.getDay() || 7;
        if (day !== 1) week.setHours(-24 * (day - 1));
        week.setHours(0, 0, 0, 0);
        filters.startDate = week.toISOString();
        break;
      case 'month':
        const month = new Date();
        month.setDate(1);
        month.setHours(0, 0, 0, 0);
        filters.startDate = month.toISOString();
        break;
      case 'category':
        if (selectedCategory) filters.fileCategory = selectedCategory;
        break;
      case 'extension':
        if (selectedExtension) filters.fileExtension = selectedExtension;
        break;
      case 'date':
        if (selectedDate) {
          const start = new Date(selectedDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(selectedDate);
          end.setHours(23, 59, 59, 999);
          filters.startDate = start.toISOString();
          filters.endDate = end.toISOString();
        }
        break;
      case 'peak-hour':
        {
          const week = new Date();
          const day = week.getDay() || 7;
          if (day !== 1) week.setHours(-24 * (day - 1));
          week.setHours(0, 0, 0, 0);
          filters.startDate = week.toISOString();
          if (habits?.mostActiveHour !== undefined && habits.mostActiveHour !== null) {
            filters.hour = habits.mostActiveHour;
          }
        }
        break;
      case 'peak-day':
        if (habits?.mostActiveDay) {
          const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          const targetDayIndex = days.indexOf(habits.mostActiveDay);

          if (targetDayIndex !== -1) {
            const startOfWeek = new Date();
            const currentDay = startOfWeek.getDay();
            const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
            startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const daysToAdd = targetDayIndex === 0 ? 6 : targetDayIndex - 1;
            const targetDate = new Date(startOfWeek);
            targetDate.setDate(startOfWeek.getDate() + daysToAdd);

            filters.startDate = targetDate.toISOString();
            const endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);
            filters.endDate = endDate.toISOString();
          }
        }
        break;

      case 'single-event':
        if (selectedEventId) filters.eventId = selectedEventId;
        break;
      case 'source':
        if (selectedSourceDomain) filters.sourceDomain = selectedSourceDomain;
        break;
      case 'source-others':
        if (excludedSourceDomains?.length)
          filters.excludeSourceDomains = excludedSourceDomains.join(',');
        break;
    }

    dispatch(fetchFilteredHistory({ page, limit, filters }));
  }, [
    dispatch,
    showDrawer,
    drawerFilter,
    selectedCategory,
    selectedExtension,
    selectedDate,
    selectedSourceDomain,
    excludedSourceDomains,
    page,
    habits,
    selectedEventId,
  ]);

  // Reset pagination when filter changes or drawer closes
  useEffect(() => {
    setPage(1);
  }, [drawerFilter, selectedCategory, selectedExtension, selectedDate, selectedEventId, selectedSourceDomain, excludedSourceDomains]);

  // Reset page and filters when drawer is closed
  useEffect(() => {
    if (!showDrawer) {
      setPage(1);
      setSelectedCategory(null);
      setSelectedExtension(null);
      setSelectedDate(null);
      setSelectedEventId(null);
      setSelectedSourceDomain(null);
      setExcludedSourceDomains(null);
      setDrawerFilter('all');
    }
  }, [showDrawer]);

  const getDrawerDetails = () => {
    if (!showDrawer) return { title: '', count: 0 };

    let count: number | null = null;
    let title = '';

    if (drawerFilter === 'all') {
      count = summary.totalDownloads;
      title = 'All Downloads';
    } else if (drawerFilter === 'unique') {
      count = summary.newDownloads;
      title = 'New Downloads';
    } else if (drawerFilter === 'duplicate') {
      count = summary.duplicateDownloads;
      title = 'Duplicate Files';
    } else if (drawerFilter === 'today') {
      count = activityTrends?.today.count || 0;
      title = "Today's Downloads";
    } else if (drawerFilter === 'week') {
      count = activityTrends?.week.count || 0;
      title = "This Week's Downloads";
    } else if (drawerFilter === 'month') {
      count = activityTrends?.month.count || 0;
      title = "This Month's Downloads";
    } else if (drawerFilter === 'category' && selectedCategory) {
      count =
        fileMetrics?.categories?.find(
          (c) => c.name.toLowerCase() === selectedCategory.toLowerCase(),
        )?.count || 0;
      title = `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Files`;
    } else if (drawerFilter === 'extension' && selectedExtension) {
      const cleanSelected = selectedExtension.startsWith('.')
        ? selectedExtension.slice(1).toLowerCase()
        : selectedExtension.toLowerCase();
      count =
        fileMetrics?.extensions?.find((e) => {
          const cleanName = e.name.startsWith('.')
            ? e.name.slice(1).toLowerCase()
            : e.name.toLowerCase();
          return cleanName === cleanSelected;
        })?.count || 0;
      title = `.${selectedExtension.toUpperCase()} Files`;
    } else if (drawerFilter === 'source' && selectedSourceDomain) {
      const src = sourceStats?.sources?.find(
        (s) => s.domain.toLowerCase() === selectedSourceDomain.toLowerCase(),
      );
      count = src?.totalDownloads ?? 0;
      title = `Downloads from ${selectedSourceDomain}`;
    } else if (drawerFilter === 'source-others' && excludedSourceDomains?.length) {
      const topCount =
        sourceStats?.sources
          ?.filter((s) =>
            excludedSourceDomains.some((d) => d.toLowerCase() === s.domain.toLowerCase()),
          )
          .reduce((sum, s) => sum + s.totalDownloads, 0) ?? 0;
      const total =
        sourceStats?.sources?.reduce((sum, s) => sum + s.totalDownloads, 0) ?? 0;
      count = Math.max(0, total - topCount);
      title = 'Downloads from other sources';
    } else if (drawerFilter === 'date' && selectedDate) {
      count = dailyActivity.find((a) => a.date === selectedDate)?.total || 0;
      title = `Downloads on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (drawerFilter === 'peak-hour') {
      count = habits?.mostActiveHourCount || null;
      const hour = habits?.mostActiveHour;
      if (hour !== undefined && hour !== null) {
        const start = new Date(0, 0, 0, hour).toLocaleTimeString([], {
          hour: 'numeric',
          hour12: true,
        });
        const end = new Date(0, 0, 0, hour + 1).toLocaleTimeString([], {
          hour: 'numeric',
          hour12: true,
        });
        title = `Downloads during ${start} - ${end}`;
      } else {
        title = 'Downloads during Peak Hour';
      }
    } else if (drawerFilter === 'peak-day') {
      count = habits?.mostActiveDayCount || null;
      title = habits?.mostActiveDay
        ? `Downloads on ${habits.mostActiveDay}`
        : 'Downloads on Peak Day';
    } else if (drawerFilter === 'single-file') {
      count = 1;
      title = history[0] ? history[0].filename : 'File Details';
    } else if (drawerFilter === 'single-event') {
      count = 1;
      title = history[0] ? history[0].filename : 'Download Details';
    }

    // Fallback to pagination total if specific count not determined above
    const displayCount = count !== null ? count : historyPagination?.total || 0;

    return { title, count: displayCount };
  };

  const { title: drawerTitle, count: drawerCount } = getDrawerDetails();

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Downloads Statistics
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            View the statistics of your downloads.
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        {/* Left: Overview (1/3 on xl) */}
        {(isTrendsLoading || isHabitsLoading) && !activityTrends && !habits ? (
          <OverviewSkeleton />
        ) : (
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
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Overview
                </h2>
              </div>
            </header>

            {/* Body: 3 rows × 2 cols */}
            <div className="grid grid-cols-2 grid-rows-[auto_1fr_1fr] gap-3 flex-1">
              {/* Row 1: Hero (Today's Downloads) */}
              <OverviewCard
                title="Today's Downloads"
                value={safeActivityTrends.today.count}
                subtitle="files"
                icon={Download}
                iconColor="text-gray-400"
                change={{
                  value: safeActivityTrends.today.change,
                  label: 'vs yesterday',
                }}
                onClick={() => handleOverviewClick('today')}
                colSpan={2}
              />

              {/* Row 2, Col 1: This Week */}
              <OverviewCard
                title="This Week"
                value={safeActivityTrends.week.count}
                subtitle="downloads"
                icon={Calendar}
                iconColor="text-blue-500"
                change={{
                  value: safeActivityTrends.week.change,
                  label: 'vs last week',
                }}
                onClick={() => handleOverviewClick('week')}
              />

              {/* Row 2, Col 2: This Month */}
              <OverviewCard
                title="This Month"
                value={safeActivityTrends.month.count}
                subtitle="downloads"
                icon={TrendingUp}
                iconColor="text-emerald-500"
                change={{
                  value: safeActivityTrends.month.change,
                  label: 'vs last month',
                }}
                onClick={() => handleOverviewClick('month')}
              />

              {/* Row 3, Col 1: Peak Hour */}
              <OverviewCard
                title="Peak Hour"
                value={
                  typeof safeHabits.mostActiveHour === 'number'
                    ? new Date(0, 0, 0, safeHabits.mostActiveHour).toLocaleTimeString([], {
                        hour: 'numeric',
                        hour12: true,
                      })
                    : 'N/A'
                }
                subtitle={
                  safeHabits.mostActiveHourDate
                    ? new Date(safeHabits.mostActiveHourDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'This Week'
                }
                icon={Clock}
                iconColor="text-indigo-500"
                onClick={() => handleOverviewClick('peak-hour')}
              />

              {/* Row 3, Col 2: Peak Day */}
            <OverviewCard
                title="Peak Day"
                value={safeHabits.mostActiveDay ? safeHabits.mostActiveDay.slice(0, 3) : 'N/A'}
                subtitle="This Week"
                icon={Calendar}
                iconColor="text-purple-500"
                onClick={() => handleOverviewClick('peak-day')}
              />
            </div>
          </section>
        )}

        {/* Right: HealthBars (2/3 on xl, stacked via flex-col) */}
        <section
          className="
      h-full xl:col-span-2
      bg-white rounded-2xl border border-gray-100 shadow-sm
      px-4 pt-4 pb-2
      sm:px-5 sm:pt-5 sm:pb-2
      lg:px-6 lg:pt-6 lg:pb-2
    "
        >
          <header className="mb-3 sm:mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Downloads Health &amp; Storage
              </h2>
            </div>
          </header>

          <div className="flex flex-col space-y-1">
            {isSummaryLoading && !summaryMetrics ? (
              <>
                <HealthBarSkeleton />
                <HealthBarSkeleton />
              </>
            ) : (
              <>
                <HealthBar
                  unique={summary.newDownloads}
                  duplicates={summary.duplicateDownloads}
                  total={summary.totalDownloads}
                  onBubbleClick={handleHealthBarClick}
                  labels={{ unique: 'New', duplicates: 'Duplicate', total: 'Total' }}
                />
                <HealthBar
                  title="Storage Efficiency"
                  subtitle="Analysis of storage usage by unique vs duplicate files"
                  unique={summary.newSize}
                  duplicates={summary.duplicateSize}
                  total={summary.totalSize}
                  labels={{ unique: 'Used', duplicates: 'Wasted', total: 'Total Size' }}
                  formatter={formatBytes}
                  colors={{ unique: 'green', duplicates: 'orange', total: 'blue' }}
                  onBubbleClick={handleHealthBarClick}
                />
              </>
            )}
          </div>
        </section>
      </div>

      {(isTrendsLoading || isActivityLoading || isHabitsLoading || isRecentDownloadsLoading) &&
      !(activityTrends && habits && recentDownloads.length > 0) ? (
        <TimeInsightsSkeleton />
      ) : (
        <TimeInsights
          trends={activityTrends}
          dailyActivity={dailyActivity}
          habits={habits}
          recentDownloads={
            recentDownloads.map((item) => ({
              ...item,
              id: item._id,
              createdAt: item.downloadedAt,
            })) as any
          }
          onOverviewClick={handleOverviewClick}
          onDateClick={handleDateClick}
          onViewAllClick={handleViewAllClick}
          onFileClick={handleEventClick}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {isFileMetricsLoading && !fileMetrics ? (
          <FileAnalyticsSkeleton />
        ) : (
          <FileAnalytics
            fileMetrics={fileMetrics}
            onCategoryClick={handleCategoryClick}
            onExtensionClick={handleExtensionClick}
            onShowAll={handleViewAllClick}
          />
        )}

        {isSourceStatsLoading && !sourceStats ? (
          <SourceAnalyticsSkeleton />
        ) : (
          <SourceAnalytics
            sourceStats={sourceStats}
            onSourceClick={handleSourceDomainClick}
            onShowAll={handleViewAllClick}
            onSourceOthersClick={handleSourceOthersClick}
          />
        )}
      </div>

      <DetailsDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={drawerTitle}
        count={drawerCount}
        footer={
          !isHistoryLoading &&
          historyPagination &&
          historyPagination.pages > 1 && (
            <div className="flex justify-end items-center w-full gap-3">
              <Button
                variant="primary-icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 select-none">
                <span>Page</span>
                <span className="flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-md font-semibold text-xs">
                  {historyPagination.current}
                </span>
                <span>of</span>
                <span className="flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-md font-semibold text-xs">
                  {historyPagination.pages}
                </span>
              </div>

              <Button
                variant="primary-icon"
                disabled={page >= historyPagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )
        }
      >
        <div
          className={
            !isHistoryLoading && history.length === 0
              ? 'h-full flex flex-col items-center justify-center'
              : 'space-y-4'
          }
        >
          {isHistoryLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <DownloadListSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {history.map((item, index) => (
                <DownloadListItem
                  key={`${item._id || index}`}
                  file={{
                    ...item,
                    id: item._id,
                    createdAt: item.downloadedAt,
                    fileCategory: item.fileCategory || 'unknown',
                  }}
                />
              ))}

              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="anim-fade-in-up anim-fade-in-up--slow w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-1">
                    <FileQuestion className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 tracking-tight">
                    No Results found
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </DetailsDrawer>
    </div>
  );
};

export default DownloadsPage;
