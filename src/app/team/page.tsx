
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const teamMembers = [
  {
    name: "Jane Doe",
    role: "Founder & CEO",
    bio: "Jane is the visionary behind RoktoBondhu, driven by a passion to save lives through technology. Her leadership and dedication inspire the entire team.",
    image: "https://placehold.co/400x400.png",
    hint: "woman portrait",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    }
  },
  {
    name: "John Smith",
    role: "Lead Developer",
    bio: "With a knack for building robust and scalable systems, John leads our technical team, ensuring the platform is always reliable and efficient.",
    image: "https://placehold.co/400x400.png",
    hint: "man portrait",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    }
  },
  {
    name: "Emily White",
    role: "UI/UX Designer",
    bio: "Emily crafts the user-friendly and beautiful interface of RoktoBondhu, making the experience seamless for both donors and recipients.",
    image: "https://placehold.co/400x400.png",
    hint: "woman smiling",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    }
  },
    {
    name: "Michael Brown",
    role: "Community Manager",
    bio: "Michael builds and nurtures our community of lifesavers, organizing events and spreading awareness about the importance of blood donation.",
    image: "https://placehold.co/400x400.png",
    hint: "man professional",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    }
  }
];

export default function TeamPage() {
  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            Meet Our Team
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            We are a group of passionate innovators, developers, and community builders dedicated to making a difference.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.name} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <Image
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  data-ai-hint={member.hint}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold font-headline">{member.name}</h3>
                <p className="text-primary font-semibold">{member.role}</p>
                <p className="text-muted-foreground mt-2 text-sm">{member.bio}</p>
                <Separator className="my-4" />
                <div className="flex justify-center gap-4">
                  <Link href={member.social.twitter} className="text-muted-foreground hover:text-primary">
                    <Twitter size={20} />
                  </Link>
                  <Link href={member.social.linkedin} className="text-muted-foreground hover:text-primary">
                    <Linkedin size={20} />
                  </Link>
                  <Link href={member.social.github} className="text-muted-foreground hover:text-primary">
                    <Github size={20} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
