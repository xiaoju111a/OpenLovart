'use client';

import React, { useEffect, useState } from 'react';
import { Coins, Calendar, User as UserIcon, Bell } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useSupabase } from '@/hooks/useSupabase';

interface UserCredits {
    user_id: string;
    credits: number;
    created_at: string;
    updated_at: string;
}

export default function UserPage() {
    const { user } = useUser();
    const supabase = useSupabase();
    const [credits, setCredits] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load or create user credits
    useEffect(() => {
        async function loadUserCredits() {
            if (!user || !supabase) {
                setIsLoading(false);
                return;
            }

            try {
                // Try to get existing credits
                const { data, error } = await (supabase as any)
                    .from('user_credits')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // User doesn't exist, create with 1000 credits
                    const { data: newData, error: insertError } = await (supabase as any)
                        .from('user_credits')
                        .insert({
                            user_id: user.id,
                            credits: 1000,
                        })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    setCredits(newData.credits);
                } else if (error) {
                    throw error;
                } else {
                    setCredits(data.credits);
                }
            } catch (error) {
                console.error('Failed to load user credits:', error);
                // Default to 1000 if there's an error
                setCredits(1000);
            } finally {
                setIsLoading(false);
            }
        }

        loadUserCredits();
    }, [user, supabase]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '未知';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="h-screen bg-white text-gray-900 font-sans">
            <main className="h-full flex flex-col overflow-hidden">
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-8 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">L</div>
                            <span className="text-lg font-semibold text-gray-900">Lovart</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                                <Bell size={18} className="text-gray-600" />
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            </button>

                            <SignedIn>
                                {credits !== null && (
                                    <div className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium flex items-center gap-1.5">
                                        <span className="text-sm">⚡</span>
                                        <span>{credits.toLocaleString()}</span>
                                    </div>
                                )}
                            </SignedIn>

                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                        登录
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                    {!user ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserIcon size={32} className="text-gray-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">欢迎来到 Lovart</h2>
                                <p className="text-gray-600 mb-6">登录以查看您的账户信息</p>
                                <SignInButton mode="modal">
                                    <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                                        立即登录
                                    </button>
                                </SignInButton>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {/* User Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {user.firstName?.[0] || user.username?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            {user.firstName || user.username || '用户'}
                                        </h2>
                                        <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Credits Card */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                                <Coins size={20} className="text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">我的积分</h3>
                                        </div>
                                        {isLoading ? (
                                            <p className="text-3xl font-bold text-gray-400">加载中...</p>
                                        ) : (
                                            <p className="text-4xl font-bold text-gray-900">{credits?.toLocaleString()}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">可用于生成图片和使用 AI 功能</p>
                                    </div>

                                    {/* Member Since Card */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                                <Calendar size={20} className="text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">加入时间</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatDate(user.createdAt?.toString())}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">感谢您使用 Lovart</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">关于积分</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-400 mt-1">•</span>
                                        <span>新用户注册即获得 <strong className="text-gray-900">1000 积分</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-400 mt-1">•</span>
                                        <span>使用 AI 图像生成功能会消耗积分</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-400 mt-1">•</span>
                                        <span>更多获取积分的方式即将推出</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </main>
        </div>
    );
}
