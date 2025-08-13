
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import IK from 'imagekit-javascript';

// Step 1: Initialize ImageKit SDK
// Ensure your environment variables are set in the .env file.
// These are placeholders and should be replaced with your actual keys.
const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_mZ0R0Fsxxuu72DflLr4kGejkwrE=',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uekohag7w',
    authenticationEndpoint: '/api/imagekit-auth', // This endpoint is crucial for security
});

export default function ImageUploadExamplePage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 2: Handle file selection from the input
    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setUploadedImageUrl(''); // Clear previous upload result
            
            // Create a temporary URL for previewing the selected image
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Step 3: Handle the upload process
    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                variant: 'destructive',
                title: 'No File Selected',
                description: 'Please select an image file to upload.',
            });
            return;
        }

        setIsUploading(true);

        try {
            // The ImageKit SDK automatically calls the `authenticationEndpoint`
            // to get security credentials before uploading.
            const response = await imagekit.upload({
                file: selectedFile,
                fileName: selectedFile.name,
                useUniqueFileName: true,
                folder: '/roktodao/examples/', // You can change the destination folder
            });

            // After a successful upload, ImageKit returns an object with details
            console.log('ImageKit Upload Response:', response);
            setUploadedImageUrl(response.url);

            toast({
                title: 'Upload Successful!',
                description: 'Your image has been uploaded to ImageKit.',
            });

        } catch (error: any) {
            console.error('ImageKit Upload Error:', error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'An unknown error occurred during upload.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary">ImageKit Upload Example</CardTitle>
                    <CardDescription>
                        This page demonstrates the complete process of uploading an image from the browser to ImageKit.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Hidden file input, triggered by a button */}
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Image Preview Area */}
                    <div 
                        className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Selected preview" width={400} height={256} className="max-h-full w-auto object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p>Click here to select an image</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Upload Button */}
                    <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || !selectedFile} 
                        className="w-full"
                        size="lg"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-5 w-5" />
                                Upload to ImageKit
                            </>
                        )}
                    </Button>

                    {/* Display result after upload */}
                    {uploadedImageUrl && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-2">
                             <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
                             <h3 className="font-semibold text-green-800">Upload Complete</h3>
                             <p className="text-sm text-muted-foreground">
                                The image is now available at the following URL:
                             </p>
                             <Link href={uploadedImageUrl} target="_blank" className="text-xs text-primary break-all hover:underline">
                                {uploadedImageUrl}
                             </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
