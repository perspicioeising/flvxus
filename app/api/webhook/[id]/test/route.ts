
import { NextResponse } from 'next/server';
import { webhookService } from '@/webhooks/service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await webhookService.testWebhook(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}