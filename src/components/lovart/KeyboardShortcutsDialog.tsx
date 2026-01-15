"use client";

import React, { useState, useMemo } from 'react';
import { X, Search, Keyboard, Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  ShortcutDefinition, 
  DEFAULT_SHORTCUTS, 
  getShortcutDisplayString,
  getShortcutsByCategory 
} from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isMac?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  edit: '编辑',
  view: '视图',
  arrange: '排列',
  file: '文件',
  navigation: '导航',
  tools: '工具',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  edit: <Command size={16} />,
  view: <Search size={16} />,
  arrange: <ArrowUp size={16} />,
  file: <Keyboard size={16} />,
  navigation: <ArrowRight size={16} />,
  tools: <Keyboard size={16} />,
};

export function KeyboardShortcutsDialog({ isOpen, onClose, isMac = false }: KeyboardShortcutsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const shortcutsByCategory = useMemo(() => {
    return getShortcutsByCategory(DEFAULT_SHORTCUTS);
  }, []);

  const filteredShortcuts = useMemo(() => {
    let shortcuts = DEFAULT_SHORTCUTS;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      shortcuts = shortcuts.filter(s => 
        s.description.toLowerCase().includes(query) ||
        s.action.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      shortcuts = shortcuts.filter(s => s.category === selectedCategory);
    }
    
    return getShortcutsByCategory(shortcuts);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Keyboard size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">键盘快捷键</h2>
              <p className="text-sm text-gray-500">快速操作，提升效率</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索快捷键..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_ICONS[key]}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {Object.entries(filteredShortcuts).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">没有找到匹配的快捷键</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(filteredShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400">{CATEGORY_ICONS[category]}</span>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {CATEGORY_LABELS[category] || category}
                    </h3>
                    <span className="text-xs text-gray-400">({shortcuts.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {shortcuts.map((shortcut, index) => (
                      <ShortcutItem 
                        key={`${shortcut.action}-${index}`} 
                        shortcut={shortcut} 
                        isMac={isMac} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {isMac ? '使用 ⌘ Command 键' : '使用 Ctrl 键'} 作为主修饰键
            </span>
            <span>
              共 {DEFAULT_SHORTCUTS.length} 个快捷键
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShortcutItemProps {
  shortcut: ShortcutDefinition;
  isMac: boolean;
}

function ShortcutItem({ shortcut, isMac }: ShortcutItemProps) {
  const displayString = getShortcutDisplayString(shortcut, isMac);
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <span className="text-sm text-gray-700">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {displayString.split(isMac ? '' : '+').map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-mono text-gray-600 shadow-sm min-w-[24px] text-center"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

// Quick reference component for showing in toolbar
export function ShortcutHint({ action, isMac = false }: { action: string; isMac?: boolean }) {
  const shortcut = DEFAULT_SHORTCUTS.find(s => s.action === action);
  
  if (!shortcut) return null;
  
  const displayString = getShortcutDisplayString(shortcut, isMac);
  
  return (
    <span className="text-xs text-gray-400 ml-2">
      {displayString}
    </span>
  );
}
