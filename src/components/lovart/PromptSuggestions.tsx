"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Shuffle, 
  ChevronRight,
  Star,
  Bookmark,
  BookmarkCheck,
  X,
  Search,
  Filter,
  Wand2
} from 'lucide-react';

export interface PromptSuggestion {
  id: string;
  text: string;
  category: PromptCategory;
  tags: string[];
  popularity: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export type PromptCategory = 
  | 'character'
  | 'landscape'
  | 'abstract'
  | 'product'
  | 'architecture'
  | 'fashion'
  | 'food'
  | 'animal'
  | 'vehicle'
  | 'fantasy'
  | 'scifi'
  | 'portrait'
  | 'illustration'
  | 'logo'
  | 'ui';

const CATEGORY_LABELS: Record<PromptCategory, string> = {
  character: '角色',
  landscape: '风景',
  abstract: '抽象',
  product: '产品',
  architecture: '建筑',
  fashion: '时尚',
  food: '美食',
  animal: '动物',
  vehicle: '载具',
  fantasy: '奇幻',
  scifi: '科幻',
  portrait: '肖像',
  illustration: '插画',
  logo: '标志',
  ui: 'UI设计',
};

const CATEGORY_COLORS: Record<PromptCategory, string> = {
  character: 'bg-purple-100 text-purple-700',
  landscape: 'bg-green-100 text-green-700',
  abstract: 'bg-pink-100 text-pink-700',
  product: 'bg-blue-100 text-blue-700',
  architecture: 'bg-amber-100 text-amber-700',
  fashion: 'bg-rose-100 text-rose-700',
  food: 'bg-orange-100 text-orange-700',
  animal: 'bg-emerald-100 text-emerald-700',
  vehicle: 'bg-slate-100 text-slate-700',
  fantasy: 'bg-violet-100 text-violet-700',
  scifi: 'bg-cyan-100 text-cyan-700',
  portrait: 'bg-red-100 text-red-700',
  illustration: 'bg-indigo-100 text-indigo-700',
  logo: 'bg-gray-100 text-gray-700',
  ui: 'bg-teal-100 text-teal-700',
};

// Sample suggestions database
const SAMPLE_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: '1',
    text: 'A majestic dragon flying over a medieval castle at sunset, cinematic lighting, highly detailed',
    category: 'fantasy',
    tags: ['dragon', 'castle', 'sunset', 'epic'],
    popularity: 95,
    isFeatured: true,
  },
  {
    id: '2',
    text: 'Minimalist logo design for a tech startup, clean lines, modern, professional',
    category: 'logo',
    tags: ['minimalist', 'tech', 'modern'],
    popularity: 88,
  },
  {
    id: '3',
    text: 'Cozy coffee shop interior, warm lighting, plants, wooden furniture, hygge aesthetic',
    category: 'architecture',
    tags: ['interior', 'cozy', 'cafe'],
    popularity: 82,
  },
  {
    id: '4',
    text: 'Cyberpunk city street at night, neon lights, rain reflections, blade runner style',
    category: 'scifi',
    tags: ['cyberpunk', 'neon', 'night', 'futuristic'],
    popularity: 91,
    isNew: true,
  },
  {
    id: '5',
    text: 'Elegant perfume bottle product shot, studio lighting, luxury, minimalist background',
    category: 'product',
    tags: ['perfume', 'luxury', 'product'],
    popularity: 76,
  },
  {
    id: '6',
    text: 'Cute anime girl with cat ears, pastel colors, kawaii style, detailed eyes',
    category: 'character',
    tags: ['anime', 'cute', 'kawaii'],
    popularity: 89,
  },
  {
    id: '7',
    text: 'Serene Japanese garden with cherry blossoms, koi pond, traditional architecture',
    category: 'landscape',
    tags: ['japanese', 'garden', 'peaceful'],
    popularity: 85,
  },
  {
    id: '8',
    text: 'Abstract fluid art, vibrant colors, marble texture, gold accents',
    category: 'abstract',
    tags: ['fluid', 'colorful', 'artistic'],
    popularity: 72,
  },
  {
    id: '9',
    text: 'Gourmet burger with melting cheese, fresh vegetables, rustic wooden board',
    category: 'food',
    tags: ['burger', 'food photography', 'appetizing'],
    popularity: 78,
  },
  {
    id: '10',
    text: 'Majestic lion portrait, golden hour lighting, savanna background, wildlife photography',
    category: 'animal',
    tags: ['lion', 'wildlife', 'portrait'],
    popularity: 86,
  },
  {
    id: '11',
    text: 'Futuristic sports car concept, sleek design, metallic finish, studio lighting',
    category: 'vehicle',
    tags: ['car', 'concept', 'futuristic'],
    popularity: 81,
  },
  {
    id: '12',
    text: 'Fashion model in haute couture dress, editorial style, dramatic lighting',
    category: 'fashion',
    tags: ['fashion', 'editorial', 'haute couture'],
    popularity: 79,
  },
  {
    id: '13',
    text: 'Professional headshot, business attire, neutral background, confident expression',
    category: 'portrait',
    tags: ['headshot', 'professional', 'business'],
    popularity: 74,
  },
  {
    id: '14',
    text: 'Whimsical children book illustration, magical forest, friendly creatures',
    category: 'illustration',
    tags: ['children', 'whimsical', 'magical'],
    popularity: 83,
  },
  {
    id: '15',
    text: 'Modern mobile app UI design, dark mode, glassmorphism, clean layout',
    category: 'ui',
    tags: ['mobile', 'dark mode', 'glassmorphism'],
    popularity: 87,
    isNew: true,
  },
];

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  recentPrompts?: string[];
  savedPrompts?: string[];
  onSavePrompt?: (prompt: string) => void;
  onRemoveSavedPrompt?: (prompt: string) => void;
  compact?: boolean;
}

