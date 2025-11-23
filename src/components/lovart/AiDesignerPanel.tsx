import React, { useState } from 'react';
import {
    Sparkles, Paperclip, AtSign, Lightbulb, Zap, Globe, Box, ArrowUp,
    RefreshCw, MessageSquare, Clock, Share2, Layout, Maximize2, X
} from 'lucide-react';

interface AiDesignerPanelProps {
    onGenerate: (prompt: string) => Promise<string>;
    isGenerating: boolean;
    onClose?: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AiDesignerPanel({ onGenerate, isGenerating, onClose }: AiDesignerPanelProps) {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const suggestions = [
        {
            title: 'Wine List',
            description: 'Mimic this effect to generate a poster of ...',
            color: 'bg-blue-50',
            imageColor: 'bg-blue-200'
        },
        {
            title: 'Coffee Shop Branding',
            description: 'you are a brand design expert, generate ...',
            color: 'bg-orange-50',
            imageColor: 'bg-orange-200'
        },
        {
            title: 'Story Board',
            description: 'I NEED A STORY BOARD FOR THIS...',
            color: 'bg-purple-50',
            imageColor: 'bg-purple-200'
        }
    ];

    const handleSend = async () => {
        if (inputValue.trim() && !isGenerating) {
            const prompt = inputValue;
            setInputValue('');

            // Add user message
            setMessages(prev => [...prev, { role: 'user', content: prompt }]);

            try {
                const response = await onGenerate(prompt);
                // Add assistant message
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            } catch (error) {
                console.error('Failed to generate response:', error);
                // Optionally add an error message
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header Icons */}
            <div className="flex items-center justify-end gap-4 p-4 text-gray-400">
                <button className="hover:text-gray-600 transition-colors"><MessageSquare size={18} /></button>
                <button className="hover:text-gray-600 transition-colors"><Clock size={18} /></button>
                <button className="hover:text-gray-600 transition-colors"><Share2 size={18} /></button>
                <button className="hover:text-gray-600 transition-colors"><Layout size={18} /></button>
                <button className="hover:text-gray-600 transition-colors"><Maximize2 size={18} /></button>
                {onClose && (
                    <button onClick={onClose} className="hover:text-gray-600 transition-colors ml-2">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-4">
                {messages.length === 0 ? (
                    <>
                        {/* Greeting */}
                        <div className="mb-8">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold mb-6">
                                L
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hi，我是你的AI设计师</h1>
                            <p className="text-xl text-gray-400 font-light">让我们开始今天的创作吧！</p>
                        </div>

                        {/* Suggestions Cards */}
                        <div className="space-y-4 mb-6">
                            {suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setInputValue(item.description)}
                                    className="group relative flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                                >
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                                    </div>
                                    <div className={`w-16 h-20 rounded-lg shadow-sm ${item.imageColor} transform group-hover:scale-105 transition-transform rotate-3`}></div>
                                    <div className={`absolute right-8 w-16 h-20 rounded-lg shadow-sm ${item.imageColor} opacity-50 transform rotate-12 -z-10`}></div>
                                </div>
                            ))}
                        </div>

                        {/* Switch Button */}
                        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm mb-4">
                            <RefreshCw size={14} />
                            <span>切换</span>
                        </button>
                    </>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-gray-100 text-gray-900 rounded-tr-sm'
                                            : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 pt-2">
                <div className="relative border border-gray-200 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="请输入你的设计需求"
                        className="w-full h-24 p-4 resize-none outline-none text-gray-700 placeholder-gray-300 bg-transparent rounded-t-2xl"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                <Paperclip size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                <AtSign size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
                                    <Lightbulb size={16} />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
                                    <Zap size={16} />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
                                    <Globe size={16} />
                                </button>
                                <button className="p-1.5 text-blue-500 bg-white shadow-sm rounded-full transition-all">
                                    <Box size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isGenerating}
                                className={`p-2 rounded-full transition-all ${inputValue.trim() && !isGenerating
                                    ? 'bg-black text-white hover:bg-gray-800 shadow-md'
                                    : 'bg-gray-200 text-white cursor-not-allowed'
                                    }`}
                            >
                                <ArrowUp size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
