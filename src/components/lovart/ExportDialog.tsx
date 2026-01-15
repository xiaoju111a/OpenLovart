"use client";

import React, { useState, useCallback, useRef } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  FileJson,
  FileCode,
  Loader2,
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Palette,
  Layers,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { CanvasElement } from './CanvasArea';

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'json' | 'html';
export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ExportSize = 'original' | '0.5x' | '1x' | '2x' | '3x' | '4x' | 'custom';

interface ExportPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  description: string;
}

const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'desktop', name: '桌面壁纸', icon: <Monitor size={16} />, width: 1920, height: 1080, description: '1920×1080' },
  { id: 'mobile', name: '手机壁纸', icon: <Smartphone size={16} />, width: 1080, height: 1920, description: '1080×1920' },
  { id: 'tablet', name: '平板壁纸', icon: <Tablet size={16} />, width: 2048, height: 2732, description: '2048×2732' },
  { id: 'instagram', name: 'Instagram', icon: <ImageIcon size={16} />, width: 1080, height: 1080, description: '1080×1080' },
  { id: 'twitter', name: 'Twitter', icon: <ImageIcon size={16} />, width: 1200, height: 675, description: '1200×675' },
  { id: 'facebook', name: 'Facebook', icon: <ImageIcon size={16} />, width: 1200, height: 630, description: '1200×630' },
  { id: 'youtube', name: 'YouTube', icon: <ImageIcon size={16} />, width: 2560, height: 1440, description: '2560×1440' },
  { id: 'a4', name: 'A4 打印', icon: <FileCode size={16} />, width: 2480, height: 3508, description: '2480×3508 (300dpi)' },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'png', label: 'PNG', description: '无损压缩，支持透明' },
  { value: 'jpg', label: 'JPG', description: '有损压缩，文件较小' },
  { value: 'svg', label: 'SVG', description: '矢量格式，可无限缩放' },
  { value: 'pdf', label: 'PDF', description: '适合打印和分享' },
  { value: 'json', label: 'JSON', description: '项目数据，可重新导入' },
  { value: 'html', label: 'HTML', description: '网页格式，可直接预览' },
];

