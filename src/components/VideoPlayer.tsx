import { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  streamUrl: string;
  streamName: string;
  onClose: () => void;
}

const VideoPlayer = ({ streamUrl, streamName, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.log('Autoplay prevented:', err));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log('HLS Error:', data);
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.log('Autoplay prevented:', err));
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-2xl z-50 overflow-hidden animate-scale-in">
      <div className="bg-card">
        <div className="flex items-center justify-between bg-primary text-primary-foreground p-3">
          <div className="flex items-center gap-2">
            <Icon name="Play" size={16} />
            <span className="font-semibold text-sm truncate">{streamName}</span>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-primary-foreground/20 p-1 rounded transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            controls
            playsInline
          />
        </div>

        <div className="p-3 bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Icon name="Info" size={14} />
            <span>M3U поток • HLS</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoPlayer;