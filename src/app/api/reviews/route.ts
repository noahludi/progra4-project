import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Review from '@/models/Review';
import { reviewSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId') || undefined;
  const q: any = bookId ? { bookId } : {};
  const rows = await Review.find(q).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    items: rows.map((r: any) => ({
      id: String(r._id),
      user: String(r.user),
      bookId: r.bookId,
      title: r.title,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const data = reviewSchema.parse(await req.json());
  const r = await Review.create({ ...data, user: user.id });
  return NextResponse.json({ id: String(r._id) }, { status: 201 });
}
