// Renders the HTML5 media player and synchronizes play state with the global Zustand store.

"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";

interface MediaPlayerProps {
    mediaUrl?: string | null;
}

export function MediaPlayer({ mediaUrl }: MediaPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { setCurrentMediaTime, seekRequest, clearSeekRequest } = useAppStore();

    const defaultAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Placeholder for testing

    useEffect(() => {
        if (seekRequest !== null && audioRef.current) {
            audioRef.current.currentTime = seekRequest;
            audioRef.current.play().catch(() => {
                console.log("Autoplay prevented by browser.");
            });
            clearSeekRequest();
        }
    }, [seekRequest, clearSeekRequest]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentMediaTime(audioRef.current.currentTime);
        }
    };

    return (
        <Card className="p-4 bg-background">
            <audio
                ref={audioRef}
                src={mediaUrl || defaultAudio}
                controls
                className="w-full h-12"
                onTimeUpdate={handleTimeUpdate}
            />
        </Card>
    );
}