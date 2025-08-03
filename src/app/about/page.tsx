import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HeartHandshake, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-primary md:text-6xl font-headline">
            About RoktoDao
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/80 md:text-xl">
            We are a dedicated team passionate about using technology to bridge the gap between blood donors and those in need. Our mission is to make finding blood simple, fast, and efficient.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary font-headline">Our Story</h2>
            <Separator className="my-4" />
            <p className="text-muted-foreground leading-relaxed">
              RoktoDao (meaning "Give Blood" in Bengali) was born from a simple yet powerful idea: no one should suffer due to a shortage of blood. We witnessed the frantic searches and the anxiety faced by families in emergencies. We knew there had to be a better way.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We created this platform to build a community of voluntary blood donors, making it easy for them to register and for recipients to find them in critical moments. We believe that by connecting people, we can save lives and build a stronger, more compassionate society.
            </p>
          </div>
          <div>
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <img
                  src="https://ik.imagekit.io/uekohag7w/roktodao/gallery/About%20us%20page%20Roktodao"
                  alt="Blood donation information infographic"
                  data-ai-hint="blood donation"
                  className="rounded-lg object-cover w-full h-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="bg-primary/5 w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-primary md:text-4xl font-headline">
                Our Mission & Vision
            </h2>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <Card className="p-6">
                    <HeartHandshake className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">Save Lives</h3>
                    <p className="text-muted-foreground mt-2">To create a seamless network that facilitates timely blood donation, ultimately saving precious lives.</p>
                </Card>
                <Card className="p-6">
                    <Users className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">Build Community</h3>
                    <p className="text-muted-foreground mt-2">To foster a strong, nationwide community of voluntary blood donors inspired to help others.</p>
                </Card>
                <Card className="p-6">
                    <Target className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">Raise Awareness</h3>
                    <p className="text-muted-foreground mt-2">To educate and spread awareness about the importance and safety of regular blood donation.</p>
                </Card>
            </div>
        </div>
      </section>
    </div>
  );
}
