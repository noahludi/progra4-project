import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, setAuthCookie, signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

export async function POST(req: Request) {
  await dbConnect();
  const data = registerSchema.parse(await req.json());
  const exists = await User.findOne({ email: data.email });
  if (exists) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
  const passwordHash = await hashPassword(data.password);
  const user = await User.create({ email: data.email, name: data.name, passwordHash });
  const token = signToken({ uid: String(user._id) })
  await setAuthCookie(token)
  return NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name } }, { status: 201 });
}
