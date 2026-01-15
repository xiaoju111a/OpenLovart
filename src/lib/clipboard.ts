"use client";

import { CanvasElement } from '@/components/lovart/CanvasArea';
import { v4 as uuidv4 } from 'uuid';

// Clipboard data structure
interface ClipboardData {
  type: 'lovart-elements';
  version: string;
  elements: CanvasElement[];
  timestamp: number;
}

// In-memory clipboard for internal copy/paste
let internalClipboard: ClipboardData | null = null;

// Offset for pasting (to avoid exact overlap)
const PASTE_OFFSET = 20;

/**
 * Copy elements to clipboard
 */
export async function copyElements(elements: CanvasElement[]): Promise<boolean> {
  if (elements.length === 0) return false;

  const clipboardData: ClipboardData = {
    type: 'lovart-elements',
    version: '1.0',
    elements: elements.map(el => ({ ...el })), // Deep copy
    timestamp: Date.now(),
  };

  // Store in internal clipboard
  internalClipboard = clipboardData;

  // Try to also copy to system clipboard as JSON
  try {
    const jsonString = JSON.stringify(clipboardData);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (error) {
    console.warn('Failed to copy to system clipboard:', error);
    // Internal clipboard still works
    return true;
  }
}

/**
 * Cut elements (copy + return IDs for deletion)
 */
export async function cutElements(elements: CanvasElement[]): Promise<string[]> {
  await copyElements(elements);
  return elements.map(el => el.id);
}

/**
 * Paste elements from clipboard
 */
export async function pasteElements(
  offset: { x: number; y: number } = { x: PASTE_OFFSET, y: PASTE_OFFSET }
): Promise<CanvasElement[]> {
  let clipboardData: ClipboardData | null = null;

  // Try to read from system clipboard first
  try {
    const text = await navigator.clipboard.readText();
    const parsed = JSON.parse(text);
    if (parsed.type === 'lovart-elements') {
      clipboardData = parsed;
    }
  } catch (error) {
    // Fall back to internal clipboard
    clipboardData = internalClipboard;
  }

  if (!clipboardData || clipboardData.elements.length === 0) {
    return [];
  }

  // Create new elements with new IDs and offset positions
  const newElements: CanvasElement[] = clipboardData.elements.map(el => ({
    ...el,
    id: uuidv4(),
    x: el.x + offset.x,
    y: el.y + offset.y,
  }));

  // Update internal clipboard offset for subsequent pastes
  if (internalClipboard) {
    internalClipboard.elements = internalClipboard.elements.map(el => ({
      ...el,
      x: el.x + PASTE_OFFSET,
      y: el.y + PASTE_OFFSET,
    }));
  }

  return newElements;
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  if (internalClipboard && internalClipboard.elements.length > 0) {
    return true;
  }

  try {
    const text = await navigator.clipboard.readText();
    const parsed = JSON.parse(text);
    return parsed.type === 'lovart-elements' && parsed.elements.length > 0;
  } catch {
    return false;
  }
}

/**
 * Clear clipboard
 */
export function clearClipboard(): void {
  internalClipboard = null;
}

/**
 * Duplicate elements in place
 */
export function duplicateElements(
  elements: CanvasElement[],
  offset: { x: number; y: number } = { x: PASTE_OFFSET, y: PASTE_OFFSET }
): CanvasElement[] {
  return elements.map(el => ({
    ...el,
    id: uuidv4(),
    x: el.x + offset.x,
    y: el.y + offset.y,
  }));
}

/**
 * Copy element styles only (for paste style)
 */
interface ElementStyle {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  strokeWidth?: number;
}

let styleClipboard: ElementStyle | null = null;

export function copyStyle(element: CanvasElement): void {
  styleClipboard = {
    color: element.color,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    strokeWidth: element.strokeWidth,
  };
}

export function pasteStyle(element: CanvasElement): Partial<CanvasElement> {
  if (!styleClipboard) return {};
  
  const updates: Partial<CanvasElement> = {};
  
  if (styleClipboard.color !== undefined) {
    updates.color = styleClipboard.color;
  }
  if (element.type === 'text') {
    if (styleClipboard.fontSize !== undefined) {
      updates.fontSize = styleClipboard.fontSize;
    }
    if (styleClipboard.fontFamily !== undefined) {
      updates.fontFamily = styleClipboard.fontFamily;
    }
  }
  if (element.type === 'path' && styleClipboard.strokeWidth !== undefined) {
    updates.strokeWidth = styleClipboard.strokeWidth;
  }
  
  return updates;
}

export function hasStyleClipboard(): boolean {
  return styleClipboard !== null;
}

/**
 * Copy image to clipboard (for sharing)
 */
export async function copyImageToClipboard(imageDataUrl: string): Promise<boolean> {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    
    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
}

/**
 * Paste image from clipboard
 */
export async function pasteImageFromClipboard(): Promise<string | null> {
  try {
    const items = await navigator.clipboard.read();
    
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to paste image from clipboard:', error);
    return null;
  }
}

/**
 * Export elements as copyable text (for sharing)
 */
export function elementsToShareableText(elements: CanvasElement[]): string {
  const data: ClipboardData = {
    type: 'lovart-elements',
    version: '1.0',
    elements,
    timestamp: Date.now(),
  };
  
  return btoa(JSON.stringify(data));
}

/**
 * Import elements from shareable text
 */
export function elementsFromShareableText(text: string): CanvasElement[] | null {
  try {
    const decoded = atob(text);
    const data: ClipboardData = JSON.parse(decoded);
    
    if (data.type !== 'lovart-elements') {
      return null;
    }
    
    // Generate new IDs for imported elements
    return data.elements.map(el => ({
      ...el,
      id: uuidv4(),
    }));
  } catch {
    return null;
  }
}

/**
 * Clipboard event handlers for keyboard shortcuts
 */
export function setupClipboardHandlers(
  getSelectedElements: () => CanvasElement[],
  onPaste: (elements: CanvasElement[]) => void,
  onDelete: (ids: string[]) => void
): () => void {
  const handleCopy = async (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    const selected = getSelectedElements();
    if (selected.length > 0) {
      e.preventDefault();
      await copyElements(selected);
    }
  };

  const handleCut = async (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    const selected = getSelectedElements();
    if (selected.length > 0) {
      e.preventDefault();
      const ids = await cutElements(selected);
      onDelete(ids);
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    e.preventDefault();
    
    // Check for image paste first
    const imageData = await pasteImageFromClipboard();
    if (imageData) {
      // Create image element
      const imageElement: CanvasElement = {
        id: uuidv4(),
        type: 'image',
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        content: imageData,
      };
      onPaste([imageElement]);
      return;
    }
    
    // Try to paste elements
    const elements = await pasteElements();
    if (elements.length > 0) {
      onPaste(elements);
    }
  };

  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCut);
  document.addEventListener('paste', handlePaste);

  return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('cut', handleCut);
    document.removeEventListener('paste', handlePaste);
  };
}
