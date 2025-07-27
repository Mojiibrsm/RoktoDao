
"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { collection, getDocs, doc, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface GalleryImage {
    id: string;
    imageUrl: string;
    status: 'pending' | 'approved';
    uploaderId?: string;
    createdAt: any;
}

const UploadDialog = () => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    status: 'pending',
                    uploaderId: user.uid,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Image Uploaded', description: 'Thank you! Your image is now pending approval from an admin.' });
                setSelectedFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
                setIsDialogOpen(false);
            } else {
                throw new Error(data.error || 'Failed to get a success response from server.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setUploading(false);
        }
    };

    return (
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> ছবি আপলোড করুন</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>গ্যালারির জন্য ছবি আপলোড করুন</DialogTitle>
                    <DialogDescription>
                        আপনার ছবিটি অ্যাডমিনের অনুমোদনের পর গ্যালারিতে যুক্ত করা হবে।
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
                        {uploading ? 'আপলোড হচ্ছে...' : 'সাবমিট করুন'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const imagesCollection = collection(db, 'gallery');
                // Order by creation time and filter for approved status on the client
                const q = query(imagesCollection, orderBy('createdAt', 'desc'));
                const imagesSnapshot = await getDocs(q);
                const imagesList = imagesSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage))
                    .filter(img => img.status === 'approved');
                setImages(imagesList);
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch gallery images.' });
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [toast]);

    return (
         <div className="bg-background">
            <section className="w-full bg-primary/10 py-20 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
                        গ্যালারি
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
                        আমাদের রক্তযোদ্ধাদের কিছু অনুপ্রেরণামূলক মুহূর্ত এবং কার্যক্রমের ছবি।
                    </p>
                    <div className="mt-8">
                       {!authLoading && (
                           user ? <UploadDialog /> : <Button asChild><Link href="/login">ছবি আপলোড করতে লগইন করুন</Link></Button>
                       )}
                    </div>
                </div>
            </section>
            <section className="container mx-auto py-16 md:py-24 px-4">
                 {loading ? (
                    <div className="text-center py-16">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <p className="mt-4 text-muted-foreground">ছবি লোড হচ্ছে...</p>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                             <Card key={image.id} className="overflow-hidden group">
                                <Image
                                    src={image.imageUrl}
                                    alt="Gallery image"
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110"
                                />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                       <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                       <p className="mt-4 text-muted-foreground">গ্যালারিতে কোনো ছবি পাওয়া যায়নি।</p>
                       <p className="text-sm text-muted-foreground/80">ছবি আপলোড করে প্রথম জন হোন!</p>
                    </div>
                )}
            </section>
        </div>
    );
}
