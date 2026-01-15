"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface HistoryActions<T> {
  set: (newPresent: T, actionName?: string) => void;
  undo: () => void;
  redo: () => void;
  reset: (newPresent: T) => void;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  lastAction: string | null;
  history: HistoryEntry<T>[];
}

export interface HistoryEntry<T> {
  state: T;
  timestamp: number;
  actionName: string;
}

export interface UseHistoryOptions {
  maxHistoryLength?: number;
  debounceMs?: number;
  onUndo?: () => void;
  onRedo?: () => void;
  onChange?: (state: unknown, actionName: string) => void;
}

const DEFAULT_MAX_HISTORY = 100;
const DEFAULT_DEBOUNCE_MS = 300;

export function useHistory<T>(
  initialPresent: T,
  options: UseHistoryOptions = {}
): [T, HistoryActions<T>] {
  const {
    maxHistoryLength = DEFAULT_MAX_HISTORY,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    onUndo,
    onRedo,
    onChange,
  } = options;

  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    { state: initialPresent, timestamp: Date.now(), actionName: 'Initial state' }
  ]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const set = useCallback((newPresent: T, actionName: string = 'Update') => {
    const now = Date.now();
    
    // Debounce rapid updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const shouldDebounce = now - lastUpdateRef.current < debounceMs;
    
    if (shouldDebounce) {
      debounceTimerRef.current = setTimeout(() => {
        performSet(newPresent, actionName);
      }, debounceMs);
    } else {
      performSet(newPresent, actionName);
    }
    
    lastUpdateRef.current = now;
  }, [debounceMs]);

  const performSet = useCallback((newPresent: T, actionName: string) => {
    setState(currentState => {
      const { past, present } = currentState;
      
      // Don't add to history if the state hasn't changed
      if (JSON.stringify(present) === JSON.stringify(newPresent)) {
        return currentState;
      }

      const newPast = [...past, present];
      
      // Limit history length
      if (newPast.length > maxHistoryLength) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear future on new action
      };
    });

    setHistory(currentHistory => {
      const newEntry: HistoryEntry<T> = {
        state: newPresent,
        timestamp: Date.now(),
        actionName,
      };
      
      const newHistory = [...currentHistory, newEntry];
      
      // Limit history entries
      if (newHistory.length > maxHistoryLength) {
        newHistory.shift();
      }
      
      return newHistory;
    });

    setLastAction(actionName);
    onChange?.(newPresent, actionName);
  }, [maxHistoryLength, onChange]);

  const undo = useCallback(() => {
    setState(currentState => {
      const { past, present, future } = currentState;
      
      if (past.length === 0) {
        return currentState;
      }

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      onUndo?.();
      setLastAction('Undo');

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, [onUndo]);

  const redo = useCallback(() => {
    setState(currentState => {
      const { past, present, future } = currentState;
      
      if (future.length === 0) {
        return currentState;
      }

      const next = future[0];
      const newFuture = future.slice(1);

      onRedo?.();
      setLastAction('Redo');

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, [onRedo]);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
    setHistory([
      { state: newPresent, timestamp: Date.now(), actionName: 'Reset' }
    ]);
    setLastAction('Reset');
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return [
    state.present,
    {
      set,
      undo,
      redo,
      reset,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      undoCount: state.past.length,
      redoCount: state.future.length,
      lastAction,
      history,
    },
  ];
}

// Specialized hook for canvas elements with optimized diffing
export interface CanvasHistoryState {
  elements: unknown[];
  selectedIds: string[];
  viewport: { scale: number; pan: { x: number; y: number } };
}

export function useCanvasHistory(
  initialState: CanvasHistoryState,
  options: UseHistoryOptions = {}
) {
  const [state, actions] = useHistory<CanvasHistoryState>(initialState, {
    ...options,
    debounceMs: options.debounceMs ?? 500, // Longer debounce for canvas
  });

  const updateElements = useCallback((
    newElements: unknown[],
    actionName: string = 'Update elements'
  ) => {
    actions.set({
      ...state,
      elements: newElements,
    }, actionName);
  }, [state, actions]);

  const updateSelection = useCallback((
    newSelectedIds: string[],
    actionName: string = 'Update selection'
  ) => {
    // Selection changes don't go into undo history
    // This is intentional - most design tools work this way
  }, []);

  const updateViewport = useCallback((
    newViewport: { scale: number; pan: { x: number; y: number } },
    actionName: string = 'Update viewport'
  ) => {
    // Viewport changes don't go into undo history
    // This is intentional - most design tools work this way
  }, []);

  return {
    state,
    ...actions,
    updateElements,
    updateSelection,
    updateViewport,
  };
}

// Hook for tracking generation history (AI prompts and results)
export interface GenerationHistoryEntry {
  id: string;
  type: 'image' | 'video' | 'design';
  prompt: string;
  parameters: Record<string, unknown>;
  result?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  timestamp: number;
  duration?: number;
}

export function useGenerationHistory(maxEntries: number = 50) {
  const [entries, setEntries] = useState<GenerationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('generation-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setEntries(parsed.slice(0, maxEntries));
      }
    } catch (error) {
      console.error('Failed to load generation history:', error);
    }
  }, [maxEntries]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('generation-history', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save generation history:', error);
    }
  }, [entries]);

  const addEntry = useCallback((entry: Omit<GenerationHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: GenerationHistoryEntry = {
      ...entry,
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setEntries(current => {
      const updated = [newEntry, ...current];
      return updated.slice(0, maxEntries);
    });

    return newEntry.id;
  }, [maxEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<GenerationHistoryEntry>) => {
    setEntries(current =>
      current.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(current => current.filter(entry => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    localStorage.removeItem('generation-history');
  }, []);

  const getEntriesByType = useCallback((type: GenerationHistoryEntry['type']) => {
    return entries.filter(entry => entry.type === type);
  }, [entries]);

  const getRecentPrompts = useCallback((type?: GenerationHistoryEntry['type'], limit: number = 10) => {
    let filtered = entries;
    if (type) {
      filtered = entries.filter(entry => entry.type === type);
    }
    return filtered
      .filter(entry => entry.status === 'success')
      .slice(0, limit)
      .map(entry => entry.prompt);
  }, [entries]);

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    removeEntry,
    clearHistory,
    getEntriesByType,
    getRecentPrompts,
    totalCount: entries.length,
    successCount: entries.filter(e => e.status === 'success').length,
    errorCount: entries.filter(e => e.status === 'error').length,
  };
}
