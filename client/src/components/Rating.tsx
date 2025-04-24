import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  text?: string;
}

const Rating = ({ value, text }: RatingProps) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={`h-5 w-5 ${
            value >= rating
              ? "text-yellow-400 fill-current"
              : value >= rating - 0.5
              ? "text-yellow-400 fill-current"
              : "text-yellow-400 fill-none"
          }`}
        />
      ))}
      {text && <span className="ml-1 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default Rating;
