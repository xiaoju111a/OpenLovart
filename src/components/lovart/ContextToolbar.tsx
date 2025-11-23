import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Download, Trash2, SlidersHorizontal, Grid3X3, Sparkles, Shirt, Wand2, Eraser, Copy, ArrowRight } from 'lucide-react';
import { CanvasElement } from './CanvasArea';

interface ContextToolbarProps {
    element: CanvasElement;
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
    onDelete: (id: string) => void;
    onGenerateFromImage?: (element: CanvasElement) => void;
    onConnectFlow?: (element: CanvasElement) => void;
}

export function ContextToolbar({ element, onUpdate, onDelete, onGenerateFromImage, onConnectFlow }: ContextToolbarProps) {
    if (!element) return null;

    // 针对图片和视频元素显示特殊的工具栏
    if (element.type === 'image' || element.type === 'video') {
        return (
            <div
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 flex items-center gap-1"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* 图片尺寸显示 */}
                <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600">
                    <span className="font-mono">{Math.round(element.width || 0)} × {Math.round(element.height || 0)}</span>
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* 替换背景 */}
                <button
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
                    title="替换背景"
                >
                    <Eraser size={18} />
                </button>

                {/* Mockup */}
                <button
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
                    title="Mockup"
                >
                    <Shirt size={18} />
                </button>

                {/* 编辑元素 */}
                <button
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
                    title="编辑元素"
                >
                    <Wand2 size={18} />
                </button>

                {/* 流程图连接 */}
                {onConnectFlow && (
                    <button
                        onClick={() => onConnectFlow(element)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="创建流程图连接"
                    >
                        <ArrowRight size={16} />
                        <span className="text-xs font-medium">流程</span>
                    </button>
                )}

                <div className="w-px h-6 bg-gray-200" />



                <div className="w-px h-6 bg-gray-200" />

                {/* 复制 */}
                <button
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
                    title="复制"
                >
                    <Copy size={18} />
                </button>

                {/* 下载 */}
                <button
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
                    title="下载"
                >
                    <Download size={18} />
                </button>

                {/* 删除 */}
                <button
                    onClick={() => onDelete(element.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="删除"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        );
    }

    // 其他元素类型的工具栏
    return (
        <div
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex items-center gap-3"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Color Picker (for Shapes and Text) */}
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: element.color || (element.type === 'text' ? '#000000' : '#9CA3AF') }}
                >
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        value={element.color || (element.type === 'text' ? '#000000' : '#9CA3AF')}
                        onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                    />
                </div>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Dimensions (Width/Height) - For Shapes */}
            {element.type === 'shape' && (
                <>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                            <span className="text-xs text-gray-500">W</span>
                            <input
                                type="number"
                                className="w-12 bg-transparent text-sm outline-none"
                                value={Math.round(element.width || 0)}
                                onChange={(e) => onUpdate(element.id, { width: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                            <span className="text-xs text-gray-500">H</span>
                            <input
                                type="number"
                                className="w-12 bg-transparent text-sm outline-none"
                                value={Math.round(element.height || 0)}
                                onChange={(e) => onUpdate(element.id, { height: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Text Properties */}
            {element.type === 'text' && (
                <>
                    <select
                        className="bg-transparent text-sm outline-none border border-gray-200 rounded-md px-2 py-1"
                        value={element.fontFamily || 'Inter'}
                        onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
                    >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                    </select>

                    <select
                        className="bg-transparent text-sm outline-none border border-gray-200 rounded-md px-2 py-1"
                        value={element.fontSize || 24}
                        onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) })}
                    >
                        {[12, 14, 16, 18, 20, 24, 32, 48, 64, 80, 96].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Common Actions */}
            <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                    <Download size={18} />
                </button>
                <button onClick={() => onDelete(element.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
