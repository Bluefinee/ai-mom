import { NextRequest, NextResponse } from 'next/server'; 
import { geminiService } from '@/services/geminiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await geminiService.generateResponse(body.messages);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

