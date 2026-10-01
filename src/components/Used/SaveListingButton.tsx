import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import {
  SavedListing,
  toggleSavedListing,
  useIsListingSaved,
} from '../../lib/savedListings';

interface Props {
  listing: SavedListing;
  compact?: boolean;
  className?: string;
}

export function SaveListingButton({ listing, compact = false, className = '' }: Props) {
  const saved = useIsListingSaved(listing.id);
  const label = saved ? `Quitar ${listing.title} de guardados` : `Guardar ${listing.title} para ver su precio`;

  return (
    <button
      type="button"
      onClick={() => toggleSavedListing(listing)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
        saved
          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-400'
      } ${className}`}
    >
      {saved ? (
        <BookmarkSolidIcon className="w-4 h-4" aria-hidden="true" />
      ) : (
        <BookmarkIcon className="w-4 h-4" aria-hidden="true" />
      )}
      {!compact && (
        <span className="text-xs font-medium">{saved ? 'Guardado' : 'Guardar'}</span>
      )}
    </button>
  );
}
