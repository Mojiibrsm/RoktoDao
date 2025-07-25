
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost as BlogPostType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
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

interface BlogPost extends BlogPostType {
    id: string;
}

const blogPostSchema = z.object({
  title: z.string().min(5, { message: 'Title is required.' }),
  slug: z.string().min(5, { message: 'Slug is required and must be unique.' }).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  author: z.string().min(3, { message: 'Author name is required.' }),
  excerpt: z.string().min(10, { message: 'Excerpt is required.' }),
  content: z.string().min(20, { message: 'Content is required.' }),
  image: z.string().url({ message: 'A valid image URL is required.' }),
  hint: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

const BlogPostForm = ({ form, onSubmit, isSubmitting, submitText }: { form: UseFormReturn<BlogPostFormValues>, onSubmit: (values: BlogPostFormValues) => void, isSubmitting: boolean, submitText: string }) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Blog Post Title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="unique-post-slug" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem><FormLabel>Author</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                    <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea placeholder="A short summary of the post..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="content" render={={({ field }) => (
                    <FormItem><FormLabel>Content (HTML)</FormLabel><FormControl><Textarea placeholder="<h2>Title</h2><p>Paragraph...</p>" rows={8} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://placehold.co/600x400.png" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="hint" render={={({ field }) => (
                    <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., medical checkup" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : submitText}</Button>
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
            slug: '',
            author: 'RoktoDao Team',
            excerpt: '',
            content: '',
            image: 'https://placehold.co/600x400.png',
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
            form.reset();
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
                    if (!isOpen) form.reset();
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
                                <TableHead>Slug</TableHead>
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
                                    <TableCell>{post.slug}</TableCell>
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

