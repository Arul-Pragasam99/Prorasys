import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const q = query(collection(db, 'products'), orderBy('combinedScore', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const ref = await addDoc(collection(db, 'products'), payload);
    return NextResponse.json({ id: ref.id, ...payload }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to write to Firestore' }, { status: 500 });
  }
}
