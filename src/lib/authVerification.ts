import { supabase } from './supabase';

export const VERIFICATION_RATE_LIMIT_MESSAGE =
  'Alcanzaste el límite de 2 correos por hora. Espera unos minutos y vuelve a intentarlo.';

export function isVerificationRateLimit(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: string }).code ?? '';
  return code === 'over_email_send_rate_limit' || /rate.?limit/i.test(`${code} ${error.message}`);
}

export function verificationErrorMessage(error: unknown, fallback: string): string {
  if (isVerificationRateLimit(error)) return VERIFICATION_RATE_LIMIT_MESSAGE;
  if (error instanceof Error && error.message) return `${fallback}: ${error.message}`;
  return `${fallback}.`;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  if (!supabase) throw new Error('La verificación de correo no está disponible ahora mismo.');
  const { error } = await supabase.auth.resend({
    type: 'email_change',
    email,
    options: { emailRedirectTo: `${window.location.origin}/publicar-auto` },
  });
  if (error) throw error;
}
