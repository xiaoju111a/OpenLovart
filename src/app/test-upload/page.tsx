'use client';

import { useState, useRef } from 'react';

export default function TestUploadPage() {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        console.log('Image loaded, adding to state');
        setImages(prev => {
          console.log('Previous images:', prev.length);
          const newImages = [...prev, result];
          console.log('New images:', newImages.length);
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        console.log('Video loaded, adding to state');
        setVideos(prev => {
          console.log('Previous videos:', prev.length);
          const newVideos = [...prev, result];
          console.log('New videos:', newVideos.length);
          return newVideos;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">上传测试页面</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">图片上传测试</h2>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            上传图片
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">已上传图片数量: {images.length}</p>
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="border rounded p-2">
                  <img src={img} alt={`Upload ${index}`} className="w-full h-32 object-cover" />
                  <p className="text-xs text-gray-500 mt-1">图片 {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">视频上传测试</h2>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            上传视频
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">已上传视频数量: {videos.length}</p>
            <div className="grid grid-cols-2 gap-4">
              {videos.map((vid, index) => (
                <div key={index} className="border rounded p-2">
                  <video src={vid} className="w-full h-48 object-cover" controls />
                  <p className="text-xs text-gray-500 mt-1">视频 {index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">测试说明</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ 上传后图片/视频应该立即显示</li>
            <li>✅ 数量计数应该增加</li>
            <li>✅ 元素不应该消失</li>
            <li>✅ 打开控制台查看日志</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
