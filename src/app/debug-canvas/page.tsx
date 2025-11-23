'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DebugCanvasPage() {
    const { user } = useUser();
    const supabase = useSupabase();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');

    const [logs, setLogs] = useState<any[]>([]);
    const [project, setProject] = useState<any>(null);
    const [elements, setElements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message: string, data?: any) => {
        const log = {
            timestamp: new Date().toISOString(),
            message,
            data
        };
        console.log('[DEBUG]', message, data);
        setLogs(prev => [...prev, log]);
    };

    const loadProject = async () => {
        if (!projectId) {
            addLog('错误: 没有提供项目 ID');
            return;
        }

        if (!user) {
            addLog('错误: 用户未登录');
            return;
        }

        if (!supabase) {
            addLog('错误: Supabase 未初始化');
            return;
        }

        setLoading(true);
        addLog('开始加载项目', { projectId });

        try {
            // Load project
            addLog('正在加载项目元数据...');
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (projectError) {
                addLog('项目加载失败', projectError);
                throw projectError;
            }

            addLog('项目元数据加载成功', projectData);
            setProject(projectData);

            // Load elements
            addLog('正在加载画布元素...');
            const { data: elementsData, error: elementsError } = await supabase
                .from('canvas_elements')
                .select('*')
                .eq('project_id', projectId);

            if (elementsError) {
                addLog('元素加载失败', elementsError);
                throw elementsError;
            }

            addLog(`画布元素加载成功 (${elementsData?.length || 0} 个)`, elementsData);
            setElements(elementsData || []);

            if (elementsData && elementsData.length > 0) {
                addLog('元素详情:', elementsData.map((e: any) => ({
                    db_id: e.id,
                    element_id: e.element_data?.id,
                    type: e.element_data?.type,
                    has_content: !!e.element_data?.content
                })));
            }

        } catch (error: any) {
            addLog('加载失败', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId && user && supabase) {
            loadProject();
        }
    }, [projectId, user, supabase]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/lovart" className="text-blue-600 hover:underline">
                        ← 返回主页
                    </Link>
                    {projectId && (
                        <Link 
                            href={`/lovart/canvas?id=${projectId}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            打开画布
                        </Link>
                    )}
                </div>

                <h1 className="text-3xl font-bold mb-6">画布调试工具</h1>

                {!projectId && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
                        <p className="text-yellow-800">
                            请在 URL 中提供项目 ID: ?id=your-project-id
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Status Panel */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">状态</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">用户:</span>
                                <span className={user ? 'text-green-600' : 'text-red-600'}>
                                    {user ? '✅ 已登录' : '❌ 未登录'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Supabase:</span>
                                <span className={supabase ? 'text-green-600' : 'text-red-600'}>
                                    {supabase ? '✅ 已连接' : '❌ 未连接'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">项目 ID:</span>
                                <span className="font-mono text-xs">
                                    {projectId || '无'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">加载状态:</span>
                                <span>{loading ? '⏳ 加载中...' : '✅ 完成'}</span>
                            </div>
                        </div>

                        <button
                            onClick={loadProject}
                            disabled={loading || !projectId}
                            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            重新加载
                        </button>

                        <button
                            onClick={() => setLogs([])}
                            className="mt-2 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            清除日志
                        </button>
                    </div>

                    {/* Project Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">项目信息</h2>
                        {project ? (
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">标题:</span>
                                    <span className="ml-2 font-medium">{project.title}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">创建时间:</span>
                                    <span className="ml-2">
                                        {new Date(project.created_at).toLocaleString('zh-CN')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">更新时间:</span>
                                    <span className="ml-2">
                                        {new Date(project.updated_at).toLocaleString('zh-CN')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">元素数量:</span>
                                    <span className="ml-2 font-bold text-lg">
                                        {elements.length}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">未加载项目</p>
                        )}
                    </div>
                </div>

                {/* Elements */}
                {elements.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            画布元素 ({elements.length})
                        </h2>
                        <div className="space-y-4">
                            {elements.map((element, index) => (
                                <div key={element.id} className="border rounded p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">
                                            元素 #{index + 1}
                                        </h3>
                                        <span className="text-xs text-gray-500 font-mono">
                                            DB ID: {element.id}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                        <div>
                                            <span className="text-gray-600">类型:</span>
                                            <span className="ml-2 font-medium">
                                                {element.element_data?.type || '未知'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">元素 ID:</span>
                                            <span className="ml-2 font-mono text-xs">
                                                {element.element_data?.id || '无'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">位置:</span>
                                            <span className="ml-2">
                                                ({element.element_data?.x}, {element.element_data?.y})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">尺寸:</span>
                                            <span className="ml-2">
                                                {element.element_data?.width} × {element.element_data?.height}
                                            </span>
                                        </div>
                                    </div>
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                            查看完整数据
                                        </summary>
                                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
                                            {JSON.stringify(element.element_data, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Logs */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        操作日志 ({logs.length})
                    </h2>
                    {logs.length === 0 ? (
                        <p className="text-gray-500">还没有日志</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-auto">
                            {logs.map((log, index) => (
                                <div key={index} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                                        </span>
                                        <span className="font-medium">{log.message}</span>
                                    </div>
                                    {log.data && (
                                        <details className="mt-1">
                                            <summary className="cursor-pointer text-xs text-gray-600">
                                                详情
                                            </summary>
                                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                                {JSON.stringify(log.data, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
