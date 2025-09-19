import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, setAuthCookie, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = loginSchema.parse(await req.json());
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const token = signToken({ uid: String(user._id) })
  await setAuthCookie(token)
  return NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name } });
}
