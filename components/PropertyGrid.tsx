import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, User } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  location: string;
  price_per_month: number;
  total_capacity?: number;
  number_of_rooms?: number;
  image_url: string | null;
}

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-fade-in-up">
      {properties.map((property) => (
        <Link 
          href={`/properties/${property.id}`} 
          key={property.id}
          className="group block bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1"
        >
          {/* Image */}
          <div className="relative h-48 w-full overflow-hidden">
            {property.image_url ? (
                <Image 
                    src={property.image_url} 
                    alt={property.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      console.warn(`Failed to load image for property ${property.id}`);
                    }}
                />
            ) : (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-4xl">🏠</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
            
            {property.number_of_rooms !== undefined && (
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-xs font-bold text-white flex items-center">
                <Bed size={12} className="mr-1 text-indigo-400" /> {property.number_of_rooms} Room{property.number_of_rooms !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-indigo-400 transition">
                    {property.title}
                </h3>
             </div>
             
             <p className="text-gray-400 text-sm flex items-center mb-4">
                <MapPin size={14} className="mr-1 text-gray-500" />
                <span className="truncate">{property.location}</span>
             </p>

             <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                <div className="text-xs text-gray-500 font-medium bg-gray-800 px-2 py-1 rounded">
                    Student Friendly
                </div>
                <div className="text-emerald-400 font-bold">
                    RM {property.total_capacity ? (property.price_per_month / property.total_capacity).toFixed(2) : property.price_per_month} <span className="text-xs text-gray-500 font-normal">/person</span>
                </div>
             </div>
          </div>
        </Link>
      ))}
    </div>
  );
}