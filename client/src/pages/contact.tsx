import { useLocation } from "wouter";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
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
            <Mail className="w-16 h-16 mx-auto text-violet-400" />
            <h1 className="text-4xl md:text-5xl font-display font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground">
              We'd love to hear from you
            </p>
          </div>

          <div className="glass rounded-2xl p-8 md:p-12 space-y-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Have questions, suggestions, or want to collaborate with Mate Nation? 
                Get in touch with us!
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="glass-elevated rounded-xl p-6 w-full max-w-md text-center space-y-4">
                <Mail className="w-8 h-8 mx-auto text-violet-400" />
                <div>
                  <h3 className="font-display font-medium text-lg mb-2">Email Us</h3>
                  <a 
                    href="mailto:matenations@gmail.com"
                    className="text-violet-400 hover:text-violet-300 transition-colors text-lg"
                  >
                    matenations@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-center text-muted-foreground">
                Whether you're an artist looking to join Mate Nation, a music enthusiast with feedback, 
                or someone interested in partnering with us, we're here to listen.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
