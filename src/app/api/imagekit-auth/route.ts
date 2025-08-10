
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET(request: NextRequest) {
    const { 
        NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, 
        IMAGEKIT_PRIVATE_KEY, 
        NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT 
    } = process.env;

    // Check if all required environment variables are set
    if (!NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        const missingKeys = [
            !NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY && "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
            !IMAGEKIT_PRIVATE_KEY && "IMAGEKIT_PRIVATE_KEY",
            !NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT && "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
        ].filter(Boolean).join(', ');

        console.error(`ImageKit configuration error: The following environment variables are missing: ${missingKeys}`);
        return NextResponse.json(
            { success: false, error: `Server configuration error: Missing ImageKit credentials (${missingKeys}). Please contact site administrator.` },
            { status: 500 }
        );
    }
    
    // Initialize ImageKit inside the handler to ensure env vars are loaded
    const imagekit = new ImageKit({
        publicKey: NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error: any) {
        console.error('Error getting ImageKit authentication parameters:', error.message);
        return NextResponse.json(
            { success: false, error: 'Failed to get authentication parameters from server. Check server logs for details.' },
            { status: 500 }
        );
    }
}
