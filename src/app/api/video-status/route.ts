import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const taskId = request.nextUrl.searchParams.get('taskId');
        if (!taskId) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

        const apiKey = process.env.VIDEO_API_KEY;
        const baseUrl = process.env.VIDEO_API_BASE_URL || 'https://www.clockapi.fun/v1';

        if (!apiKey) return NextResponse.json({ error: 'VIDEO_API_KEY not configured' }, { status: 500 });

        const response = await fetch(`${baseUrl}/videos/${taskId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to get video status');

        return NextResponse.json({
            id: data.id,
            status: data.status,
            progress: data.progress || 0,
            videoUrl: data.video_url,
            model: data.model,
            createdAt: data.created_at,
            size: data.size,
            seconds: data.seconds,
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to get video status', details: error.message }, { status: 500 });
    }
}
