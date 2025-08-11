

"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Upload, Image as ImageIcon, Loader2, CheckCircle, PlusCircle } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import IK from 'imagekit-javascript';

interface GalleryImage {
    id: string;
    imageUrl: string;
    createdAt: any;
    status: 'pending' | 'approved';
    uploaderId?: string;
    filePath?: string; 
    fileId?: string; 
}

const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_mZ0R0Fsxxuu72DflLr4kGejkwrE=',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uekohag7w',
    authenticationEndpoint: '/api/imagekit-auth',
});

const AdminUploadDialog = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload.' });
            return;
        }

        setUploading(true);

        try {
            const authResponse = await fetch('/api/imagekit-auth');
            if (!authResponse.ok) {
                const errorData = await authResponse.json();
                throw new Error(errorData.error || 'Failed to get authentication parameters');
            }
            const authParams = await authResponse.json();

            const response = await imagekit.upload({
                ...authParams,
                file: selectedFile,
                fileName: selectedFile.name,
                useUniqueFileName: true,
                folder: '/roktodao/gallery/',
            });

            const { error } = await supabase.from('gallery').insert({
                imageUrl: response.url,
                filePath: response.filePath,
                fileId: response.fileId,
                status: 'approved', // Admin uploads are automatically approved
                uploaderId: user.id, // Correctly use user.id which is the UID
            });

            if (error) throw error;

            toast({ title: 'Image Uploaded', description: 'The image has been added to the gallery.' });
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            setIsDialogOpen(false);
            onUploadComplete();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><Upload className="mr-2 h-4 w-4" /> Upload Image</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload New Gallery Image</DialogTitle>
                    <DialogDescription>
                        Images uploaded here will be automatically approved and added to the gallery.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        {uploading ? 'Uploading...' : 'Submit Image'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


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
            const { data: allImages, error } = await supabase
                .from('gallery')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;
            
            setPendingImages(allImages.filter(img => img.status === 'pending'));
            setApprovedImages(allImages.filter(img => img.status === 'approved'));

        } catch (error: any) {
            console.error(error);
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
            const { error } = await supabase
                .from('gallery')
                .update({ status: 'approved' })
                .eq('id', imageId);

            if (error) throw error;
            
            toast({ title: 'Image Approved', description: 'The image will now appear in the public gallery.' });
            fetchImages();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: `Could not approve the image: ${error.message}` });
        } finally {
            setIsApproving(null);
        }
    };

    const handleDeleteImage = async (image: GalleryImage) => {
        setIsDeleting(image.id);
        try {
            // First, delete from ImageKit if fileId is available
            if (image.fileId) {
                // This part requires a backend endpoint to securely call ImageKit's delete API
                // For now, we will just delete from Supabase.
                // console.log(`TODO: Implement backend to delete ImageKit file ID: ${image.fileId}`);
            }

            const { error } = await supabase
                .from('gallery')
                .delete()
                .eq('id', image.id);
            
            if (error) throw error;

            toast({ title: 'Image Record Deleted', description: 'The image reference has been removed from the database.' });
            fetchImages();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: `Could not delete the image record: ${error.message}` });
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
                            This action cannot be undone. This will permanently delete this image record.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteImage(image)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );

    return (
        <div>
            <header className="py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                        Gallery Management
                    </h1>
                    <p className="text-muted-foreground">Approve or remove images, and upload new ones.</p>
                </div>
                 <AdminUploadDialog onUploadComplete={fetchImages} />
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
