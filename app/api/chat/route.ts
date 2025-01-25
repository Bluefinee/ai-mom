import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/services/geminiService';

const TIMEOUT_MS = 15000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    if (body.persona) {
      geminiService.setPersona(body.persona);
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS);
    });

    const responsePromise = geminiService.generateResponse(body.messages);
    const response = await Promise.race([responsePromise, timeoutPromise]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        return NextResponse.json(
          { error: '応答がタイムアウトしました。もう一度お試しください。' },
          { status: 504 }
        );
      }

      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'メッセージの形式が正しくありません。' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '予期せぬエラーが発生しました。しばらく待ってから再度お試しください。' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';