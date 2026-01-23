"use client";

import React, { useState, useMemo } from 'react';
import { 
  History, 
  Undo2, 
  Redo2, 
  Trash2, 
  Clock, 
  Image as ImageIcon, 
  Video, 
  Palette,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { HistoryEntry } from '@/hooks/useHistory';
import { GenerationHistoryEntry } from '@/hooks/useHistory';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Canvas history
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  historyEntries: HistoryEntry<unknown>[];
  // Generation history
  generationHistory: GenerationHistoryEntry[];
  onRegeneratePrompt?: (entry: GenerationHistoryEntry) => void;
  onCopyPrompt?: (prompt: string) => void;
  onClearGenerationHistory?: () => void;
}

type TabType = 'actions' | 'generations';
type GenerationFilter = 'all' | 'image' | 'video' | 'design';

export function HistoryPanel({
  isOpen,
  onClose,
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  onUndo,
  onRedo,
  historyEntries,
  generationHistory,
  onRegeneratePrompt,
  onCopyPrompt,
  onClearGenerationHistory,
}: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('actions');
  const [generationFilter, setGenerationFilter] = useState<GenerationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const filteredGenerations = useMemo(() => {
    let filtered = generationHistory;
    
    if (generationFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === generationFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.prompt.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [generationHistory, generationFilter, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[360px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <History size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">历史记录</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'actions'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          操作历史
          {activeTab === 'actions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('generations')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'generations'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          生成历史
          <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
            {generationHistory.length}
          </span>
          {activeTab === 'generations' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'actions' ? (
          <ActionsHistoryTab
            canUndo={canUndo}
            canRedo={canRedo}
            undoCount={undoCount}
            redoCount={redoCount}
            onUndo={onUndo}
            onRedo={onRedo}
            historyEntries={historyEntries}
          />
        ) : (
          <GenerationsHistoryTab
            entries={filteredGenerations}
            filter={generationFilter}
            onFilterChange={setGenerationFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedEntries={expandedEntries}
            onToggleExpanded={toggleExpanded}
            onRegeneratePrompt={onRegeneratePrompt}
            onCopyPrompt={onCopyPrompt}
            onClearHistory={onClearGenerationHistory}
          />
        )}
      </div>
    </div>
  );
}

// Actions History Tab
interface ActionsHistoryTabProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  historyEntries: HistoryEntry<unknown>[];
}

function ActionsHistoryTab({
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  onUndo,
  onRedo,
  historyEntries,
}: ActionsHistoryTabProps) {
  return (
    <>
      {/* Undo/Redo Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              canUndo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Undo2 size={18} />
            <span>撤销</span>
            {undoCount > 0 && (
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                {undoCount}
              </span>
            )}
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              canRedo
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Redo2 size={18} />
            <span>重做</span>
            {redoCount > 0 && (
              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                {redoCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {historyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <History size={48} className="mb-3 opacity-50" />
            <p className="text-sm">暂无操作历史</p>
          </div>
        ) : (
          <div className="p-2">
            {historyEntries.slice().reverse().map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {entry.actionName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Generations History Tab
interface GenerationsHistoryTabProps {
  entries: GenerationHistoryEntry[];
  filter: GenerationFilter;
  onFilterChange: (filter: GenerationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedEntries: Set<string>;
  onToggleExpanded: (id: string) => void;
  onRegeneratePrompt?: (entry: GenerationHistoryEntry) => void;
  onCopyPrompt?: (prompt: string) => void;
  onClearHistory?: () => void;
}

function GenerationsHistoryTab({
  entries,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  expandedEntries,
  onToggleExpanded,
  onRegeneratePrompt,
  onCopyPrompt,
  onClearHistory,
}: GenerationsHistoryTabProps) {
  return (
    <>
      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索提示词..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {(['all', 'image', 'video', 'design'] as GenerationFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'image' ? '图片' : f === 'video' ? '视频' : '设计'}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ImageIcon size={48} className="mb-3 opacity-50" />
            <p className="text-sm">暂无生成历史</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {entries.map((entry) => (
              <GenerationEntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntries.has(entry.id)}
                onToggleExpanded={() => onToggleExpanded(entry.id)}
                onRegenerate={() => onRegeneratePrompt?.(entry)}
                onCopyPrompt={() => onCopyPrompt?.(entry.prompt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear History */}
      {entries.length > 0 && onClearHistory && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            清空生成历史
          </button>
        </div>
      )}
    </>
  );
}

// Generation Entry Card
interface GenerationEntryCardProps {
  entry: GenerationHistoryEntry;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRegenerate: () => void;
  onCopyPrompt: () => void;
}

function GenerationEntryCard({
  entry,
  isExpanded,
  onToggleExpanded,
  onRegenerate,
  onCopyPrompt,
}: GenerationEntryCardProps) {
  const TypeIcon = entry.type === 'image' ? ImageIcon : entry.type === 'video' ? Video : Palette;
  
  const StatusIcon = entry.status === 'success' 
    ? Check 
    : entry.status === 'error' 
      ? AlertCircle 
      : Loader2;
  
  const statusColor = entry.status === 'success'
    ? 'text-green-500'
    : entry.status === 'error'
      ? 'text-red-500'
      : 'text-blue-500';

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
          <TypeIcon size={16} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 truncate">{entry.prompt}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusIcon 
              size={12} 
              className={`${statusColor} ${entry.status === 'pending' ? 'animate-spin' : ''}`} 
            />
            <span className="text-xs text-gray-400">
              {formatTimestamp(entry.timestamp)}
            </span>
            {entry.duration && (
              <span className="text-xs text-gray-400">
                · {(entry.duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Result Preview */}
          {entry.result && entry.type === 'image' && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={entry.result} 
                alt="Generated" 
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Error Message */}
          {entry.error && (
            <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-600">{entry.error}</p>
            </div>
          )}

          {/* Parameters */}
          {Object.keys(entry.parameters).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">参数</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(entry.parameters).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyPrompt();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy size={12} />
              复制提示词
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500 rounded-lg text-xs font-medium text-white hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={12} />
              重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
