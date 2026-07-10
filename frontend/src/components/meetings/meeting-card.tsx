// Renders an individual meeting card displaying its metadata and participants.

import Link from "next/link";
import { format } from "date-fns";
import { Clock, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    id: string;
    name: string;
    avatar_url: string | null;
}

interface Tag {
    id: string;
    name: string;
}

interface MeetingCardProps {
    id: string;
    title: string;
    date: string;
    duration: number;
    participants: User[];
    tags: Tag[];
}

export function MeetingCard({ id, title, date, duration, participants, tags }: MeetingCardProps) {
    const formattedDate = format(new Date(date), "MMM d, yyyy");
    const durationMinutes = Math.round(duration / 60);

    return (
        <Link href={`/meeting/${id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground space-x-4 mt-2">
                        <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {durationMinutes} min
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                    <div className="flex flex-wrap gap-1 mb-4">
                        {tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 mt-auto pt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{participants.length} Participant{participants.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex -space-x-2">
                        {participants.slice(0, 3).map((p) => (
                            <Avatar key={p.id} className="w-6 h-6 border-2 border-background">
                                {p.avatar_url ? (
                                    <AvatarImage src={p.avatar_url} alt={p.name} />
                                ) : (
                                    <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
                                )}
                            </Avatar>
                        ))}
                        {participants.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background z-10 font-medium">
                                +{participants.length - 3}
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}