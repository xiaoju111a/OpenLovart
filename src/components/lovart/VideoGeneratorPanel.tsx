"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Zap, Image as ImageIcon, Upload, X, Video, Loader2 } from 'lucide-react';

type VideoSize = '720x1280' | '1280x720' | '1024x1792' | '1792x1024';
type VideoSeconds = 10 | 15;

interface VideoGeneratorPanelProps {
    elementId: string;
    onGenerate: (videoUrl: string) => Promise<void>;
    isGenerating: boolean;
    style?: React.CSSProperties;
    canvasElements?: Array<{ id: string; type: string; content?: string; referenceImageId?: string }>;
}

export function VideoGeneratorPanel({ elementId, onGenerate, isGenerating: externalIsGenerating, style, canvasElements }: VideoGeneratorPanelProps) {
    const [prompt, setPrompt] = useState('');
    const [size, setSize] = useState<VideoSize>('720x1280');
    const [seconds, setSeconds] = useState<VideoSeconds>(10);
    const [referenceImage, setReferenceImage] = useState<File | string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Dropdown states
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const [showSecondsMenu, setShowSecondsMenu] = useState(false);
    const [showReferenceMenu, setShowReferenceMenu] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const sizes: VideoSize[] = ['720x1280', '1280x720', '1024x1792', '1792x1024'];
    const secondsOptions: VideoSeconds[] = [10, 15];

    // Auto-fill reference image from source
    useEffect(() => {
        if (canvasElements) {
            const currentElement = canvasElements.find(el => el.id === elementId);
            if (currentElement?.referenceImageId) {
                const sourceImage = canvasElements.find(el => el.id === currentElement.referenceImageId);
                if (sourceImage?.content && !referenceImage) {
                    setReferenceImage(sourceImage.content);
                }
            }
        }
    }, [elementId, canvasElements, referenceImage]);

    // Poll for video status
    useEffect(() => {
        if (taskId && isGenerating) {
            pollingIntervalRef.current = setInterval(async () => {
                try {
                    const response = await fetch(`/api/video-status?taskId=${taskId}`);
                    const data = await response.json();

                    console.log('Video status:', data);
                    
                    setStatus(data.status);
                    setProgress(data.progress || 0);

                    // 当 progress 达到 100 且有视频 URL 时，视频准备好了
                    if (data.progress === 100 && data.videoUrl) {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                        }
                        console.log('Video ready! URL:', data.videoUrl);
                        await onGenerate(data.videoUrl);
                        setIsGenerating(false);
                        setTaskId(null);
                        setProgress(0);
                        setStatus('');
                    } else if (data.status === 'failed') {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                        }
                        setIsGenerating(false);
                        setTaskId(null);
                        setProgress(0);
                        setStatus('');
                        alert('视频生成失败，请重试');
                    }
                } catch (error) {
                    console.error('Error polling video status:', error);
                }
            }, 3000); // Poll every 3 seconds

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [taskId, isGenerating, onGenerate]);

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (prompt.trim() && !isGenerating) {
                await handleGenerate();
            }
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        let referenceImageBase64: string | undefined = undefined;

        if (referenceImage) {
            if (typeof referenceImage === 'string') {
                referenceImageBase64 = referenceImage;
            } else {
                referenceImageBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        if (result && result.includes(',')) {
                            resolve(result.split(',')[1]);
                        } else {
                            resolve(result);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(referenceImage);
                });
            }
        }

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    seconds,
                    size,
                    referenceImage: referenceImageBase64,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || '生成失败');
            }

            console.log('Video generation started:', data);
            setTaskId(data.taskId);
            setStatus(data.status);
            // 轮询会在 useEffect 中自动开始
        } catch (error) {
            console.error('Error starting video generation:', error);
            alert(error instanceof Error ? error.message : '启动视频生成失败');
            setIsGenerating(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReferenceImage(e.target.files[0]);
            setShowReferenceMenu(false);
        }
    };

    const handleCanvasImageSelect = (imageContent: string) => {
        setReferenceImage(imageContent);
        setShowReferenceMenu(false);
    };

    const getImageElements = () => {
        if (!canvasElements) return [];
        return canvasElements.filter(el => el.type === 'image' && el.content);
    };

    const imageElements = getImageElements();

    return (
        <div
            className="absolute z-50 bg-white rounded-2xl shadow-xl border border-gray-100 w-[450px] overflow-hidden"
            style={style}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="p-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="描述你想要生成的视频..."
                    className="w-full h-24 resize-none outline-none text-gray-700 placeholder-gray-400 text-lg bg-transparent"
                    disabled={isGenerating}
                />
            </div>

            {/* Reference Image Preview */}
            {referenceImage && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <ImageIcon size={14} className="text-gray-600" />
                        <span className="text-xs text-gray-700 flex-1 truncate">
                            {typeof referenceImage === 'string' ? '画布图片' : referenceImage.name}
                        </span>
                        <button
                            onClick={() => setReferenceImage(null)}
                            className="text-gray-500 hover:text-gray-700 p-0.5"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Bar with Loading UI */}
            {isGenerating && taskId && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Loader2 size={14} className="animate-spin text-gray-600" />
                        <span className="text-xs text-gray-600">
                            {progress === 0 ? '正在排队...' : 
                             progress < 30 ? '正在初始化...' : 
                             progress < 70 ? '正在生成视频...' : 
                             progress < 100 ? '即将完成...' : 
                             '视频准备好了！'}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">{progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div
                            className="bg-gray-900 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer Controls */}
            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Model Indicator */}
                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium text-gray-700">
                        <div className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center">
                            <Video size={8} className="text-white" />
                        </div>
                        <span>Sora 2</span>
                    </button>

                    {/* Reference Image Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowReferenceMenu(!showReferenceMenu)}
                            className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${
                                referenceImage ? 'text-gray-900 bg-gray-100' : 'text-gray-600'
                            }`}
                            title="参考图"
                        >
                            <Upload size={16} />
                        </button>
                        {showReferenceMenu && (
                            <div className="absolute bottom-full mb-1 left-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[140px]">
                                <div
                                    onClick={() => {
                                        fileInputRef.current?.click();
                                        setShowReferenceMenu(false);
                                    }}
                                    className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 text-gray-700"
                                >
                                    上传图片
                                </div>
                                {imageElements.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <div className="px-2 py-1 text-xs text-gray-500">画布图片</div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {imageElements.map((el, idx) => (
                                                <div
                                                    key={el.id}
                                                    onClick={() => handleCanvasImageSelect(el.content!)}
                                                    className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                                >
                                                    <ImageIcon size={14} />
                                                    <span>图片 {idx + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Size Selector */}
                    <div className="relative">
                        <div
                            onClick={() => setShowSizeMenu(!showSizeMenu)}
                            className="flex items-center gap-1 text-xs text-gray-600 font-medium cursor-pointer hover:bg-gray-100 px-1.5 py-1 rounded-lg transition-colors"
                        >
                            <span>{size}</span>
                            <ChevronDown size={12} />
                        </div>
                        {showSizeMenu && (
                            <div className="absolute bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[100px]">
                                {sizes.map((s) => (
                                    <div
                                        key={s}
                                        onClick={() => {
                                            setSize(s);
                                            setShowSizeMenu(false);
                                        }}
                                        className={`px-3 py-1 text-xs cursor-pointer hover:bg-gray-50 ${
                                            size === s ? 'text-black font-medium bg-gray-50' : 'text-gray-700'
                                        }`}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Seconds Selector */}
                    <div className="relative">
                        <div
                            onClick={() => setShowSecondsMenu(!showSecondsMenu)}
                            className="flex items-center gap-1 text-xs text-gray-600 font-medium cursor-pointer hover:bg-gray-100 px-1.5 py-1 rounded-lg transition-colors"
                        >
                            <span>{seconds}s</span>
                            <ChevronDown size={12} />
                        </div>
                        {showSecondsMenu && (
                            <div className="absolute bottom-full mb-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[60px]">
                                {secondsOptions.map((sec) => (
                                    <div
                                        key={sec}
                                        onClick={() => {
                                            setSeconds(sec);
                                            setShowSecondsMenu(false);
                                        }}
                                        className={`px-3 py-1 text-xs cursor-pointer hover:bg-gray-50 ${
                                            seconds === sec ? 'text-black font-medium bg-gray-50' : 'text-gray-700'
                                        }`}
                                    >
                                        {sec}s
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={() => prompt.trim() && !isGenerating && handleGenerate()}
                    disabled={!prompt.trim() || isGenerating}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                        prompt.trim() && !isGenerating
                            ? 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isGenerating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Zap size={16} className="fill-current" />
                    )}
                    <span className="font-medium">80</span>
                </button>
            </div>
        </div>
    );
}
