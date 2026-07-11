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
    
    const displayDuration = duration + 30;
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [globalTime, setGlobalTime] = useState(0);
    const lastVideoTimeRef = useRef(0);
    const isScrubbingRef = useRef(false);

    // Sync global time cleanly to store
    useEffect(() => {
        setCurrentMediaTime(globalTime);
    }, [globalTime, setCurrentMediaTime]);

    useEffect(() => {
        if (seekRequest !== null) {
            setGlobalTime(seekRequest);
            
            if (videoRef.current) {
                const vidDuration = videoRef.current.duration || 1;
                const newVidTime = seekRequest % vidDuration;
                videoRef.current.currentTime = newVidTime;
                lastVideoTimeRef.current = newVidTime;
                
                setIsPlaying(true);
                videoRef.current.play().catch(() => {});
            }
            clearSeekRequest();
        }
    }, [seekRequest, clearSeekRequest]);

    const handleTimeUpdate = () => {
        if (!videoRef.current || isScrubbingRef.current || !isPlaying) return;
        
        const currentVideoTime = videoRef.current.currentTime;
        let delta = currentVideoTime - lastVideoTimeRef.current;
        
        if (delta < -1) {
            delta = currentVideoTime; 
        }
        
        if (delta > 0) {
            setGlobalTime(prev => {
                const next = prev + delta;
                if (next >= displayDuration) {
                    setIsPlaying(false);
                    videoRef.current?.pause();
                    return displayDuration;
                }
                return next;
            });
        }
        lastVideoTimeRef.current = currentVideoTime;
    };

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
        } else {
            if (globalTime >= displayDuration) {
                setGlobalTime(0);
                if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    lastVideoTimeRef.current = 0;
                }
            }
            setIsPlaying(true);
            if (videoRef.current) {
                lastVideoTimeRef.current = videoRef.current.currentTime;
                videoRef.current.play().catch(() => {});
            }
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isScrubbingRef.current = true;
        const newTime = Number(e.target.value);
        setGlobalTime(newTime);
        
        if (videoRef.current) {
            const vidDuration = videoRef.current.duration || 1;
            const newVidTime = newTime % vidDuration;
            videoRef.current.currentTime = newVidTime;
            lastVideoTimeRef.current = newVidTime;
        }
    };
    
    const handleScrubEnd = () => {
        isScrubbingRef.current = false;
        if (videoRef.current && isPlaying) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            videoRef.current.play().catch(() => {});
        }
    };
    
    const defaultVideoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

    return (
        <Card className="p-4 bg-background flex flex-col gap-3 shrink-0">
            <video
                ref={videoRef}
                src={mediaUrl || defaultVideoUrl}
                loop
                playsInline
                className="w-full h-auto max-h-[40vh] aspect-video rounded-md bg-black object-cover cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
            />
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay} 
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors shrink-0"
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
                
                <div className="text-sm font-medium text-muted-foreground shrink-0 w-12 text-center">
                    {formatTime(globalTime)}
                </div>
                
                <input 
                    type="range" 
                    min={0} 
                    max={displayDuration} 
                    value={globalTime} 
                    onChange={handleScrubChange}
                    onMouseUp={handleScrubEnd}
                    onTouchEnd={handleScrubEnd}
                    className="flex-1 cursor-pointer accent-primary"
                />
                
                <div className="text-sm font-medium text-muted-foreground shrink-0 w-12 text-center">
                    {formatTime(displayDuration)}
                </div>
            </div>
        </Card>
    );
}