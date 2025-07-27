
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trash2, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface GalleryImage {
    id: string;
    imageUrl: string;
    createdAt: any;
}

export default function GalleryManagementPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const fetchImages = async () => {
        setLoading(true);
        try {
            const imagesCollection = collection(db, 'gallery');
            const q = query(imagesCollection, orderBy('createdAt', 'desc'));
            const imagesSnapshot = await getDocs(q);
            const imagesList = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
            setImages(imagesList);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch gallery images.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please select an image file to upload.' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                await addDoc(collection(db, 'gallery'), {
                    imageUrl: data.path,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Image Uploaded', description: 'The new image has been added to the gallery.' });
                setSelectedFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
                fetchImages();
            } else {
                throw new Error(data.error || 'Failed to get a success response from server.');
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setUploading(false);
        }
    };
    
    const handleDeleteImage = async (imageId: string) => {
        setIsDeleting(imageId);
        try {
            await deleteDoc(doc(db, 'gallery', imageId));
            toast({ title: 'Image Deleted', description: 'The image has been removed from the gallery.' });
            fetchImages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the image.' });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <header className="py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                        Gallery Management
                    </h1>
                    <p className="text-muted-foreground">Manage images for the homepage gallery.</p>
                </div>
            </header>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Upload New Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                         <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full sm:w-auto">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </div>
                     {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Gallery Images</CardTitle>
                    <CardDescription>These images are currently displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="text-center">Loading images...</div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <Card key={image.id} className="relative group overflow-hidden">
                                     <Image
                                        src={image.imageUrl}
                                        alt="Gallery image"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" disabled={!!isDeleting}>
                                                    {isDeleting === image.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this image from the gallery.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteImage(image.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-muted-foreground">No images found in the gallery.</p>
                           <p className="text-sm text-muted-foreground/80">Upload an image to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
