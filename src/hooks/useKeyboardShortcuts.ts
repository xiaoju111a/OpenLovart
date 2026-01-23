"use client";

import { useEffect, useCallback, useRef } from 'react';

export type ShortcutAction = 
  | 'undo'
  | 'redo'
  | 'copy'
  | 'paste'
  | 'cut'
  | 'delete'
  | 'selectAll'
  | 'deselect'
  | 'duplicate'
  | 'group'
  | 'ungroup'
  | 'bringToFront'
  | 'sendToBack'
  | 'bringForward'
  | 'sendBackward'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomReset'
  | 'fitToScreen'
  | 'toggleGrid'
  | 'toggleSnap'
  | 'save'
  | 'export'
  | 'newProject'
  | 'openProject'
  | 'toggleSidebar'
  | 'toggleAiPanel'
  | 'escape'
  | 'enter'
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'moveUpFast'
  | 'moveDownFast'
  | 'moveLeftFast'
  | 'moveRightFast'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignTop'
  | 'alignMiddle'
  | 'alignBottom'
  | 'distributeHorizontal'
  | 'distributeVertical'
  | 'flipHorizontal'
  | 'flipVertical'
  | 'rotate90CW'
  | 'rotate90CCW'
  | 'lockElement'
  | 'unlockElement'
  | 'hideElement'
  | 'showAllElements'
  | 'focusSearch'
  | 'toggleFullscreen'
  | 'toggleDarkMode'
  | 'openHelp'
  | 'openSettings';

export interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: ShortcutAction;
  description: string;
  category: 'edit' | 'view' | 'arrange' | 'file' | 'navigation' | 'tools';
}

const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // Edit shortcuts
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo last action', category: 'edit' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', description: 'Redo last action', category: 'edit' },
  { key: 'y', ctrl: true, action: 'redo', description: 'Redo last action (alternative)', category: 'edit' },
  { key: 'c', ctrl: true, action: 'copy', description: 'Copy selected elements', category: 'edit' },
  { key: 'v', ctrl: true, action: 'paste', description: 'Paste elements', category: 'edit' },
  { key: 'x', ctrl: true, action: 'cut', description: 'Cut selected elements', category: 'edit' },
  { key: 'Delete', action: 'delete', description: 'Delete selected elements', category: 'edit' },
  { key: 'Backspace', action: 'delete', description: 'Delete selected elements', category: 'edit' },
  { key: 'a', ctrl: true, action: 'selectAll', description: 'Select all elements', category: 'edit' },
  { key: 'd', ctrl: true, action: 'duplicate', description: 'Duplicate selected elements', category: 'edit' },
  { key: 'Escape', action: 'escape', description: 'Deselect all / Cancel operation', category: 'edit' },
  { key: 'Enter', action: 'enter', description: 'Confirm / Edit text', category: 'edit' },
  
  // Arrange shortcuts
  { key: 'g', ctrl: true, action: 'group', description: 'Group selected elements', category: 'arrange' },
  { key: 'g', ctrl: true, shift: true, action: 'ungroup', description: 'Ungroup selected elements', category: 'arrange' },
  { key: ']', ctrl: true, action: 'bringToFront', description: 'Bring to front', category: 'arrange' },
  { key: '[', ctrl: true, action: 'sendToBack', description: 'Send to back', category: 'arrange' },
  { key: ']', ctrl: true, alt: true, action: 'bringForward', description: 'Bring forward', category: 'arrange' },
  { key: '[', ctrl: true, alt: true, action: 'sendBackward', description: 'Send backward', category: 'arrange' },
  { key: 'l', ctrl: true, shift: true, action: 'lockElement', description: 'Lock element', category: 'arrange' },
  { key: 'l', ctrl: true, alt: true, action: 'unlockElement', description: 'Unlock element', category: 'arrange' },
  
  // Alignment shortcuts
  { key: 'ArrowLeft', ctrl: true, shift: true, action: 'alignLeft', description: 'Align left', category: 'arrange' },
  { key: 'ArrowRight', ctrl: true, shift: true, action: 'alignRight', description: 'Align right', category: 'arrange' },
  { key: 'ArrowUp', ctrl: true, shift: true, action: 'alignTop', description: 'Align top', category: 'arrange' },
  { key: 'ArrowDown', ctrl: true, shift: true, action: 'alignBottom', description: 'Align bottom', category: 'arrange' },
  
  // View shortcuts
  { key: '=', ctrl: true, action: 'zoomIn', description: 'Zoom in', category: 'view' },
  { key: '+', ctrl: true, action: 'zoomIn', description: 'Zoom in', category: 'view' },
  { key: '-', ctrl: true, action: 'zoomOut', description: 'Zoom out', category: 'view' },
  { key: '0', ctrl: true, action: 'zoomReset', description: 'Reset zoom to 100%', category: 'view' },
  { key: '1', ctrl: true, action: 'fitToScreen', description: 'Fit to screen', category: 'view' },
  { key: "'", ctrl: true, action: 'toggleGrid', description: 'Toggle grid', category: 'view' },
  { key: ';', ctrl: true, action: 'toggleSnap', description: 'Toggle snap to grid', category: 'view' },
  { key: '\\', ctrl: true, action: 'toggleSidebar', description: 'Toggle sidebar', category: 'view' },
  { key: 'j', ctrl: true, action: 'toggleAiPanel', description: 'Toggle AI panel', category: 'view' },
  { key: 'F11', action: 'toggleFullscreen', description: 'Toggle fullscreen', category: 'view' },
  
  // Navigation shortcuts
  { key: 'ArrowUp', action: 'moveUp', description: 'Move up 1px', category: 'navigation' },
  { key: 'ArrowDown', action: 'moveDown', description: 'Move down 1px', category: 'navigation' },
  { key: 'ArrowLeft', action: 'moveLeft', description: 'Move left 1px', category: 'navigation' },
  { key: 'ArrowRight', action: 'moveRight', description: 'Move right 1px', category: 'navigation' },
  { key: 'ArrowUp', shift: true, action: 'moveUpFast', description: 'Move up 10px', category: 'navigation' },
  { key: 'ArrowDown', shift: true, action: 'moveDownFast', description: 'Move down 10px', category: 'navigation' },
  { key: 'ArrowLeft', shift: true, action: 'moveLeftFast', description: 'Move left 10px', category: 'navigation' },
  { key: 'ArrowRight', shift: true, action: 'moveRightFast', description: 'Move right 10px', category: 'navigation' },
  
  // File shortcuts
  { key: 's', ctrl: true, action: 'save', description: 'Save project', category: 'file' },
  { key: 'e', ctrl: true, shift: true, action: 'export', description: 'Export project', category: 'file' },
  { key: 'n', ctrl: true, action: 'newProject', description: 'New project', category: 'file' },
  { key: 'o', ctrl: true, action: 'openProject', description: 'Open project', category: 'file' },
  
  // Tools shortcuts
  { key: 'f', ctrl: true, action: 'focusSearch', description: 'Focus search', category: 'tools' },
  { key: '/', ctrl: true, action: 'openHelp', description: 'Open help', category: 'tools' },
  { key: ',', ctrl: true, action: 'openSettings', description: 'Open settings', category: 'tools' },
];

