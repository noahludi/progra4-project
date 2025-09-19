import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Review from '@/models/Review';
import { reviewSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const data = reviewSchema.partial().parse(await req.json());

  const r = await Review.findById(params.id);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(r.user) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  Object.assign(r, data);
  await r.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const r = await Review.findById(params.id);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(r.user) !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await r.deleteOne();
  return NextResponse.json({ ok: true });
}
