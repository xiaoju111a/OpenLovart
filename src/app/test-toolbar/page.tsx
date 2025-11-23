'use client';

import { useState } from 'react';
import { ContextToolbar } from '@/components/lovart/ContextToolbar';
import { CanvasElement } from '@/components/lovart/CanvasArea';

export default function TestToolbarPage() {
  const [element, setElement] = useState<CanvasElement>({
    id: 'test-1',
    type: 'image',
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRBOTBFMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivleWbvueJhzwvdGV4dD48L3N2Zz4='
  });

  const handleUpdate = (id: string, updates: Partial<CanvasElement>) => {
    setElement(prev => ({ ...prev, ...updates }));
    console.log('Update:', id, updates);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
    alert('删除元素: ' + id);
  };

  const handleGenerate = (el: CanvasElement) => {
    console.log('Generate from:', el);
    alert('生成新图片');
  };

  const handleConnect = (el: CanvasElement) => {
    console.log('Connect flow:', el);
    alert('创建流程图连接');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">工具栏测试页面</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ 工具栏应该显示在图片上方</li>
            <li>✅ 包含所有按钮：尺寸、替换背景、Mockup、编辑、流程、扩展、复制、下载、删除</li>
            <li>✅ 点击按钮应该有响应</li>
          </ul>
        </div>

        {/* 模拟画布 */}
        <div className="relative bg-gray-100 rounded-lg" style={{ height: '600px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm">画布区域</div>
          </div>

          {/* 工具栏 - 绝对定位 */}
          <div
            style={{
              position: 'absolute',
              left: element.x + (element.width || 0) / 2,
              top: element.y - 60,
              transform: 'translateX(-50%)',
              zIndex: 100,
            }}
          >
            <ContextToolbar
              element={element}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onGenerateFromImage={handleGenerate}
              onConnectFlow={handleConnect}
            />
          </div>

          {/* 模拟图片元素 */}
          <div
            className="absolute border-2 border-blue-500 rounded-lg overflow-hidden"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
          >
            <img 
              src={element.content} 
              alt="Test" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">控制面板</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm text-blue-700">元素类型:</label>
              <select
                value={element.type}
                onChange={(e) => setElement(prev => ({ ...prev, type: e.target.value as any }))}
                className="ml-2 px-2 py-1 border rounded"
              >
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="text">文本</option>
                <option value="shape">形状</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-blue-700">宽度: {element.width}px</label>
              <input
                type="range"
                min="100"
                max="500"
                value={element.width}
                onChange={(e) => setElement(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="ml-2 w-64"
              />
            </div>
            <div>
              <label className="text-sm text-blue-700">高度: {element.height}px</label>
              <input
                type="range"
                min="100"
                max="500"
                value={element.height}
                onChange={(e) => setElement(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="ml-2 w-64"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ 预期结果</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 工具栏显示在图片上方中央</li>
            <li>• 工具栏包含所有功能按钮</li>
            <li>• "流程"按钮是蓝色高亮</li>
            <li>• "扩展元素"按钮是紫蓝渐变</li>
            <li>• 点击按钮会触发相应操作</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
