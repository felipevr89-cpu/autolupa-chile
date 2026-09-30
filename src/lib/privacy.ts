import { supabase, isSupabaseConfigured } from './supabase';

export interface PersonalDataExport {
  generadoEn: string;
  responsable: string;
  cuenta: Record<string, unknown>;
  avisos: Array<Record<string, unknown>>;
  preferencias: Record<string, unknown> | null;
  firmas: Array<Record<string, unknown>>;
  reportesEnviados: Array<Record<string, unknown>>;
}

async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select(columns);
  if (error || !data) return [];
  return data as T[];
}

export async function exportPersonalData(userId: string): Promise<PersonalDataExport> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('El backend no está disponible.');
  }

  const [profile, listings, preferences, signatures, reports] = await Promise.all([
    fetchAll<Record<string, unknown>>('profiles', 'display_name,avatar_url,created_at,updated_at'),
    fetchAll<Record<string, unknown>>(
      'used_listings',
      'id,slug,status,brand,model,year,price_clp,mileage_km,fuel,transmission,color,region,commune,description,contact_name,contact_phone,contact_email,photo_paths,moderation_note,published_at,expires_at,created_at,updated_at',
    ),
    supabase
      .from('user_preferences')
      .select('favorite_car_ids,updated_at')
      .maybeSingle()
      .then(({ data }) => data as Record<string, unknown> | null),
    fetchAll<Record<string, unknown>>('document_signatures', 'document_type,document_version,signed_at'),
    fetchAll<Record<string, unknown>>('listing_reports', 'id,listing_id,reason,status,created_at'),
  ]);

  return {
    generadoEn: new Date().toISOString(),
    responsable: 'AutoLupa — privacidad@autolupa.cl',
    cuenta: {
      id: userId,
      ...(profile[0] ?? {}),
    },
    avisos: listings,
    preferencias: preferences,
    firmas: signatures,
    reportesEnviados: reports,
  };
}

export function downloadJson(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function deletePersonalAccount(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('El backend no está disponible.');
  }

  await removeUserPhotos(userId);

  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message || 'No pudimos eliminar tu cuenta.');

  await supabase.auth.signOut();
}

async function removeUserPhotos(userId: string): Promise<void> {
  const bucket = supabase?.storage.from('listing-photos');
  if (!bucket) return;

  const { data: listingFolders } = await bucket.list(userId, { limit: 100 });
  if (!listingFolders) return;

  for (const folder of listingFolders) {
    if (!folder.name) continue;
    const prefix = `${userId}/${folder.name}`;
    const { data: files } = await bucket.list(prefix, { limit: 100 });
    if (!files?.length) continue;
    await bucket.remove(files.filter((f) => f.name).map((f) => `${prefix}/${f.name}`));
  }
}
