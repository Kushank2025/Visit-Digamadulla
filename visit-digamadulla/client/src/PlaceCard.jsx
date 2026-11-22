import React from 'react';

export default function PlaceCard({ loc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-slate-100 flex flex-col justify-between">
      {/* 3 Photos Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <img 
          src={loc.image_url1} 
          alt={`${loc.name} 1`} 
          className="h-24 w-full object-cover rounded-lg bg-slate-100"
          onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+1'; }}
        />
        <img 
          src={loc.image_url2} 
          alt={`${loc.name} 2`} 
          className="h-24 w-full object-cover rounded-lg bg-slate-100"
          onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+2'; }}
        />
        <img 
          src={loc.image_url3} 
          alt={`${loc.name} 3`} 
          className="h-24 w-full object-cover rounded-lg bg-slate-100"
          onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=Photo+3'; }}
        />
      </div>

      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-base text-slate-800">{loc.name}</h3>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">
            {loc.distance_from_ampara || loc.distance_km} km
          </span>
        </div>

        <span className="text-xs text-amber-600 font-semibold block mb-2">
          {loc.category_label || loc.category_name}
        </span>

        <p className="text-sm text-slate-600 line-clamp-2">
          {loc.description}
        </p>
      </div>
    </div>
  );
}