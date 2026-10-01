import { Link } from 'react-router-dom';
import { formatPrice } from '../../data/brands';
import { USED_FUEL_OPTIONS, USED_TRANSMISSION_OPTIONS, type UsedListing, usedListingWhatsappUrl } from '../../data/usedListings';
import { toSavedListing } from '../../lib/savedListings';
import { SaveListingButton } from './SaveListingButton';

interface Props {
  listing: UsedListing;
}

function fuelLabel(value: string): string {
  return USED_FUEL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function transmissionLabel(value: string): string {
  return USED_TRANSMISSION_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function UsedListingCard({ listing }: Props) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden card-shadow hover:shadow-xl transition-all">
      <Link to={`/usados/${listing.slug}`} className="block group">
        <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {listing.photoUrls[0] ? (
            <img
              src={listing.photoUrls[0]}
              alt={`${listing.brand} ${listing.model} ${listing.year}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🚗</div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{listing.brand}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              <Link to={`/usados/${listing.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                {listing.model}
              </Link>
            </h2>
          </div>
          <div className="flex items-start gap-2 shrink-0">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {listing.year}
            </span>
            <SaveListingButton listing={toSavedListing(listing)} compact />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {fuelLabel(listing.fuel)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {transmissionLabel(listing.transmission)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {listing.mileage.toLocaleString('es-CL')} km
          </span>
        </div>
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Precio</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(listing.price)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">📍 {listing.commune ? `${listing.commune}, ` : ''}{listing.region}</p>
          </div>
          <a
            href={usedListingWhatsappUrl(listing)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Contactar
          </a>
        </div>
      </div>
    </article>
  );
}
