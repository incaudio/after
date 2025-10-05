import { useLocation } from "wouter";
import { Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass-elevated border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-violet-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <button 
              onClick={() => setLocation("/")}
              className="text-2xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent"
            >
              Mate.
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Music className="w-16 h-16 mx-auto text-violet-400" />
            <h1 className="text-4xl md:text-5xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              About Mate Nation
            </h1>
          </div>

          <div className="glass rounded-2xl p-8 md:p-12 space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              "Mate." is more than just a music search engine. We are a forward-thinking record label 
              that believes in the power of diversity and innovation in music.
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-violet-400">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                We accept all genres and celebrate the unique sounds that make music truly special. 
                Our mission is to bring a change to the music industry by embracing artists who dare 
                to be different and blend styles in unprecedented ways.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-blue-400">What We Do</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mate Nation is built on the foundation of musical exploration and discovery. We provide 
                a platform where artists can showcase their unique sounds and music lovers can discover 
                the next big thing, regardless of genre boundaries.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-violet-400">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to supporting artists who push creative boundaries and create music 
                that resonates with authenticity. Whether you're into electronic, acoustic, experimental, 
                or any blend in between, Mate Nation is here to help you find your sound and share it 
                with the world.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-center text-muted-foreground italic">
                "Blending unique sounds, breaking boundaries, changing the music industry."
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
