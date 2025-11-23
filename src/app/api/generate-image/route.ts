import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, resolution, aspectRatio, referenceImage, mimeType } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        console.log('Starting image generation with Gemini:', prompt);

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY not configured' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        const tools = [
            {
                googleSearch: {}
            },
        ];

        const config = {
            responseModalities: ['IMAGE', 'TEXT'],
            imageConfig: {
                imageSize: resolution || '1K',
            },
            tools,
        } as any;

        const model = 'gemini-3-pro-image-preview';

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ];

        // Add reference image if present
        if (referenceImage) {
            let cleanData = referenceImage;
            let finalMimeType = mimeType || 'image/jpeg';

            // Check if it has a data URI prefix
            if (referenceImage.includes('base64,')) {
                const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
                if (matches) {
                    finalMimeType = matches[1];
                    cleanData = matches[2];
                } else {
                    // Fallback split if regex fails but base64 marker exists
                    const parts = referenceImage.split('base64,');
                    if (parts.length > 1) {
                        cleanData = parts[1];
                    }
                }
            }

            contents[0].parts.push({
                // @ts-ignore
                inlineData: {
                    mimeType: finalMimeType,
                    data: cleanData
                }
            });
        }

        console.log('Calling Gemini API with model:', model);

        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let imageData: string | null = null;
        let textResponse = '';

        for await (const chunk of response) {
            if (!chunk.candidates || !chunk.candidates[0]?.content || !chunk.candidates[0]?.content?.parts) {
                continue;
            }

            const parts = chunk.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData) {
                    console.log('Found inline data with mimeType:', part.inlineData.mimeType);
                    imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    textResponse += part.text;
                }
            }
        }

        if (!imageData) {
            if (textResponse) {
                return NextResponse.json({
                    error: 'Model returned text instead of image',
                    details: textResponse
                }, { status: 500 });
            }

            return NextResponse.json(
                {
                    error: 'No image was generated',
                    details: 'No image data found in response.'
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            imageData,
            textResponse,
        });

    } catch (error: any) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate image',
                details: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
