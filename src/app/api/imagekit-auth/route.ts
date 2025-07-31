
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export async function GET(request: NextRequest) {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        return NextResponse.json(authenticationParameters);
    } catch (error) {
        console.error('Error getting ImageKit authentication parameters:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get authentication parameters.' },
            { status: 500 }
        );
    }
}
