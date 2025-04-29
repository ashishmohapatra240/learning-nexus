import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "As a corporate learning manager, finding qualified L&D specialists used to be a time-consuming process. L&D Nexus has streamlined our hiring process and helped us find perfect matches for our training initiatives. The quality of professionals on this platform is outstanding.",
    name: "David Chen",
    position: "Learning Manager, Enterprise Solutions Inc.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    id: 2,
    content: "L&D Nexus has transformed my consulting business. The platform's focus on learning and development has connected me with clients who truly value my expertise. The resource hub has been invaluable for my professional development, and the secure payment system gives me peace of mind.",
    name: "Maria Rodriguez",
    position: "Independent L&D Consultant",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-4">What Our Users Say</h2>
        <p className="text-white text-opacity-80 text-center max-w-2xl mx-auto mb-12">
          Hear from L&D professionals and companies who have connected through our platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`${i < testimonial.rating ? "text-yellow-400" : "text-gray-400"} h-5 w-5 fill-current`}
                  />
                ))}
              </div>
              <p className="italic mb-6 text-white text-opacity-90">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div className="ml-4">
                  <h4 className="font-heading font-medium">{testimonial.name}</h4>
                  <p className="text-white text-opacity-80 text-sm">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
