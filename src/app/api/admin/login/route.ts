import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (verifyAdminPassword(password)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Senha incorreta' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro interno' });
  }
}