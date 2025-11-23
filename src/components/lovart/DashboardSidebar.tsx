'use client';

import React from 'react';
import { Home, Folder, User, Plus, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/lovart';
    const isProjectsPage = pathname === '/lovart/projects';
    const isUserPage = pathname === '/lovart/user';

    return (
        <aside className="fixed left-8 top-1/3 flex flex-col items-center gap-4 z-50">
            {/* Create Button */}
            <Link 
                href="/lovart/canvas"
                className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                title="新建项目"
            >
                <Plus size={24} />
            </Link>

            {/* Navigation Container */}
            <nav className="bg-white rounded-full shadow-lg p-3 flex flex-col items-center gap-3">
                <Link 
                    href="/lovart" 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isHomePage 
                            ? 'bg-gray-100 text-black' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                    title="主页"
                >
                    <Home size={20} />
                </Link>
                <Link 
                    href="/lovart/projects" 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isProjectsPage 
                            ? 'bg-gray-100 text-black' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                    title="项目"
                >
                    <Folder size={20} />
                </Link>
                <Link 
                    href="/lovart/user" 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isUserPage 
                            ? 'bg-gray-100 text-black' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                    title="用户"
                >
                    <User size={20} />
                </Link>
                <button 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
                    title="帮助"
                >
                    <Info size={20} />
                </button>
            </nav>
        </aside>
    );
}
