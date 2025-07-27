
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trash2, Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

interface GalleryImage {
    id: string;
    imageUrl: string;
    createdAt: any;
    status: 'pending' | 'approved';
    uploaderId?: string;
}

export default function GalleryManagementPage() {
    const [pendingImages, setPendingImages] = useState<GalleryImage[]>([]);
    const [approvedImages, setApprovedImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isApproving, setIsApproving] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchImages = async () => {
        setLoading(true);
        try {
            const imagesCollection = collection(db, 'gallery');
            
            const pendingQuery = query(imagesCollection, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
            const pendingSnapshot = await getDocs(pendingQuery);
            const pendingList = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
            setPendingImages(pendingList);

            const approvedQuery = query(imagesCollection, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
            const approvedSnapshot = await getDocs(approvedQuery);
            const approvedList = approvedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
            setApprovedImages(approvedList);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch gallery images.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);
    
    const handleApproveImage = async (imageId: string) => {
        setIsApproving(imageId);
        try {
            const imageRef = doc(db, 'gallery', imageId);
            await updateDoc(imageRef, { status: 'approved' });
            toast({ title: 'Image Approved', description: 'The image will now appear in the public gallery.' });
            fetchImages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not approve the image.' });
        } finally {
            setIsApproving(null);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        setIsDeleting(imageId);
        try {
            await deleteDoc(doc(db, 'gallery', imageId));
            toast({ title: 'Image Deleted', description: 'The image has been removed.' });
            fetchImages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the image.' });
        } finally {
            setIsDeleting(null);
        }
    };

    const ImageCard = ({ image, isPending }: { image: GalleryImage, isPending?: boolean }) => (
        <Card key={image.id} className="relative group overflow-hidden">
             <Image
                src={image.imageUrl}
                alt="Gallery image"
                width={400}
                height={400}
                className="w-full h-full object-cover aspect-square"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isPending && (
                    <Button 
                        variant="default" 
                        size="icon" 
                        disabled={!!isApproving}
                        onClick={() => handleApproveImage(image.id)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isApproving === image.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                )}
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
                            This action cannot be undone. This will permanently delete this image.
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
    );

    return (
        <div>
            <header className="py-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                    Gallery Management
                </h1>
                <p className="text-muted-foreground">Approve or remove user-submitted images for the gallery.</p>
            </header>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Pending Images ({pendingImages.length})</CardTitle>
                    <CardDescription>These images are waiting for your approval.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="text-center">Loading images...</div>
                    ) : pendingImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {pendingImages.map((image) => <ImageCard key={image.id} image={image} isPending />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-muted-foreground">No pending images to review.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Separator className="my-8" />

            <Card>
                <CardHeader>
                    <CardTitle>Approved Images ({approvedImages.length})</CardTitle>
                    <CardDescription>These images are currently live in the gallery.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="text-center">Loading images...</div>
                    ) : approvedImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {approvedImages.map((image) => <ImageCard key={image.id} image={image} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-muted-foreground">No approved images found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
