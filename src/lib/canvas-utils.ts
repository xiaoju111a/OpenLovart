"use client";

import { CanvasElement } from '@/components/lovart/CanvasArea';

/**
 * Calculate bounding box for a set of elements
 */
export function getBoundingBox(elements: CanvasElement[]): {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach(el => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + (el.width || 0));
    maxY = Math.max(maxY, el.y + (el.height || 0));
  });

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    x: minX,
    y: minY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}

/**
 * Check if a point is inside an element
 */
export function isPointInElement(
  point: { x: number; y: number },
  element: CanvasElement
): boolean {
  const { x, y, width = 0, height = 0 } = element;
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

/**
 * Check if two elements overlap
 */
export function doElementsOverlap(a: CanvasElement, b: CanvasElement): boolean {
  const aRight = a.x + (a.width || 0);
  const aBottom = a.y + (a.height || 0);
  const bRight = b.x + (b.width || 0);
  const bBottom = b.y + (b.height || 0);

  return !(
    aRight < b.x ||
    a.x > bRight ||
    aBottom < b.y ||
    a.y > bBottom
  );
}

/**
 * Get elements within a selection rectangle
 */
export function getElementsInRect(
  elements: CanvasElement[],
  rect: { x: number; y: number; width: number; height: number }
): CanvasElement[] {
  const rectRight = rect.x + rect.width;
  const rectBottom = rect.y + rect.height;

  return elements.filter(el => {
    const elRight = el.x + (el.width || 0);
    const elBottom = el.y + (el.height || 0);

    return !(
      elRight < rect.x ||
      el.x > rectRight ||
      elBottom < rect.y ||
      el.y > rectBottom
    );
  });
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap element position to grid
 */
export function snapElementToGrid(
  element: CanvasElement,
  gridSize: number
): Partial<CanvasElement> {
  return {
    x: snapToGrid(element.x, gridSize),
    y: snapToGrid(element.y, gridSize),
  };
}

/**
 * Calculate snap guides for element alignment
 */
export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
}

export function calculateSnapGuides(
  movingElement: CanvasElement,
  otherElements: CanvasElement[],
  threshold: number = 5
): { guides: SnapGuide[]; snappedPosition: { x: number; y: number } } {
  const guides: SnapGuide[] = [];
  let snappedX = movingElement.x;
  let snappedY = movingElement.y;

  const movingWidth = movingElement.width || 0;
  const movingHeight = movingElement.height || 0;
  const movingCenterX = movingElement.x + movingWidth / 2;
  const movingCenterY = movingElement.y + movingHeight / 2;
  const movingRight = movingElement.x + movingWidth;
  const movingBottom = movingElement.y + movingHeight;

  otherElements.forEach(other => {
    if (other.id === movingElement.id) return;

    const otherWidth = other.width || 0;
    const otherHeight = other.height || 0;
    const otherCenterX = other.x + otherWidth / 2;
    const otherCenterY = other.y + otherHeight / 2;
    const otherRight = other.x + otherWidth;
    const otherBottom = other.y + otherHeight;

    // Vertical guides (X alignment)
    // Left to left
    if (Math.abs(movingElement.x - other.x) < threshold) {
      snappedX = other.x;
      guides.push({
        type: 'vertical',
        position: other.x,
        start: Math.min(movingElement.y, other.y),
        end: Math.max(movingBottom, otherBottom),
      });
    }
    // Right to right
    if (Math.abs(movingRight - otherRight) < threshold) {
      snappedX = otherRight - movingWidth;
      guides.push({
        type: 'vertical',
        position: otherRight,
        start: Math.min(movingElement.y, other.y),
        end: Math.max(movingBottom, otherBottom),
      });
    }
    // Center to center
    if (Math.abs(movingCenterX - otherCenterX) < threshold) {
      snappedX = otherCenterX - movingWidth / 2;
      guides.push({
        type: 'vertical',
        position: otherCenterX,
        start: Math.min(movingElement.y, other.y),
        end: Math.max(movingBottom, otherBottom),
      });
    }
    // Left to right
    if (Math.abs(movingElement.x - otherRight) < threshold) {
      snappedX = otherRight;
      guides.push({
        type: 'vertical',
        position: otherRight,
        start: Math.min(movingElement.y, other.y),
        end: Math.max(movingBottom, otherBottom),
      });
    }
    // Right to left
    if (Math.abs(movingRight - other.x) < threshold) {
      snappedX = other.x - movingWidth;
      guides.push({
        type: 'vertical',
        position: other.x,
        start: Math.min(movingElement.y, other.y),
        end: Math.max(movingBottom, otherBottom),
      });
    }

    // Horizontal guides (Y alignment)
    // Top to top
    if (Math.abs(movingElement.y - other.y) < threshold) {
      snappedY = other.y;
      guides.push({
        type: 'horizontal',
        position: other.y,
        start: Math.min(movingElement.x, other.x),
        end: Math.max(movingRight, otherRight),
      });
    }
    // Bottom to bottom
    if (Math.abs(movingBottom - otherBottom) < threshold) {
      snappedY = otherBottom - movingHeight;
      guides.push({
        type: 'horizontal',
        position: otherBottom,
        start: Math.min(movingElement.x, other.x),
        end: Math.max(movingRight, otherRight),
      });
    }
    // Center to center
    if (Math.abs(movingCenterY - otherCenterY) < threshold) {
      snappedY = otherCenterY - movingHeight / 2;
      guides.push({
        type: 'horizontal',
        position: otherCenterY,
        start: Math.min(movingElement.x, other.x),
        end: Math.max(movingRight, otherRight),
      });
    }
    // Top to bottom
    if (Math.abs(movingElement.y - otherBottom) < threshold) {
      snappedY = otherBottom;
      guides.push({
        type: 'horizontal',
        position: otherBottom,
        start: Math.min(movingElement.x, other.x),
        end: Math.max(movingRight, otherRight),
      });
    }
    // Bottom to top
    if (Math.abs(movingBottom - other.y) < threshold) {
      snappedY = other.y - movingHeight;
      guides.push({
        type: 'horizontal',
        position: other.y,
        start: Math.min(movingElement.x, other.x),
        end: Math.max(movingRight, otherRight),
      });
    }
  });

  return {
    guides,
    snappedPosition: { x: snappedX, y: snappedY },
  };
}

/**
 * Calculate distance between two points
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Rotate a point around a center
 */
export function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = degreesToRadians(angleDegrees);
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Scale element from center
 */
export function scaleElementFromCenter(
  element: CanvasElement,
  scale: number
): Partial<CanvasElement> {
  const width = element.width || 0;
  const height = element.height || 0;
  const centerX = element.x + width / 2;
  const centerY = element.y + height / 2;

  const newWidth = width * scale;
  const newHeight = height * scale;

  return {
    x: centerX - newWidth / 2,
    y: centerY - newHeight / 2,
    width: newWidth,
    height: newHeight,
  };
}

/**
 * Flip element horizontally
 */
export function flipElementHorizontal(
  element: CanvasElement,
  containerWidth: number
): Partial<CanvasElement> {
  const width = element.width || 0;
  return {
    x: containerWidth - element.x - width,
  };
}

/**
 * Flip element vertically
 */
export function flipElementVertical(
  element: CanvasElement,
  containerHeight: number
): Partial<CanvasElement> {
  const height = element.height || 0;
  return {
    y: containerHeight - element.y - height,
  };
}

/**
 * Generate unique color for element
 */
export function generateElementColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  return colors[index % colors.length];
}

