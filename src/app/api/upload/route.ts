import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  
  // Define the upload directory path
  const uploadDir = join(process.cwd(), 'public/uploads');

  // Ensure the upload directory exists
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  
  const path = join(uploadDir, filename);
  
  try {
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);
    
    // Return the public path to the file
    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' }, { status: 500 });
  }
}
