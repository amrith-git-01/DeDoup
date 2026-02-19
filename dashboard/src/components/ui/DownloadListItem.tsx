import React, { useState, memo } from 'react';
import {
  File,
  FileText,
  Image,
  Video,
  Archive,
  Music,
  Code,
  ChevronRight,
  FolderOpen,
  Clock,
  Globe,
  Tag,
  FileType,
  Link,
} from 'lucide-react';

import { formatBytes } from '../../utils/format';
import type { DownloadListItemProps } from '../../types/ui';

const getFileIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'image':
      return <Image className="w-5 h-5 text-emerald-500" />;
    case 'video':
      return <Video className="w-5 h-5 text-purple-500" />;
    case 'document':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'archive':
      return <Archive className="w-5 h-5 text-orange-500" />;
    case 'audio':
      return <Music className="w-5 h-5 text-pink-500" />;
    case 'code':
      return <Code className="w-5 h-5 text-cyan-500" />;
    case 'executable':
      return <Tag className="w-5 h-5 text-red-500" />;
    default:
      return <File className="w-5 h-5 text-gray-400" />;
  }
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
  truncate = false,
  isLink = false,
}: {
  icon: any;
  label: string;
  value: string | undefined;
  mono?: boolean;
  truncate?: boolean;
  isLink?: boolean;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex-shrink-0 text-gray-400">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">
          {label}
        </p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm text-indigo-600 hover:text-indigo-800 hover:underline ${mono ? 'font-mono text-xs' : ''} ${truncate ? 'truncate' : 'break-all'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        ) : (
          <p
            className={`text-sm text-gray-700 ${mono ? 'font-mono text-xs' : ''} ${truncate ? 'truncate' : 'break-all'}`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'image':
      return 'hover:border-emerald-200 ring-emerald-50 text-emerald-900 border-emerald-200';
    case 'video':
      return 'hover:border-purple-200 ring-purple-50 text-purple-900 border-purple-200';
    case 'document':
      return 'hover:border-blue-200 ring-blue-50 text-blue-900 border-blue-200';
    case 'archive':
      return 'hover:border-orange-200 ring-orange-50 text-orange-900 border-orange-200';
    case 'audio':
      return 'hover:border-pink-200 ring-pink-50 text-pink-900 border-pink-200';
    case 'code':
      return 'hover:border-cyan-200 ring-cyan-50 text-cyan-900 border-cyan-200';
    case 'executable':
      return 'hover:border-red-200 ring-red-50 text-red-900 border-red-200';
    default:
      return 'hover:border-gray-200 ring-gray-50 text-gray-900 border-gray-200';
  }
};

const DownloadListItem: React.FC<DownloadListItemProps> = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const icon = getFileIcon(file.fileCategory || 'unknown');
  const colorClass = getCategoryColor(file.fileCategory || 'unknown');

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`anim-fade-in-up ui-hover-card group relative overflow-hidden bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer
        ${
          isExpanded
            ? `shadow-md ${colorClass.split(' ').find((c) => c.startsWith('border-') && !c.startsWith('hover:border-')) || 'border-gray-200'}`
            : `border-gray-100 shadow-sm ${colorClass.split(' ').find((c) => c.startsWith('hover:border-'))}`
        }
      `}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Icon Container with subtle background */}
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200
          ${
            isExpanded
              ? `scale-110 ${
                  colorClass
                    .split(' ')
                    .find((c) => c.startsWith('ring-'))
                    ?.replace('ring-', 'bg-') || 'bg-gray-50'
                }`
              : 'bg-gray-50 group-hover:bg-gray-100'
          }
        `}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold truncate pr-2 mb-1 transition-colors ${isExpanded ? colorClass.split(' ').find((c) => c.startsWith('text-')) : 'text-gray-900 group-hover:text-gray-700'}`}
            title={file.filename}
          >
            {file.filename}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
              {formatBytes(file.size)}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>
              {new Date(file.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              <span className="mx-1 text-gray-300">·</span>
              {new Date(file.createdAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              file.status === 'duplicate'
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            {file.status === 'duplicate' ? 'Duplicate' : 'New'}
          </span>
          <div
            className="text-gray-400 transition-transform duration-200 ease-out"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`border-t border-gray-100 ${
              colorClass
                .split(' ')
                .find((c) => c.startsWith('ring-'))
                ?.replace('ring-', 'bg-') || 'bg-gray-50'
            }/30`}
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4">
              {/* Left column – 2/3 width */}
              <div className="md:col-span-2 space-y-5">
                <DetailRow icon={Link} label="Source URL" value={file.url} truncate isLink />
                <DetailRow
                  icon={Clock}
                  label="Downloaded At"
                  value={new Date(file.createdAt).toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                />
                <DetailRow icon={Tag} label="Category" value={file.fileCategory} />
              </div>
              {/* Right column – 1/3 width */}
              <div className="md:col-span-1 space-y-5">
                <DetailRow
                  icon={Globe}
                  label="Source Domain"
                  value={file.sourceDomain || 'Unknown Source'}
                />
                <DetailRow
                  icon={FileType}
                  label="MIME Type"
                  value={file.mimeType || 'application/octet-stream'}
                />
                <DetailRow
                  icon={File}
                  label="Extension"
                  value={file.fileExtension ? `.${file.fileExtension}` : 'N/A'}
                />
              </div>
              {/* Path – full width */}
              <div className="col-span-full">
                <DetailRow
                  icon={FolderOpen}
                  label="File Path"
                  value={file.destinationPath || file.sourcePath}
                  mono
                  truncate
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DownloadListItem);
