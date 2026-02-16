import { NextRequest, NextResponse } from 'next/server';
import redis from '@/app/lib/redis';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  const userExists = await redis.hExists('users', username);

  if (userExists) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await redis.hSet('users', username, JSON.stringify({ username, password: hashedPassword }));

  return NextResponse.json({ message: 'User created successfully' });
}
