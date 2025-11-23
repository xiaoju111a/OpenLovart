import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ProjectCardProps {
    title: string;
    date: string;
    imageUrl?: string;
}

export function ProjectCard({ title, date, imageUrl }: ProjectCardProps) {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
            {/* Image Area */}
            <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <div className="w-12 h-12 rounded-full border-2 border-gray-200" />
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm">
                        <MoreHorizontal size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{date}</p>
            </div>
        </div>
    );
}
