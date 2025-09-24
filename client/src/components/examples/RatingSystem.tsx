import RatingSystem from '../RatingSystem';

export default function RatingSystemExample() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Interactive Rating (Medium)</h3>
        <RatingSystem 
          rating={3.5} 
          onRating={(rating) => console.log('New rating:', rating)} 
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Readonly Rating (Small)</h3>
        <RatingSystem 
          rating={4.8} 
          size="sm"
          readonly
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Large Interactive Rating</h3>
        <RatingSystem 
          rating={2} 
          size="lg"
          onRating={(rating) => console.log('Large rating:', rating)} 
        />
      </div>
    </div>
  );
}