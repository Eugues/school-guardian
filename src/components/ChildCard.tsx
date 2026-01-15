import { Child } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, School } from 'lucide-react';

interface ChildCardProps {
  child: Child;
  selected?: boolean;
  onClick?: () => void;
}

export function ChildCard({ child, selected, onClick }: ChildCardProps) {
  const initials = child.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
        selected
          ? 'ring-2 ring-primary border-primary bg-primary/5'
          : 'hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 bg-gradient-to-br from-primary to-secondary text-white">
            <AvatarFallback className="bg-transparent text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{child.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {child.grade && (
                <Badge variant="secondary" className="text-xs">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {child.grade}
                </Badge>
              )}
              {child.school_name && (
                <Badge variant="outline" className="text-xs">
                  <School className="w-3 h-3 mr-1" />
                  {child.school_name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
