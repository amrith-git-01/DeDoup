import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchStats } from '../store/slices/statsSlice'
import { FileText, Image, Video, Music, Archive, FileQuestion, Download, RefreshCw, AlertCircle, HardDrive, Copy, CheckCircle, Clock } from 'lucide-react'

import { SMALL_CARD_HOVER, STATS_CARD_HOVER } from '../utils/styles'

export default function DownloadPage() {
  const dispatch = useAppDispatch()
  const { stats, isLoading, downloads } = useAppSelector(state => state.stats)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Fetch data on mount
    dispatch(fetchStats())

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchStats())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTimeAgo = (dateString: string) : string => {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if(diffInSeconds < 60){
      return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if(diffInMinutes < 60){
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if(diffInHours < 24){
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if(diffInDays < 30){
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if(diffInMonths < 12){
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await dispatch(fetchStats())
    // Keep spinning for a minimum duration so user sees the animation
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Downloads</h1>
          <p className="text-xs text-gray-600">
            Keep track of your downloads
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

            {/* Stats Grid */}
{stats && (
  <div className="grid grid-cols-2 gap-2 mb-4">
    {/* Total Downloads */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Total</span>
        <Download className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <p className="text-xl font-bold text-gray-900">{stats.totalDownloads}</p>
    </div>

    {/* Avg Duration */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Avg Duration</span>
        <Clock className="w-3.5 h-3.5 text-purple-600" />
      </div>
      <p className="text-xl font-bold text-purple-600">{stats.averageDuration}s</p>
    </div>

    {/* Unique Downloads */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Unique</span>
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      </div>
      <p className="text-xl font-bold text-green-600">{stats.uniqueDownloads}</p>
    </div>

    {/* Unique Size */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Unique Size</span>
        <HardDrive className="w-3.5 h-3.5 text-green-600" />
      </div>
      <p className="text-xl font-bold text-green-600">{formatBytes(stats.uniqueFilesSize)}</p>
    </div>

    {/* Duplicates */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Duplicates</span>
        <Copy className="w-3.5 h-3.5 text-orange-600" />
      </div>
      <p className="text-xl font-bold text-orange-600">{stats.duplicateDownloads}</p>
    </div>

    {/* Space Wasted */}
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${STATS_CARD_HOVER}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Space Wasted</span>
        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
      </div>
      <p className="text-xl font-bold text-red-600">{formatBytes(stats.duplicateFilesSize)}</p>
    </div>
  </div>
)}

      {/* File Categories Section */}
{stats && Object.keys(stats.fileCategories).length > 0 && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">File Categories</h2>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(stats.fileCategories)
        .sort(([categoryA], [categoryB]) => {
          // Custom sort order
          const order = ['document', 'image', 'video', 'audio', 'archive', 'other', 'code']
          return order.indexOf(categoryA.toLowerCase()) - order.indexOf(categoryB.toLowerCase())
        })
        .map(([category, count]) => {
          const getCategoryIcon = (cat: string) => {
            switch (cat.toLowerCase()) {
              case 'document':
                return <FileText className="w-4 h-4 text-blue-600" />
              case 'image':
                return <Image className="w-4 h-4 text-green-600" />
              case 'video':
                return <Video className="w-4 h-4 text-purple-600" />
              case 'audio':
                return <Music className="w-4 h-4 text-pink-600" />
              case 'archive':
                return <Archive className="w-4 h-4 text-orange-600" />
              case 'code':
                return <FileText className="w-4 h-4 text-indigo-600" />
              default:
                return <FileQuestion className="w-4 h-4 text-gray-600" />
            }
          }

          return (
            <div 
              key={category} 
              className={`flex items-center justify-between p-3 ${SMALL_CARD_HOVER}`}
            >
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
              </div>
              <span className="text-sm font-bold text-primary-600">{count}</span>
            </div>
          )
        })}
    </div>
  </div>
)}
      {/* File Extensions Section */}
      {stats && Object.keys(stats.fileExtensions).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">File Extensions</h2>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(stats.fileExtensions)
              .sort(([, a], [, b]) => b - a)
              .map(([extension, count]) => (
                <div
  key={extension}
  className={`flex items-center justify-between p-2 ${SMALL_CARD_HOVER}`}
>
                  <span className="text-xs font-medium text-gray-700 uppercase">.{extension}</span>
                  <span className="text-xs font-bold text-primary-600">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
            {/* Recent Downloads Section */}
      {downloads && downloads.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Downloads</h2>
          <div className="space-y-2">
            {downloads.slice(0, 10).map((download) => {
              const getCategoryIcon = (category?: string) => {
                switch (category?.toLowerCase()) {
                  case 'document':
                    return <FileText className="w-4 h-4 text-blue-600" />
                  case 'image':
                    return <Image className="w-4 h-4 text-green-600" />
                  case 'video':
                    return <Video className="w-4 h-4 text-purple-600" />
                  case 'audio':
                    return <Music className="w-4 h-4 text-pink-600" />
                  case 'archive':
                    return <Archive className="w-4 h-4 text-orange-600" />
                  case 'code':
                    return <FileText className="w-4 h-4 text-indigo-600" />
                  default:
                    return <FileQuestion className="w-4 h-4 text-gray-600" />
                }
              }

              return (
                <div
                  key={download.id}
                  className={`flex items-center gap-3 p-2 ${SMALL_CARD_HOVER}`}
                >
                  {getCategoryIcon(download.fileCategory)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {download.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(download.size || 0)} • {formatTimeAgo(download.createdAt)}
                    </p>
                  </div>
                  {download.status === 'duplicate' ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                      Duplicate
                    </span>
                    ) : (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      New
                    </span>
                  )}
                </div>
              ) 
            })}
          </div>
        </div>
      )}
    </div>
  )
}