const QUALITY_OPTIONS: { value: ExportQuality; label: string; multiplier: number }[] = [
  { value: 'low', label: '低 (0.5x)', multiplier: 0.5 },
  { value: 'medium', label: '中 (1x)', multiplier: 1 },
  { value: 'high', label: '高 (2x)', multiplier: 2 },
  { value: 'ultra', label: '超高 (4x)', multiplier: 4 },
];

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  projectName?: string;
  onExport: (options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  width: number;
  height: number;
  backgroundColor: string;
  includeBackground: boolean;
  selectedOnly: boolean;
  padding: number;
  filename: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  elements,
  canvasWidth,
  canvasHeight,
  projectName = 'design',
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [width, setWidth] = useState(canvasWidth);
  const [height, setHeight] = useState(canvasHeight);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [includeBackground, setIncludeBackground] = useState(true);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [padding, setPadding] = useState(0);
  const [filename, setFilename] = useState(projectName);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'format' | 'size' | 'options'>('format');
  const [showPresets, setShowPresets] = useState(false);

  const aspectRatio = canvasWidth / canvasHeight;
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const applyPreset = (preset: ExportPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setLockAspectRatio(false);
    setShowPresets(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await onExport({
        format,
        quality,
        width,
        height,
        backgroundColor,
        includeBackground,
        selectedOnly,
        padding,
        filename: `${filename}.${format}`,
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const estimatedFileSize = useCallback(() => {
    const pixels = width * height;
    const qualityMultiplier = QUALITY_OPTIONS.find(q => q.value === quality)?.multiplier || 1;
    
    switch (format) {
      case 'png':
        return Math.round((pixels * 4 * qualityMultiplier) / 1024 / 1024 * 0.3);
      case 'jpg':
        return Math.round((pixels * 3 * qualityMultiplier) / 1024 / 1024 * 0.1);
      case 'svg':
        return Math.round(elements.length * 0.5);
      case 'pdf':
        return Math.round((pixels * 4 * qualityMultiplier) / 1024 / 1024 * 0.5);
      case 'json':
        return Math.round(JSON.stringify(elements).length / 1024);
      case 'html':
        return Math.round((JSON.stringify(elements).length + 5000) / 1024);
      default:
        return 0;
    }
  }, [width, height, quality, format, elements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">导出设计</h2>
              <p className="text-sm text-gray-500">{elements.length} 个元素</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <TabButton
            active={activeTab === 'format'}
            onClick={() => setActiveTab('format')}
            icon={<FileCode size={16} />}
            label="格式"
          />
          <TabButton
            active={activeTab === 'size'}
            onClick={() => setActiveTab('size')}
            icon={<Monitor size={16} />}
            label="尺寸"
          />
          <TabButton
            active={activeTab === 'options'}
            onClick={() => setActiveTab('options')}
            icon={<Settings size={16} />}
            label="选项"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'format' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      format === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${
                        format === option.value ? 'text-green-600' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      {format === option.value && (
                        <Check size={14} className="text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>

              {/* Quality (for raster formats) */}
              {(format === 'png' || format === 'jpg') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">质量</label>
                  <div className="flex gap-2">
                    {QUALITY_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setQuality(option.value)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          quality === option.value
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'size' && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">预设尺寸</label>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {showPresets ? '收起' : '展开'}
                  </button>
                </div>
                {showPresets && (
                  <div className="grid grid-cols-2 gap-2">
                    {EXPORT_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                          {preset.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">自定义尺寸</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    锁定比例
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">宽度 (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="text-gray-400 mt-5">×</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">高度 (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Scale */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">快速缩放</label>
                <div className="flex gap-2">
                  {['0.5x', '1x', '2x', '3x', '4x'].map(scale => {
                    const multiplier = parseFloat(scale);
                    return (
                      <button
                        key={scale}
                        onClick={() => {
                          setWidth(Math.round(canvasWidth * multiplier));
                          setHeight(Math.round(canvasHeight * multiplier));
                        }}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                      >
                        {scale}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-4">
              {/* Filename */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">文件名</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-500">.{format}</span>
                </div>
              </div>

              {/* Background */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">背景</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={includeBackground}
                      onChange={(e) => setIncludeBackground(e.target.checked)}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    包含背景
                  </label>
                </div>
                {includeBackground && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex gap-1">
                      {['#ffffff', '#000000', '#f3f4f6', 'transparent'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                            backgroundColor === color ? 'border-green-500' : 'border-gray-200'
                          }`}
                          style={{ 
                            backgroundColor: color === 'transparent' ? 'transparent' : color,
                            backgroundImage: color === 'transparent' 
                              ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                              : 'none',
                            backgroundSize: '8px 8px',
                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">内边距 (px)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{padding}px</span>
                  <span>100</span>
                </div>
              </div>

              {/* Selected Only */}
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOnly}
                  onChange={(e) => setSelectedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">仅导出选中元素</p>
                  <p className="text-xs text-gray-500">只导出当前选中的元素</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              预计大小: ~{estimatedFileSize()} {format === 'json' || format === 'html' ? 'KB' : 'MB'}
              <span className="mx-2">•</span>
              {width} × {height} px
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  exportSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    导出中...
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check size={16} />
                    已导出
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    导出
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
        active
          ? 'text-green-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
      )}
    </button>
  );
}

// Export utility functions
export async function exportToImage(
  elements: CanvasElement[],
  options: ExportOptions
): Promise<Blob> {
  // This would be implemented with canvas rendering
  // For now, return a placeholder
  return new Blob([''], { type: `image/${options.format}` });
}

export async function exportToSVG(
  elements: CanvasElement[],
  options: ExportOptions
): Promise<string> {
  const { width, height, backgroundColor, includeBackground } = options;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  if (includeBackground && backgroundColor !== 'transparent') {
    svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
  }
  
  // Convert elements to SVG
  elements.forEach(el => {
    if (el.type === 'shape') {
      // Add shape SVG
    } else if (el.type === 'text') {
      svg += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize || 24}" fill="${el.color || '#000'}">${el.content || ''}</text>`;
    }
    // Add more element types...
  });
  
  svg += '</svg>';
  return svg;
}

export function exportToJSON(
  elements: CanvasElement[],
  options: ExportOptions
): string {
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    canvas: {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor,
    },
    elements,
  }, null, 2);
}

export function exportToHTML(
  elements: CanvasElement[],
  options: ExportOptions
): string {
  const { width, height, backgroundColor } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .canvas { position: relative; width: ${width}px; height: ${height}px; background: ${backgroundColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .element { position: absolute; }
  </style>
</head>
<body>
  <div class="canvas">
    ${elements.map(el => `
    <div class="element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;">
      ${el.type === 'text' ? el.content : ''}
      ${el.type === 'image' ? `<img src="${el.content}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
    </div>
    `).join('')}
  </div>
</body>
</html>`;
}
