import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Vote from '@/models/Vote';
import { getCurrentUser } from '@/lib/auth';
import { voteSchema } from '@/lib/validation';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const [up, down] = await Promise.all([
    Vote.countDocuments({ review: params.id, value: 1 }),
    Vote.countDocuments({ review: params.id, value: -1 }),
  ]);
  return NextResponse.json({ up, down, score: up - down });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const { value } = voteSchema.parse(await req.json());
  await Vote.findOneAndUpdate(
    { user: user.id, review: params.id },
    { $set: { value } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
