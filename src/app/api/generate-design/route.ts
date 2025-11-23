import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.XAI_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json(
                { error: 'XAI_API_KEY not configured' },
                { status: 500 }
            );
        }

        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.x.ai/v1",
            timeout: 360000,
        });

        const completion = await client.chat.completions.create({
            model: "grok-4-1-fast-non-reasoning",
            messages: [
                {
                    role: "system",
                    content: "You are a professional design assistant. Based on user's description, provide detailed design suggestions including layout, colors, typography, and visual elements. Be specific and creative."
                },
                {
                    role: "user",
                    content: `Create a design concept for: ${prompt}`
                },
            ],
        });

        const designSuggestion = completion.choices[0].message.content;

        return NextResponse.json({
            suggestion: designSuggestion,
        });
    } catch (error: any) {
        console.error('Error generating design:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate design',
                details: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
