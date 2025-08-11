
"use client";

import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Crown, Shield, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import TeamMemberCard from '@/components/team-member-card';
import DirectorCard from '@/components/director-card';

interface Member {
  id: string;
  name: string;
  role: string;
  bloodGroup: string;
  phone: string;
  email: string;
  location: string;
  avatar: string;
  avatarHint?: string;
}

export default function TeamPage() {
  const [director, setDirector] = useState<Member | null>(null);
  const [moderators, setModerators] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
        setLoading(true);
        try {
            const { data: allMembers, error } = await supabase
                .from('moderators')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;
            
            const directorMember = allMembers.find(m => m.role === 'প্রধান পরিচালক');
            const moderatorMembers = allMembers.filter(m => m.role !== 'প্রধান পরিচালক');

            setDirector(directorMember || null);
            setModerators(moderatorMembers);

        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchTeam();
  }, []);

  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            আমাদের নিবেদিতপ্রাণ টিম
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            আমরা একটি উৎসাহী দল, যারা রক্তদানের মাধ্যমে জীবন বাঁচাতে এবং একটি শক্তিশালী সম্প্রদায় গড়তে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4 space-y-12">
        {loading ? (
             <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">টিম লোড হচ্ছে...</p>
             </div>
        ) : (
            <>
                {director && (
                    <div>
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Crown className="h-8 w-8 text-amber-500" />
                            <h2 className="text-3xl font-bold font-headline text-primary">প্রধান পরিচালক</h2>
                        </div>
                        <div className="flex justify-center">
                            <DirectorCard member={director} />
                        </div>
                    </div>
                )}
                
                {director && moderators.length > 0 && <Separator />}

                {moderators.length > 0 && (
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <Shield className="h-8 w-8 text-blue-500" />
                            <h2 className="text-3xl font-bold font-headline text-primary">Moderators</h2>
                            <Badge variant="default" className="text-lg">{moderators.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                            {moderators.map((member) => (
                                <TeamMemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                )}

                {!director && moderators.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No team members found.</p>
                    </div>
                )}
            </>
        )}
      </section>
    </div>
  );
}