export function PromptSuggestions({
  onSelectPrompt,
  recentPrompts = [],
  savedPrompts = [],
  onSavePrompt,
  onRemoveSavedPrompt,
  compact = false,
}: PromptSuggestionsProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'recent' | 'saved'>('suggestions');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const filteredSuggestions = useMemo(() => {
    let suggestions = SAMPLE_SUGGESTIONS;
    
    if (selectedCategory) {
      suggestions = suggestions.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      suggestions = suggestions.filter(s => 
        s.text.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return suggestions.sort((a, b) => b.popularity - a.popularity);
  }, [selectedCategory, searchQuery]);

  const featuredSuggestions = useMemo(() => 
    SAMPLE_SUGGESTIONS.filter(s => s.isFeatured),
  []);

  const newSuggestions = useMemo(() => 
    SAMPLE_SUGGESTIONS.filter(s => s.isNew),
  []);

  const getRandomSuggestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_SUGGESTIONS.length);
    return SAMPLE_SUGGESTIONS[randomIndex];
  }, []);

  const handleRandomPrompt = () => {
    const suggestion = getRandomSuggestion();
    onSelectPrompt(suggestion.text);
  };

  const isSaved = (prompt: string) => savedPrompts.includes(prompt);

  const toggleSave = (prompt: string) => {
    if (isSaved(prompt)) {
      onRemoveSavedPrompt?.(prompt);
    } else {
      onSavePrompt?.(prompt);
    }
  };

  if (compact) {
    return (
      <CompactPromptSuggestions
        suggestions={filteredSuggestions.slice(0, 5)}
        onSelectPrompt={onSelectPrompt}
        onRandomPrompt={handleRandomPrompt}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" />
            <h3 className="font-semibold text-gray-900">提示词灵感</h3>
          </div>
          <button
            onClick={handleRandomPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors text-sm font-medium"
          >
            <Shuffle size={14} />
            随机
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <TabButton
            active={activeTab === 'suggestions'}
            onClick={() => setActiveTab('suggestions')}
            icon={<Sparkles size={14} />}
            label="推荐"
          />
          <TabButton
            active={activeTab === 'recent'}
            onClick={() => setActiveTab('recent')}
            icon={<Clock size={14} />}
            label="最近"
            count={recentPrompts.length}
          />
          <TabButton
            active={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
            icon={<Bookmark size={14} />}
            label="收藏"
            count={savedPrompts.length}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索提示词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">分类</span>
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  {showAllCategories ? '收起' : '展开全部'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {(showAllCategories 
                  ? Object.entries(CATEGORY_LABELS) 
                  : Object.entries(CATEGORY_LABELS).slice(0, 6)
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as PromptCategory)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === key
                        ? CATEGORY_COLORS[key as PromptCategory]
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            {!selectedCategory && !searchQuery && featuredSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-xs font-medium text-gray-500">精选</span>
                </div>
                {featuredSuggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onSelect={() => onSelectPrompt(suggestion.text)}
                    isSaved={isSaved(suggestion.text)}
                    onToggleSave={() => toggleSave(suggestion.text)}
                  />
                ))}
              </div>
            )}

            {/* New */}
            {!selectedCategory && !searchQuery && newSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-xs font-medium text-gray-500">最新</span>
                </div>
                {newSuggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onSelect={() => onSelectPrompt(suggestion.text)}
                    isSaved={isSaved(suggestion.text)}
                    onToggleSave={() => toggleSave(suggestion.text)}
                  />
                ))}
              </div>
            )}

            {/* All Suggestions */}
            <div className="space-y-2">
              {(selectedCategory || searchQuery) && (
                <span className="text-xs font-medium text-gray-500">
                  {filteredSuggestions.length} 个结果
                </span>
              )}
              {filteredSuggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={() => onSelectPrompt(suggestion.text)}
                  isSaved={isSaved(suggestion.text)}
                  onToggleSave={() => toggleSave(suggestion.text)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="p-4">
            {recentPrompts.length === 0 ? (
              <EmptyState
                icon={<Clock size={32} />}
                title="暂无最近使用"
                description="你使用过的提示词会显示在这里"
              />
            ) : (
              <div className="space-y-2">
                {recentPrompts.map((prompt, index) => (
                  <PromptCard
                    key={index}
                    prompt={prompt}
                    onSelect={() => onSelectPrompt(prompt)}
                    isSaved={isSaved(prompt)}
                    onToggleSave={() => toggleSave(prompt)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="p-4">
            {savedPrompts.length === 0 ? (
              <EmptyState
                icon={<Bookmark size={32} />}
                title="暂无收藏"
                description="点击提示词旁的书签图标收藏"
              />
            ) : (
              <div className="space-y-2">
                {savedPrompts.map((prompt, index) => (
                  <PromptCard
                    key={index}
                    prompt={prompt}
                    onSelect={() => onSelectPrompt(prompt)}
                    isSaved={true}
                    onToggleSave={() => toggleSave(prompt)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className={`px-1.5 py-0.5 rounded text-xs ${
          active ? 'bg-gray-100' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

interface SuggestionCardProps {
  suggestion: PromptSuggestion;
  onSelect: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

function SuggestionCard({ suggestion, onSelect, isSaved, onToggleSave }: SuggestionCardProps) {
  return (
    <div className="group p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex-1" onClick={onSelect}>
          <p className="text-sm text-gray-700 line-clamp-2">{suggestion.text}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[suggestion.category]}`}>
              {CATEGORY_LABELS[suggestion.category]}
            </span>
            {suggestion.isNew && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                新
              </span>
            )}
            {suggestion.isFeatured && (
              <Star size={12} className="text-amber-500" />
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved
              ? 'text-purple-500 bg-purple-50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
    </div>
  );
}

interface PromptCardProps {
  prompt: string;
  onSelect: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

function PromptCard({ prompt, onSelect, isSaved, onToggleSave }: PromptCardProps) {
  return (
    <div className="group p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex-1" onClick={onSelect}>
          <p className="text-sm text-gray-700 line-clamp-2">{prompt}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved
              ? 'text-purple-500 bg-purple-50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="mb-3 opacity-50">{icon}</div>
      <p className="font-medium text-gray-600">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}

// Compact version for inline use
interface CompactPromptSuggestionsProps {
  suggestions: PromptSuggestion[];
  onSelectPrompt: (prompt: string) => void;
  onRandomPrompt: () => void;
}

function CompactPromptSuggestions({ suggestions, onSelectPrompt, onRandomPrompt }: CompactPromptSuggestionsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        onClick={onRandomPrompt}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-colors text-sm"
      >
        <Wand2 size={14} />
        随机灵感
      </button>
      {suggestions.map(suggestion => (
        <button
          key={suggestion.id}
          onClick={() => onSelectPrompt(suggestion.text)}
          className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-sm truncate max-w-[200px]"
        >
          {suggestion.text.slice(0, 30)}...
        </button>
      ))}
    </div>
  );
}

// Hook for managing saved prompts
export function useSavedPrompts() {
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved-prompts');
      if (saved) {
        setSavedPrompts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved prompts:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('saved-prompts', JSON.stringify(savedPrompts));
    } catch (error) {
      console.error('Failed to save prompts:', error);
    }
  }, [savedPrompts]);

  const savePrompt = useCallback((prompt: string) => {
    setSavedPrompts(prev => {
      if (prev.includes(prompt)) return prev;
      return [prompt, ...prev].slice(0, 100); // Max 100 saved
    });
  }, []);

  const removePrompt = useCallback((prompt: string) => {
    setSavedPrompts(prev => prev.filter(p => p !== prompt));
  }, []);

  const clearAll = useCallback(() => {
    setSavedPrompts([]);
  }, []);

  return {
    savedPrompts,
    savePrompt,
    removePrompt,
    clearAll,
  };
}
