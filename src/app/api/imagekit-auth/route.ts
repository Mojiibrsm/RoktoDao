
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Ensure environment variables are loaded
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
    console.error("ImageKit environment variables are not properly configured.");
}


// Initialize ImageKit on the server with the private key
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET(request: NextRequest) {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error('Error getting ImageKit authentication parameters:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get authentication parameters from server.' },
            { status: 500 }
        );
    }
}

