'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, AtSign, MapPin, Zap, Globe, Loader2, ArrowUp } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    examples?: Array<{
        title: string;
        description: string;
        image: string;
    }>;
}

interface DesignChatProps {
    projectId: string;
    initialPrompt?: string;
}

const exampleProjects = [
    {
        title: 'Wine List',
        description: 'Mimic this effect to generate a poster of ...',
        image: '🍷',
    },
    {
        title: 'Coffee Shop Branding',
        description: 'you are a brand design expert, generate ...',
        image: '☕',
    },
    {
        title: 'Story Board',
        description: 'I NEED A STORY BOARD FOR THIS...',
        image: '📱',
    },
];

export function DesignChat({ projectId, initialPrompt }: DesignChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load initial message if prompt is provided
    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            handleSendMessage(initialPrompt);
        }
    }, [initialPrompt]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/generate-design', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: text,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.suggestion,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '抱歉，我遇到了一些问题。请稍后再试。',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-lg border border-gray-100">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col space-y-6">
                        {/* Welcome Message */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">L</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="text-base font-semibold text-gray-900">Hi，我是你的AI设计师</h3>
                                <p className="text-sm text-gray-500">让我们开始今天的创作吧！</p>
                            </div>
                        </div>

                        {/* Example Cards */}
                        <div className="space-y-3">
                            {exampleProjects.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSendMessage(example.description)}
                                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 flex items-center justify-between transition-colors text-left"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{example.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{example.description}</p>
                                    </div>
                                    <div className="text-3xl ml-4">{example.image}</div>
                                </button>
                            ))}
                        </div>

                        {/* Cut Button */}
                        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center">
                                <span className="w-2 h-2 border-t border-l border-gray-400"></span>
                            </span>
                            <span>切换</span>
                        </button>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={message.id} className="space-y-4">
                        {/* Show date separator */}
                        {(index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp)) && (
                            <div className="text-center my-4">
                                <span className="text-xs text-gray-400">{formatDate(message.timestamp)}</span>
                            </div>
                        )}

                        {message.role === 'user' ? (
                            <div className="flex justify-end">
                                <div className="bg-gray-100 rounded-2xl px-4 py-2.5 max-w-[75%]">
                                    <p className="text-sm text-gray-900">{message.content}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm">思考中...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Paperclip size={20} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <AtSign size={20} className="text-gray-400" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="输入你的设计需求"
                            className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:border-gray-300 focus:outline-none text-sm bg-gray-50"
                            disabled={isLoading}
                        />
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MapPin size={20} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Zap size={20} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Globe size={20} className="text-gray-400" />
                    </button>
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowUp size={18} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
