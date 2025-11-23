'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';

export default function TestLoadPage() {
    const { user } = useUser();
    const supabase = useSupabase();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [elements, setElements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load all projects
    useEffect(() => {
        async function loadProjects() {
            if (!user || !supabase) return;

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                setProjects(data || []);
            } catch (err: any) {
                setError(err.message);
                console.error('Failed to load projects:', err);
            } finally {
                setLoading(false);
            }
        }

        loadProjects();
    }, [user, supabase]);

    // Load elements for selected project
    const loadProjectElements = async (projectId: string) => {
        if (!supabase) return;

        try {
            setLoading(true);
            setError(null);

            // Load project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (projectError) throw projectError;
            setSelectedProject(project);

            // Load elements
            const { data: canvasElements, error: elementsError } = await supabase
                .from('canvas_elements')
                .select('*')
                .eq('project_id', projectId);

            if (elementsError) throw elementsError;

            console.log('Loaded elements:', canvasElements);
            setElements(canvasElements || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to load project:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">请先登录</h1>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">数据库加载测试</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
                    错误: {error}
                </div>
            )}

            {loading && <div className="text-gray-500 mb-4">加载中...</div>}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">所有项目 ({projects.length})</h2>
                <div className="space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => loadProjectElements(project.id)}
                        >
                            <div className="font-medium">{project.title}</div>
                            <div className="text-sm text-gray-500">ID: {project.id}</div>
                            <div className="text-sm text-gray-500">
                                更新时间: {new Date(project.updated_at).toLocaleString('zh-CN')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProject && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">
                        项目详情: {selectedProject.title}
                    </h2>
                    <div className="bg-gray-50 p-4 rounded mb-4">
                        <pre className="text-sm overflow-auto">
                            {JSON.stringify(selectedProject, null, 2)}
                        </pre>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                        画布元素 ({elements.length})
                    </h3>
                    {elements.length === 0 ? (
                        <div className="text-gray-500">此项目没有画布元素</div>
                    ) : (
                        <div className="space-y-4">
                            {elements.map((element, index) => (
                                <div key={element.id} className="bg-gray-50 p-4 rounded">
                                    <div className="font-medium mb-2">元素 #{index + 1}</div>
                                    <div className="text-sm mb-2">
                                        <strong>数据库 ID:</strong> {element.id}
                                    </div>
                                    <div className="text-sm mb-2">
                                        <strong>元素数据:</strong>
                                    </div>
                                    <pre className="text-xs overflow-auto bg-white p-2 rounded">
                                        {JSON.stringify(element.element_data, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
