
"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost as BlogPostType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import IK from 'imagekit-javascript';


interface BlogPost extends BlogPostType {
    id: string;
}

const blogPostSchema = z.object({
  title: z.string().min(5, { message: 'Title is required.' }),
  link: z.string().url({ message: 'A valid URL is required for the post link.' }),
  author: z.string().min(3, { message: 'Author name is required.' }),
  excerpt: z.string().min(10, { message: 'Excerpt is required.' }),
  image: z.string().url({ message: 'An image is required.' }),
  hint: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_mZ0R0Fsxxuu72DflLr4kGejkwrE=',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uekohag7w',
    authenticationEndpoint: '/api/imagekit-auth',
});


const BlogPostForm = ({ form, onSubmit, isSubmitting, submitText }: { form: UseFormReturn<BlogPostFormValues>, onSubmit: (values: BlogPostFormValues) => void, isSubmitting: boolean, submitText: string }) => {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(form.getValues('image') || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImagePreview(URL.createObjectURL(file));
            setUploading(true);

            try {
                const authResponse = await fetch('/api/imagekit-auth');
                 if (!authResponse.ok) throw new Error('Failed to authenticate with ImageKit.');
                const authParams = await authResponse.json();

                const response = await imagekit.upload({
                    ...authParams,
                    file: file,
                    fileName: file.name,
                    useUniqueFileName: true,
                    folder: '/roktodao/blogs/',
                });
                form.setValue('image', response.url, { shouldValidate: true });
                setImagePreview(response.url);
                toast({ title: 'Image Uploaded', description: 'The image has been successfully uploaded.' });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
                setImagePreview(form.getValues('image')); // Revert on failure
            } finally {
                setUploading(false);
            }
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Blog Post Title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="link" render={({ field }) => (
                    <FormItem><FormLabel>Post Link</FormLabel><FormControl><Input placeholder="https://example.com/blog-post" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem><FormLabel>Author</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                    <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea placeholder="A short summary of the post..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 rounded-md border flex items-center justify-center bg-muted overflow-hidden">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" width={128} height={128} className="object-cover h-full w-full" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload Image
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </FormControl>
                    <FormMessage>{form.formState.errors.image?.message}</FormMessage>
                </FormItem>
                <FormField control={form.control} name="hint" render={({ field }) => (
                    <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., medical checkup" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting || uploading}>{isSubmitting ? 'Saving...' : submitText}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function BlogManagementPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: {
            title: '',
            link: '',
            author: 'RoktoDao Team',
            excerpt: '',
            image: '',
            hint: 'blood donation',
        },
    });

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const postsCollection = collection(db, 'blogs');
            const q = query(postsCollection, orderBy('createdAt', 'desc'));
            const postsSnapshot = await getDocs(q);
            const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            setPosts(postsList);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch blog posts.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleAddPost = async (values: BlogPostFormValues) => {
        try {
            await addDoc(collection(db, 'blogs'), {
                ...values,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Post Added', description: 'The new blog post has been added successfully.' });
            fetchPosts();
            form.reset({
                title: '', link: '', author: 'RoktoDao Team', excerpt: '', image: '', hint: 'blood donation',
            });
            setIsAddDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add the post.' });
        }
    };

    const handleUpdatePost = async (values: BlogPostFormValues) => {
        if (!selectedPost) return;
        try {
            const postRef = doc(db, 'blogs', selectedPost.id);
            await updateDoc(postRef, values);
            toast({ title: 'Post Updated', description: 'The post has been updated successfully.' });
            fetchPosts();
            setIsEditDialogOpen(false);
            setSelectedPost(null);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not update the post.' });
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;
        try {
            await deleteDoc(doc(db, 'blogs', selectedPost.id));
            toast({ title: 'Post Deleted', description: 'The post has been deleted.' });
            fetchPosts();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the post.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedPost(null);
        }
    };

    const openEditDialog = (post: BlogPost) => {
        setSelectedPost(post);
        form.reset(post);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div>
            <header className="py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl font-headline">
                        Blog Management
                    </h1>
                    <p className="text-muted-foreground">Add, edit, or remove blog posts.</p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
                    setIsAddDialogOpen(isOpen);
                     if (!isOpen) form.reset({ title: '', link: '', author: 'RoktoDao Team', excerpt: '', image: '', hint: 'blood donation' });
                }}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Post</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Add New Blog Post</DialogTitle>
                        </DialogHeader>
                        <BlogPostForm form={form} onSubmit={handleAddPost} isSubmitting={form.formState.isSubmitting} submitText="Add Post" />
                    </DialogContent>
                </Dialog>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>This is the list of all blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading posts...</TableCell>
                                </TableRow>
                            ) : posts.length > 0 ? (
                                posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell><a href={post.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{post.link}</a></TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openEditDialog(post)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => openDeleteDialog(post)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No posts found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
                setIsEditDialogOpen(isOpen);
                if (!isOpen) setSelectedPost(null);
            }}>
                 <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Blog Post</DialogTitle>
                    </DialogHeader>
                    <BlogPostForm form={form} onSubmit={handleUpdatePost} isSubmitting={form.formState.isSubmitting} submitText="Save Changes" />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this blog post.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPost(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    