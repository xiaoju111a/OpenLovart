'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';
import Link from 'next/link';

export default function DebugDbPage() {
    const { user } = useUser();
    const supabase = useSupabase();
    const [testResults, setTestResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const runTest = async (testName: string, testFn: () => Promise<any>) => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const result = await testFn();
            const duration = Date.now() - startTime;
            setTestResults(prev => [...prev, {
                name: testName,
                status: 'success',
                result,
                duration,
                timestamp: new Date().toISOString()
            }]);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            setTestResults(prev => [...prev, {
                name: testName,
                status: 'error',
                error: error.message,
                details: error,
                duration,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const testLoadProjects = async () => {
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return { count: data?.length || 0, projects: data };
    };

    const testLoadSpecificProject = async (projectId: string) => {
        if (!supabase) throw new Error('Supabase not initialized');
        
        // Load project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projectError) throw projectError;

        // Load elements
        const { data: elements, error: elementsError } = await supabase
            .from('canvas_elements')
            .select('*')
            .eq('project_id', projectId);

        if (elementsError) throw elementsError;

        return {
            project,
            elementsCount: elements?.length || 0,
            elements: elements?.map((e: any) => ({
                id: e.id,
                element_data: e.element_data
            }))
        };
    };

    if (!user) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">数据库调试工具</h1>
                <p className="text-red-600">请先登录</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6">
                <Link href="/lovart" className="text-blue-600 hover:underline">
                    ← 返回主页
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">数据库调试工具</h1>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
                <p className="text-sm">
                    <strong>用户:</strong> {user.id}
                </p>
                <p className="text-sm">
                    <strong>Supabase:</strong> {supabase ? '✅ 已连接' : '❌ 未连接'}
                </p>
            </div>

            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">测试操作</h2>
                
                <button
                    onClick={() => runTest('加载所有项目', testLoadProjects)}
                    disabled={loading || !supabase}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    测试: 加载所有项目
                </button>

                <div className="flex gap-2">
                    <input
                        type="text"
                        id="projectId"
                        placeholder="输入项目 ID"
                        className="flex-1 px-4 py-2 border rounded"
                    />
                    <button
                        onClick={() => {
                            const input = document.getElementById('projectId') as HTMLInputElement;
                            const projectId = input.value.trim();
                            if (projectId) {
                                runTest(`加载项目 ${projectId}`, () => testLoadSpecificProject(projectId));
                            }
                        }}
                        disabled={loading || !supabase}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        测试: 加载指定项目
                    </button>
                </div>

                <button
                    onClick={() => setTestResults([])}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    清除结果
                </button>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">测试结果 ({testResults.length})</h2>
                
                {testResults.length === 0 ? (
                    <p className="text-gray-500">还没有测试结果</p>
                ) : (
                    <div className="space-y-4">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded border ${
                                    result.status === 'success'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">
                                        {result.status === 'success' ? '✅' : '❌'} {result.name}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {result.duration}ms
                                    </span>
                                </div>
                                
                                <div className="text-xs text-gray-500 mb-2">
                                    {new Date(result.timestamp).toLocaleString('zh-CN')}
                                </div>

                                {result.status === 'success' ? (
                                    <pre className="text-sm bg-white p-3 rounded overflow-auto max-h-96">
                                        {JSON.stringify(result.result, null, 2)}
                                    </pre>
                                ) : (
                                    <div>
                                        <p className="text-red-700 font-medium mb-2">
                                            错误: {result.error}
                                        </p>
                                        <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96">
                                            {JSON.stringify(result.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
