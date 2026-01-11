import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function InstallSection() {
  const [copied, setCopied] = useState(false);
  const [manifestUrl, setManifestUrl] = useState("");
  const [stremioUrl, setStremioUrl] = useState("");

  useEffect(() => {
    // Client-side only URL construction
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    // HTTP URL for copying
    const httpUrl = `${protocol}//${host}/manifest.json`;
    setManifestUrl(httpUrl);
    
    // Stremio Protocol URL for installing
    // Stremio usually expects stremio:// for http and stremios:// for https, 
    // but modern Stremio handles stremio:// pointing to https correctly mostly.
    // Ideally we strip the protocol from the string and prefix with stremio://
    const rawHost = host; 
    setStremioUrl(`stremio://${rawHost}/manifest.json`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto mt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <a href={stremioUrl} className="w-full no-underline">
          <Button size="lg" className="w-full gap-3 text-lg">
            <Download className="w-5 h-5" />
            Install Addon
          </Button>
        </a>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 translate-x-2 translate-y-2 -z-10 border border-primary/10" />
          <div className="flex items-center gap-2 p-1 pl-4 bg-background border-2 border-border">
            <code className="flex-1 text-xs sm:text-sm font-mono text-muted-foreground truncate">
              {manifestUrl || "Loading..."}
            </code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="shrink-0 h-10 w-10 px-0"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          If the button doesn't work, copy the link and paste it into Stremio's search bar.
        </p>
      </motion.div>
    </div>
  );
}
