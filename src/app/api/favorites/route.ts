import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Favorite from '@/models/Favorite';
import { getCurrentUser } from '@/lib/auth';
import { favoriteSchema } from '@/lib/validation';

export async function GET() {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const items = await Favorite.find({ user: user.id }).lean();
  return NextResponse.json({ items: items.map((f: any) => ({ id: String(f._id), bookId: f.bookId })) });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const { bookId } = favoriteSchema.parse(await req.json());
  await Favorite.updateOne({ user: user.id, bookId }, { $setOnInsert: { user: user.id, bookId } }, { upsert: true });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const { bookId } = favoriteSchema.parse(await req.json());
  await Favorite.deleteOne({ user: user.id, bookId });
  return NextResponse.json({ ok: true });
}
