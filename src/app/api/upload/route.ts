
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Ensure your firebase app is initialized and exported

const storage = getStorage(app);

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const uploaderId: string | null = data.get('uploaderId') as string | null;


  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename for Firebase Storage
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const storageRef = ref(storage, `uploads/${filename}`);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get the public URL of the uploaded file
    const publicUrl = await getDownloadURL(snapshot.ref);

    return NextResponse.json({ success: true, path: publicUrl });

  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file.' }, { status: 500 });
  }
}
