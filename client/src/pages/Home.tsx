import { useManifest } from "@/hooks/use-manifest";
import { InstallSection } from "@/components/InstallSection";
import { motion } from "framer-motion";
import { Music, Radio, Zap, AudioLines } from "lucide-react";

export default function Home() {
  const { data: manifest, isLoading } = useManifest();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background text-foreground selection:bg-black selection:text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Diagonal Strip */}
      <div className="absolute top-0 right-0 w-[50vw] h-[100vh] bg-neutral-100/50 -skew-x-12 translate-x-1/2 z-0 hidden lg:block" />

      <div className="container relative z-10 px-4 py-16 mx-auto flex flex-col items-center text-center">
        
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-primary text-primary-foreground border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <AudioLines className="w-12 h-12" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4 leading-none">
            Crunch
          </h1>
          
          <div className="h-2 w-24 bg-primary mx-auto mb-6" />

          <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-2xl mx-auto">
            Crunch is a lightweight Stremio addon for discovering and streaming user-uploaded music. It provides search, track metadata, and audio playback through a minimal install flow.
          </p>
          
          {isLoading ? (
            <div className="mt-4 h-6 w-32 bg-muted animate-pulse mx-auto rounded" />
          ) : (
            <p className="mt-2 text-sm font-mono text-muted-foreground/60">
              v{manifest?.version || "1.0.0"} • {manifest?.id || "com.stremio.crunch"}
            </p>
          )}
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-16"
        >
          <FeatureCard 
            icon={<Music className="w-6 h-6" />}
            title="Music"
            description="Access millions of tracks from SoundCloud directly in your library."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Fast"
            description="Optimized for speed. Lightweight efficient streaming with no bloat."
          />
          <FeatureCard 
            icon={<Radio className="w-6 h-6" />}
            title="Simple"
            description="Just install and play. No configuration required."
          />
        </motion.div>

        {/* Installation Area */}
        <div className="w-full max-w-md relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neutral-200 to-neutral-100 blur opacity-50 -z-10" />
          <InstallSection />
        </div>

      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs font-mono text-muted-foreground text-center w-full opacity-60">
        <p>Crunch Addon &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-6 bg-card border border-border/50 hover:border-primary/20 transition-colors duration-300">
      <div className="mb-4 p-3 bg-secondary rounded-full text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 font-display">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
