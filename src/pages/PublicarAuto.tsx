import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { prepareListingPhoto } from '../lib/listingImages';
import { createUsedListing } from '../lib/usedListings';
import {
  MAX_LISTING_PHOTOS,
  USED_FUEL_OPTIONS,
  USED_LISTING_TERMS_VERSION,
  USED_REGIONS,
  USED_TRANSMISSION_OPTIONS,
  type UsedListingDraft,
  type UsedListingValidationErrors,
  validateUsedListingDraft,
} from '../data/usedListings';
import type { User } from '../types';

interface Props {
  user: User | null;
  isCloudAuthAvailable: boolean;
  onSignIn: () => Promise<void>;
}

const currentYear = new Date().getFullYear();
const initialDraft: UsedListingDraft = {
  brand: '',
  model: '',
  year: currentYear,
  price: 0,
  mileage: 0,
  fuel: 'gasolina',
  transmission: 'automatica',
  color: '',
  region: 'Metropolitana',
  commune: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  photos: [],
};

const inputClassName = 'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';

export function PublicarAuto({ user, isCloudAuthAvailable, onSignIn }: Props) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<UsedListingDraft>(initialDraft);
  const [errors, setErrors] = useState<UsedListingValidationErrors>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const updateDraft = <K extends keyof UsedListingDraft>(key: K, value: UsedListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setPhotos = (photos: File[]) => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const previews = photos.map((photo) => URL.createObjectURL(photo));
    previewUrls.current = previews;
    setPhotoPreviews(previews);
    updateDraft('photos', photos);
  };

  const clearPhotos = () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = [];
    setPhotoPreviews([]);
    updateDraft('photos', []);
  };

  const validateStep = (currentStep: number) => {
    const fullErrors = validateUsedListingDraft(draft);
    if (currentStep === 1) {
      const fields: Array<keyof UsedListingValidationErrors> = ['brand', 'model', 'year', 'color'];
      return Object.fromEntries(fields.filter((field) => fullErrors[field]).map((field) => [field, fullErrors[field]]));
    }
    if (currentStep === 2) {
      return fullErrors.photos ? { photos: fullErrors.photos } : {};
    }
    if (currentStep === 3) {
      const fields: Array<keyof UsedListingValidationErrors> = ['price', 'mileage', 'region', 'commune', 'description', 'contactName', 'contactPhone', 'contactEmail'];
      return Object.fromEntries(fields.filter((field) => fullErrors[field]).map((field) => [field, fullErrors[field]]));
    }
    return fullErrors;
  };

  const nextStep = () => {
    const nextErrors = validateStep(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep((current) => Math.min(4, current + 1));
  };

  const handlePhotoSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_LISTING_PHOTOS - draft.photos.length);
    if (files.length === 0) return;
    setProcessingPhotos(true);
    setSubmitError('');
    try {
      const prepared = await Promise.all(files.map(prepareListingPhoto));
      setPhotos([...draft.photos, ...prepared].slice(0, MAX_LISTING_PHOTOS));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos procesar las fotos.');
    } finally {
      setProcessingPhotos(false);
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(draft.photos.filter((_, photoIndex) => photoIndex !== index));
  };

  const submit = async () => {
    const validationErrors = validateUsedListingDraft(draft);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.brand || validationErrors.model || validationErrors.year) setStep(1);
      else if (validationErrors.photos) setStep(2);
      else setStep(3);
      return;
    }
    if (!acceptedTerms) {
      setSubmitError('Debes aceptar las condiciones del aviso.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await createUsedListing(draft);
      clearPhotos();
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos publicar tu aviso.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCloudAuthAvailable) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <SEO title="Publicar Auto Usado Gratis" description="Publica tu auto usado gratis en AutoLupa." />
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-8 text-center">
          <p className="text-4xl mb-4">🔧</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Publicación de avisos en preparación</h1>
          <p className="text-gray-600 dark:text-gray-300">La publicación segura se habilitará cuando la base de datos y la verificación de vendedores estén conectadas.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <SEO title="Publicar Auto Usado Gratis" description="Publica tu auto usado gratis en AutoLupa." />
        <div className="rounded-2xl bg-white dark:bg-gray-800 card-shadow p-8 text-center">
          <p className="text-5xl mb-4">🔑</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verifica tu cuenta para publicar</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Publicar es gratis. Usamos tu cuenta para proteger a compradores y vendedores.</p>
          <button onClick={() => onSignIn().catch(() => setSubmitError('No pudimos iniciar sesión.'))} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Continuar con Google</button>
          {submitError && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">{submitError}</p>}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <SEO title="Aviso En Revisión" description="Tu aviso de auto usado fue enviado a revisión." />
        <div className="rounded-2xl bg-white dark:bg-gray-800 card-shadow p-8 text-center">
          <p className="text-5xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Tu aviso está en revisión</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Revisaremos que los datos y las fotos sean válidos. El aviso se mostrará públicamente cuando sea aprobado.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/mis-anuncios" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Ver mis avisos</Link>
            <button onClick={() => { clearPhotos(); setDraft(initialDraft); setSubmitted(false); setStep(1); }} className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">Publicar otro</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title="Publicar Auto Usado Gratis" description="Publica tu auto usado gratis en AutoLupa. Sin comisiones y con contacto directo por WhatsApp." />
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Publicación gratuita</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Vende tu auto en AutoLupa</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Te guíamos en 4 pasos. Sin suscripciones ni comisiones.</p>
      </div>

      <ol className="grid grid-cols-4 gap-2 mb-8" aria-label="Pasos de publicación">
        {['Vehículo', 'Fotos', 'Contacto', 'Confirmar'].map((label, index) => {
          const number = index + 1;
          return (
            <li key={label} className={`rounded-xl px-2 py-3 text-center text-xs sm:text-sm font-semibold ${step >= number ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              <span className="block text-base">{number}</span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 card-shadow">
        {step === 1 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Datos del vehículo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Marca" error={errors.brand}><input value={draft.brand} onChange={(event) => updateDraft('brand', event.target.value)} className={inputClassName} placeholder="Ej: Toyota" /></Field>
              <Field label="Modelo" error={errors.model}><input value={draft.model} onChange={(event) => updateDraft('model', event.target.value)} className={inputClassName} placeholder="Ej: Corolla" /></Field>
              <Field label="Año" error={errors.year}><input type="number" value={draft.year} onChange={(event) => updateDraft('year', Number(event.target.value))} className={inputClassName} min={1900} max={currentYear + 1} /></Field>
              <Field label="Color"><input value={draft.color} onChange={(event) => updateDraft('color', event.target.value)} className={inputClassName} placeholder="Ej: Blanco" /></Field>
              <Field label="Combustible"><select value={draft.fuel} onChange={(event) => updateDraft('fuel', event.target.value as UsedListingDraft['fuel'])} className={inputClassName}>{USED_FUEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Transmisión"><select value={draft.transmission} onChange={(event) => updateDraft('transmission', event.target.value as UsedListingDraft['transmission'])} className={inputClassName}>{USED_TRANSMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fotos del vehículo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">Sube entre 1 y {MAX_LISTING_PHOTOS} fotos reales. La primera será la portada.</p>
            <label className="block border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20">
              <span className="text-4xl block mb-3">📷</span>
              <span className="block text-sm font-semibold text-blue-700 dark:text-blue-300">Elegir fotos</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG o WebP. Máximo 5 MB por foto.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelection} className="sr-only" disabled={processingPhotos || draft.photos.length >= MAX_LISTING_PHOTOS} />
            </label>
            {processingPhotos && <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">Optimizando fotos…</p>}
            {errors.photos && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{errors.photos}</p>}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {photoPreviews.map((preview, index) => (
                  <div key={preview} className="relative">
                    <img src={preview} alt={`Foto ${index + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                    {index === 0 && <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">Portada</span>}
                    <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7" aria-label={`Quitar foto ${index + 1}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Precio y contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Precio (CLP)" error={errors.price}><input type="number" min={100000} value={draft.price || ''} onChange={(event) => updateDraft('price', Number(event.target.value))} className={inputClassName} placeholder="8500000" /></Field>
              <Field label="Kilometraje" error={errors.mileage}><input type="number" min={0} value={draft.mileage || ''} onChange={(event) => updateDraft('mileage', Number(event.target.value))} className={inputClassName} placeholder="65000" /></Field>
              <Field label="Región" error={errors.region}><select value={draft.region} onChange={(event) => updateDraft('region', event.target.value)} className={inputClassName}>{USED_REGIONS.map((region) => <option key={region}>{region}</option>)}</select></Field>
              <Field label="Comuna"><input value={draft.commune} onChange={(event) => updateDraft('commune', event.target.value)} className={inputClassName} placeholder="Ej: Las Condes" /></Field>
              <Field label="Tu nombre" error={errors.contactName}><input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} className={inputClassName} placeholder="Nombre visible para compradores" /></Field>
              <Field label="WhatsApp" error={errors.contactPhone}><input value={draft.contactPhone} onChange={(event) => updateDraft('contactPhone', event.target.value)} className={inputClassName} placeholder="+56 9 1234 5678" /></Field>
              <Field label="Correo (opcional)" error={errors.contactEmail}><input type="email" value={draft.contactEmail} onChange={(event) => updateDraft('contactEmail', event.target.value)} className={inputClassName} placeholder="nombre@correo.cl" /></Field>
            </div>
            <div className="mt-4"><Field label="Descripción" error={errors.description}><textarea rows={5} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className={inputClassName} placeholder="Describe estado, mantenciones,/accessorios y motivo de venta." /></Field></div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Revisa y publica</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-5">
              <Summary label="Vehículo" value={`${draft.brand} ${draft.model} ${draft.year}`} />
              <Summary label="Precio" value={`$${draft.price.toLocaleString('es-CL')} CLP`} />
              <Summary label="Kilometraje" value={`${draft.mileage.toLocaleString('es-CL')} km`} />
              <Summary label="Ubicación" value={[draft.commune, draft.region].filter(Boolean).join(', ')} />
              <Summary label="Fotos" value={`${draft.photos.length}`} />
              <Summary label="WhatsApp" value={draft.contactPhone} />
            </dl>
            <label className="mt-5 flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1" />
              <span>Confirmo que los datos y fotos son reales, que vendo el vehículo legítimamente y acepto los <Link to="/terminos" target="_blank" className="text-blue-600 dark:text-blue-400 underline">términos del marketplace v{USED_LISTING_TERMS_VERSION}</Link> y la <Link to="/privacidad" target="_blank" className="text-blue-600 dark:text-blue-400 underline">política de privacidad</Link>.</span>
            </label>
          </section>
        )}

        {submitError && <p role="alert" className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">{submitError}</p>}

        <div className="flex justify-between gap-3 mt-8">
          <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || submitting} className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40">Atrás</button>
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Continuar</button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Enviando…' : 'Enviar para revisión'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600 dark:text-red-400 mt-1">{error}</span>}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt><dd className="font-semibold text-gray-900 dark:text-white">{value}</dd></div>;
}
