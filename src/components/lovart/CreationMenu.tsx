import React from 'react';
import { Image as ImageIcon, Video, Wand2, Film, Layout } from 'lucide-react';

export function CreationMenu() {
    return (
        <div className="w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                New
            </div>

            <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                    <ImageIcon size={18} className="text-gray-500" />
                    <span>Upload Image</span>
                </button>

                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                    <Video size={18} className="text-gray-500" />
                    <span>Upload Video</span>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                <button className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <Wand2 size={18} className="text-gray-500" />
                        <span>Image Generator</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-500">A</span>
                </button>

                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                    <Film size={18} className="text-gray-500" />
                    <span>Video Generator</span>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                <button className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <Layout size={18} className="text-gray-500" />
                        <span>Smart Board</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-500">F</span>
                </button>
            </div>
        </div>
    );
}
