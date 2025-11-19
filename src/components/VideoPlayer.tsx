import { useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  streamUrl: string;
  streamName: string;
  onClose: () => void;
}

const VideoPlayer = ({ streamUrl, streamName, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
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
            autoPlay
          >
            <source src={streamUrl} type="application/x-mpegURL" />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
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
