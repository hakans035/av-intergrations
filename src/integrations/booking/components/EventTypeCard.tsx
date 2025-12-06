'use client';

import Link from 'next/link';
import { Clock, MapPin, Users, Video, Euro } from 'lucide-react';
import type { EventType } from '../types';
import { formatPrice } from '../lib/stripe';

interface EventTypeCardProps {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  const locationIcon = {
    online: <Video className="w-4 h-4" />,
    on_location: <MapPin className="w-4 h-4" />,
    hybrid: <MapPin className="w-4 h-4" />,
  };

  const locationText = {
    online: 'Online via Microsoft Teams',
    on_location: eventType.location_address || 'Op locatie',
    hybrid: 'Online of op locatie',
  };

  return (
    <Link
      href={`/booking/${eventType.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {eventType.title}
        </h3>

        {eventType.description && (
          <p className="text-gray-600 mb-4 flex-grow">
            {eventType.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{eventType.duration_minutes} minuten</span>
          </div>

          <div className="flex items-center gap-2">
            {locationIcon[eventType.location_type]}
            <span>{locationText[eventType.location_type]}</span>
          </div>

          {eventType.max_attendees > 1 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Max {eventType.max_attendees} deelnemers</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
            <Euro className="w-4 h-4" />
            {eventType.price_cents > 0 ? (
              <span className="font-medium text-gray-900">
                {formatPrice(eventType.price_cents)}
                {eventType.deposit_percent < 100 && (
                  <span className="text-gray-500 font-normal">
                    {' '}({eventType.deposit_percent}% aanbetaling)
                  </span>
                )}
              </span>
            ) : (
              <span className="font-medium text-green-600">Gratis</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
