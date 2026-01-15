"use client";

import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Columns,
  Rows,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Layers,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { CanvasElement } from './CanvasArea';

interface AlignmentToolsProps {
  selectedElements: CanvasElement[];
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate90CW: () => void;
  onRotate90CCW: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onLock: () => void;
  onUnlock: () => void;
  onHide: () => void;
  onShow: () => void;
}

export function AlignmentTools({
  selectedElements,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
  onFlipHorizontal,
  onFlipVertical,
  onRotate90CW,
  onRotate90CCW,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onLock,
  onUnlock,
  onHide,
  onShow,
}: AlignmentToolsProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const hasSelection = selectedElements.length > 0;
  const hasMultipleSelection = selectedElements.length > 1;
  const isLocked = selectedElements.some(el => (el as unknown as { locked?: boolean }).locked);
  const isHidden = selectedElements.some(el => (el as unknown as { hidden?: boolean }).hidden);

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
      {/* Alignment Section */}
      <div className="mb-2">
        <div className="text-xs font-medium text-gray-500 px-2 mb-1.5">对齐</div>
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<AlignLeft size={16} />}
            tooltip="左对齐"
            onClick={onAlignLeft}
            disabled={!hasMultipleSelection}
          />
          <ToolButton
            icon={<AlignCenter size={16} />}
            tooltip="水平居中"
            onClick={onAlignCenter}
            disabled={!hasMultipleSelection}
          />
          <ToolButton
            icon={<AlignRight size={16} />}
            tooltip="右对齐"
            onClick={onAlignRight}
            disabled={!hasMultipleSelection}
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolButton
            icon={<AlignStartVertical size={16} />}
            tooltip="顶部对齐"
            onClick={onAlignTop}
            disabled={!hasMultipleSelection}
          />
          <ToolButton
            icon={<AlignCenterVertical size={16} />}
            tooltip="垂直居中"
            onClick={onAlignMiddle}
            disabled={!hasMultipleSelection}
          />
          <ToolButton
            icon={<AlignEndVertical size={16} />}
            tooltip="底部对齐"
            onClick={onAlignBottom}
            disabled={!hasMultipleSelection}
          />
        </div>
      </div>

      {/* Distribution Section */}
      {hasMultipleSelection && selectedElements.length >= 3 && (
        <div className="mb-2 pt-2 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 px-2 mb-1.5">分布</div>
          <div className="flex items-center gap-1">
            <ToolButton
              icon={<Columns size={16} />}
              tooltip="水平分布"
              onClick={onDistributeHorizontal}
            />
            <ToolButton
              icon={<Rows size={16} />}
              tooltip="垂直分布"
              onClick={onDistributeVertical}
            />
          </div>
        </div>
      )}

      {/* Transform Section */}
      <div className="mb-2 pt-2 border-t border-gray-100">
        <div className="text-xs font-medium text-gray-500 px-2 mb-1.5">变换</div>
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<FlipHorizontal size={16} />}
            tooltip="水平翻转"
            onClick={onFlipHorizontal}
          />
          <ToolButton
            icon={<FlipVertical size={16} />}
            tooltip="垂直翻转"
            onClick={onFlipVertical}
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolButton
            icon={<RotateCcw size={16} />}
            tooltip="逆时针旋转90°"
            onClick={onRotate90CCW}
          />
          <ToolButton
            icon={<RotateCw size={16} />}
            tooltip="顺时针旋转90°"
            onClick={onRotate90CW}
          />
        </div>
      </div>

      {/* Layer Section */}
      <div className="mb-2 pt-2 border-t border-gray-100">
        <div className="text-xs font-medium text-gray-500 px-2 mb-1.5">图层</div>
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<Layers size={16} />}
            tooltip="置于顶层"
            onClick={onBringToFront}
          />
          <ToolButton
            icon={<ChevronUp size={16} />}
            tooltip="上移一层"
            onClick={onBringForward}
          />
          <ToolButton
            icon={<ChevronDown size={16} />}
            tooltip="下移一层"
            onClick={onSendBackward}
          />
          <ToolButton
            icon={<Layers size={16} className="rotate-180" />}
            tooltip="置于底层"
            onClick={onSendToBack}
          />
        </div>
      </div>

      {/* Lock & Visibility Section */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-xs font-medium text-gray-500 px-2 mb-1.5">其他</div>
        <div className="flex items-center gap-1">
          <ToolButton
            icon={isLocked ? <Unlock size={16} /> : <Lock size={16} />}
            tooltip={isLocked ? "解锁" : "锁定"}
            onClick={isLocked ? onUnlock : onLock}
            active={isLocked}
          />
          <ToolButton
            icon={isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
            tooltip={isHidden ? "显示" : "隐藏"}
            onClick={isHidden ? onShow : onHide}
            active={isHidden}
          />
        </div>
      </div>
    </div>
  );
}

