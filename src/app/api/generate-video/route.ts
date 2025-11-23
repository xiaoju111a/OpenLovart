import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, seconds, size, referenceImage } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.VIDEO_API_KEY;
        const baseUrl = process.env.VIDEO_API_BASE_URL || 'https://www.clockapi.fun/v1';

        if (!apiKey) {
            return NextResponse.json({ error: 'VIDEO_API_KEY not configured' }, { status: 500 });
        }

        const form = new FormData();
        form.append('model', 'sora-2');
        form.append('prompt', prompt);
        
        if (seconds) form.append('seconds', seconds.toString());
        if (size) form.append('size', size);

        if (referenceImage) {
            const base64Data = referenceImage.includes('base64,') ? referenceImage.split('base64,')[1] : referenceImage;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            form.append('input_reference', blob, 'reference.jpg');
        }

        const response = await fetch(`${baseUrl}/videos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: form,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to start video generation');

        return NextResponse.json({ taskId: data.id, status: data.status });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to generate video', details: error.message }, { status: 500 });
    }
}