/**
 * Calculate optimal text size for container
 */
export function calculateOptimalFontSize(
  text: string,
  containerWidth: number,
  containerHeight: number,
  minSize: number = 12,
  maxSize: number = 72
): number {
  // Rough estimation based on character count and container size
  const charCount = text.length;
  const containerArea = containerWidth * containerHeight;
  const charArea = containerArea / charCount;
  const estimatedSize = Math.sqrt(charArea) * 0.8;

  return Math.max(minSize, Math.min(maxSize, Math.round(estimatedSize)));
}

/**
 * Parse color string to RGB
 */
export function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Hex color
  const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  // RGB color
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  return null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Get contrasting text color for background
 */
export function getContrastingColor(backgroundColor: string): string {
  const rgb = parseColor(backgroundColor);
  if (!rgb) return '#000000';

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Lighten or darken a color
 */
export function adjustColorBrightness(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const adjust = (value: number) => Math.max(0, Math.min(255, value + amount));

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * Generate a random position within bounds
 */
export function randomPosition(
  bounds: { width: number; height: number },
  elementSize: { width: number; height: number },
  padding: number = 50
): { x: number; y: number } {
  return {
    x: padding + Math.random() * (bounds.width - elementSize.width - padding * 2),
    y: padding + Math.random() * (bounds.height - elementSize.height - padding * 2),
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Smooth step interpolation
 */
export function smoothStep(start: number, end: number, t: number): number {
  const smoothT = t * t * (3 - 2 * t);
  return lerp(start, end, smoothT);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
