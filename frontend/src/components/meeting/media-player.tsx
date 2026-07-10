"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";

interface MediaPlayerProps {
    mediaUrl?: string | null;
    duration?: number;
}

export function MediaPlayer({ mediaUrl, duration = 900 }: MediaPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { setCurrentMediaTime, seekRequest, clearSeekRequest } = useAppStore();
    
    // Make the video duration slightly longer than the transcript
    const displayDuration = duration + 30;
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [virtualTime, setVirtualTime] = useState(0);
    
    // Handle transcript seek clicks
    useEffect(() => {
        if (seekRequest !== null) {
            setVirtualTime(seekRequest);
            setCurrentMediaTime(seekRequest);
            setIsPlaying(true);
            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
            }
            clearSeekRequest();
        }
    }, [seekRequest, clearSeekRequest, setCurrentMediaTime]);

    // Handle virtual timer ticking
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setVirtualTime(prev => {
                    const next = prev + 1;
                    if (next >= displayDuration) {
                        setIsPlaying(false);
                        if (videoRef.current) videoRef.current.pause();
                        return displayDuration;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, displayDuration]);

    // Sync virtual time to global store
    useEffect(() => {
        setCurrentMediaTime(virtualTime);
    }, [virtualTime, setCurrentMediaTime]);

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
        } else {
            // if finished, restart
            if (virtualTime >= displayDuration) {
                setVirtualTime(0);
            }
            setIsPlaying(true);
            if (videoRef.current) videoRef.current.play().catch(() => {});
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        setVirtualTime(newTime);
        setCurrentMediaTime(newTime);
    };

    return (
        <Card className="p-4 bg-background flex flex-col gap-3">
            <video
                ref={videoRef}
                src={mediaUrl || "/video.mp4"}
                loop
                className="w-full h-auto aspect-video rounded-md bg-black object-cover"
                onClick={togglePlay}
            />
            
            {/* Custom Controls */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay} 
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors shrink-0"
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
                
                <div className="text-sm font-medium text-muted-foreground shrink-0 w-12 text-center">
                    {formatTime(virtualTime)}
                </div>
                
                <input 
                    type="range" 
                    min={0} 
                    max={displayDuration} 
                    value={virtualTime} 
                    onChange={handleScrub}
                    className="flex-1 cursor-pointer accent-primary"
                />
                
                <div className="text-sm font-medium text-muted-foreground shrink-0 w-12 text-center">
                    {formatTime(displayDuration)}
                </div>
            </div>
        </Card>
    );
}