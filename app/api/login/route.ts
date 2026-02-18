import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from('User Data')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 400 });
  }

  const passwordMatch = await bcrypt.compare(password, user.Password);

  if (!passwordMatch) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Login successful', username: user.Name });
}
