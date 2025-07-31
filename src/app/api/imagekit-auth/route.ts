
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: "public_mZ0R0Fsxxuu72DflLr4kGejkwrE=",
    privateKey: "private_oxWypOIrfyl2gy6t4wgh4wJilRQ=",
    urlEndpoint: "https://ik.imagekit.io/uekohag7w",
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