// Tool Button Component
interface ToolButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

function ToolButton({ icon, tooltip, onClick, disabled = false, active = false }: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : active
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {icon}
      </button>
      {showTooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Alignment utility functions
export function calculateAlignmentBounds(elements: CanvasElement[]) {
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

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

export function alignElements(
  elements: CanvasElement[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Partial<CanvasElement>[] {
  const bounds = calculateAlignmentBounds(elements);
  if (!bounds) return [];

  return elements.map(el => {
    const elWidth = el.width || 0;
    const elHeight = el.height || 0;

    switch (alignment) {
      case 'left':
        return { id: el.id, x: bounds.left };
      case 'center':
        return { id: el.id, x: bounds.centerX - elWidth / 2 };
      case 'right':
        return { id: el.id, x: bounds.right - elWidth };
      case 'top':
        return { id: el.id, y: bounds.top };
      case 'middle':
        return { id: el.id, y: bounds.centerY - elHeight / 2 };
      case 'bottom':
        return { id: el.id, y: bounds.bottom - elHeight };
      default:
        return {};
    }
  });
}

export function distributeElements(
  elements: CanvasElement[],
  direction: 'horizontal' | 'vertical'
): Partial<CanvasElement>[] {
  if (elements.length < 3) return [];

  const sorted = [...elements].sort((a, b) => 
    direction === 'horizontal' ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSize = direction === 'horizontal'
    ? (last.x + (last.width || 0)) - first.x
    : (last.y + (last.height || 0)) - first.y;

  const elementsSize = sorted.reduce((sum, el) => 
    sum + (direction === 'horizontal' ? (el.width || 0) : (el.height || 0)), 0
  );

  const gap = (totalSize - elementsSize) / (sorted.length - 1);

  let currentPos = direction === 'horizontal' ? first.x : first.y;

  return sorted.map((el, index) => {
    const result = direction === 'horizontal'
      ? { id: el.id, x: currentPos }
      : { id: el.id, y: currentPos };
    
    currentPos += (direction === 'horizontal' ? (el.width || 0) : (el.height || 0)) + gap;
    
    return result;
  });
}

// Compact toolbar for multi-selection
export function MultiSelectToolbar({
  selectedCount,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
  onDelete,
  onGroup,
  onDuplicate,
}: {
  selectedCount: number;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onDuplicate: () => void;
}) {
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2">
      <span className="text-sm font-medium text-gray-600 pr-2 border-r border-gray-200">
        {selectedCount} 个元素
      </span>

      {/* Alignment Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowAlignMenu(!showAlignMenu)}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
        >
          <AlignCenter size={16} />
          对齐
        </button>
        {showAlignMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
            <button
              onClick={() => { onAlignLeft(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignLeft size={14} /> 左对齐
            </button>
            <button
              onClick={() => { onAlignCenter(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignCenter size={14} /> 水平居中
            </button>
            <button
              onClick={() => { onAlignRight(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignRight size={14} /> 右对齐
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => { onAlignTop(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignStartVertical size={14} /> 顶部对齐
            </button>
            <button
              onClick={() => { onAlignMiddle(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignCenterVertical size={14} /> 垂直居中
            </button>
            <button
              onClick={() => { onAlignBottom(); setShowAlignMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
            >
              <AlignEndVertical size={14} /> 底部对齐
            </button>
            {selectedCount >= 3 && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { onDistributeHorizontal(); setShowAlignMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Columns size={14} /> 水平分布
                </button>
                <button
                  onClick={() => { onDistributeVertical(); setShowAlignMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <Rows size={14} /> 垂直分布
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Quick Actions */}
      <button
        onClick={onGroup}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        title="编组"
      >
        <Layers size={16} />
      </button>
      <button
        onClick={onDuplicate}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        title="复制"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
        title="删除"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