// Mac-specific shortcuts (use meta instead of ctrl)
const MAC_SHORTCUTS: ShortcutDefinition[] = DEFAULT_SHORTCUTS.map(shortcut => ({
  ...shortcut,
  meta: shortcut.ctrl,
  ctrl: false,
}));

interface UseKeyboardShortcutsOptions {
  onAction: (action: ShortcutAction) => void;
  enabled?: boolean;
  customShortcuts?: ShortcutDefinition[];
  preventDefault?: boolean;
}

export function useKeyboardShortcuts({
  onAction,
  enabled = true,
  customShortcuts,
  preventDefault = true,
}: UseKeyboardShortcutsOptions) {
  const isMac = useRef(false);
  
  useEffect(() => {
    isMac.current = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  }, []);

  const shortcuts = customShortcuts || (isMac.current ? MAC_SHORTCUTS : DEFAULT_SHORTCUTS);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow some shortcuts even in input fields
      const allowedInInput: ShortcutAction[] = ['escape', 'save'];
      const matchingShortcut = shortcuts.find(s => {
        const ctrlMatch = isMac.current ? (s.meta === event.metaKey) : (s.ctrl === event.ctrlKey);
        return (
          s.key.toLowerCase() === event.key.toLowerCase() &&
          ctrlMatch &&
          (s.shift || false) === event.shiftKey &&
          (s.alt || false) === event.altKey
        );
      });
      
      if (!matchingShortcut || !allowedInInput.includes(matchingShortcut.action)) {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = isMac.current 
        ? (shortcut.meta || false) === event.metaKey
        : (shortcut.ctrl || false) === event.ctrlKey;
      
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const shiftMatch = (shortcut.shift || false) === event.shiftKey;
      const altMatch = (shortcut.alt || false) === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        onAction(shortcut.action);
        return;
      }
    }
  }, [enabled, shortcuts, onAction, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isMac: isMac.current,
  };
}

export function getShortcutDisplayString(shortcut: ShortcutDefinition, isMac: boolean): string {
  const parts: string[] = [];
  
  if (isMac) {
    if (shortcut.ctrl) parts.push('⌃');
    if (shortcut.alt) parts.push('⌥');
    if (shortcut.shift) parts.push('⇧');
    if (shortcut.meta) parts.push('⌘');
  } else {
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
  }
  
  // Format special keys
  let keyDisplay = shortcut.key;
  switch (shortcut.key) {
    case 'ArrowUp': keyDisplay = '↑'; break;
    case 'ArrowDown': keyDisplay = '↓'; break;
    case 'ArrowLeft': keyDisplay = '←'; break;
    case 'ArrowRight': keyDisplay = '→'; break;
    case 'Delete': keyDisplay = isMac ? '⌫' : 'Del'; break;
    case 'Backspace': keyDisplay = '⌫'; break;
    case 'Enter': keyDisplay = isMac ? '↵' : 'Enter'; break;
    case 'Escape': keyDisplay = 'Esc'; break;
    case ' ': keyDisplay = 'Space'; break;
    default: keyDisplay = shortcut.key.toUpperCase();
  }
  
  parts.push(keyDisplay);
  
  return isMac ? parts.join('') : parts.join('+');
}

export function getShortcutsByCategory(shortcuts: ShortcutDefinition[]): Record<string, ShortcutDefinition[]> {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutDefinition[]>);
}

export { DEFAULT_SHORTCUTS, MAC_SHORTCUTS };
