import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingSystemProps {
  rating: number;
  onRating?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  "data-testid"?: string;
}

export default function RatingSystem({ 
  rating, 
  onRating, 
  size = "md", 
  readonly = false,
  "data-testid": dataTestId
}: RatingSystemProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRating) {
      onRating(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-0.5" data-testid={dataTestId}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={cn(
            "transition-colors duration-150",
            !readonly && "hover:scale-110 active:scale-95",
            readonly ? "cursor-default" : "cursor-pointer"
          )}
          data-testid={`star-${star}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-all duration-150",
              star <= rating 
                ? "fill-amber-400 text-amber-400" 
                : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}