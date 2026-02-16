import { NextRequest, NextResponse } from 'next/server';
import redis from '@/app/lib/redis';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  const userData = await redis.hGet('users', username);

  if (!userData) {
    return NextResponse.json({ message: 'Invalid username or password' }, { status: 400 });
  }

  const user = JSON.parse(userData);
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: 'Invalid username or password' }, { status: 400 });
  }

  // In a real application, you would create a session or JWT here
  return NextResponse.json({ message: 'Login successful' });
}
