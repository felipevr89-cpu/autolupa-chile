import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { brands as catalogBrands, getModelsByBrand } from '../data/brands';
import { cropListingPhoto, prepareListingPhoto } from '../lib/listingImages';
import { verificationErrorMessage } from '../lib/authVerification';
import { createUsedListing } from '../lib/usedListings';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
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
  onSignInAnonymous: () => Promise<void>;
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

const DRAFT_STORAGE_KEY = 'autolupa_listing_draft';
const inputClassName = 'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm';

type PersistedDraft = Omit<UsedListingDraft, 'photos'>;

function loadPersistedDraft(): { draft?: PersistedDraft; step?: number } {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { draft?: PersistedDraft; step?: number };
    if (!parsed?.draft || typeof parsed.draft !== 'object') return {};
    return { draft: parsed.draft, step: parsed.step === 4 ? 4 : undefined };
  } catch {
    return {};
  }
}

export function PublicarAuto({ user, isCloudAuthAvailable, onSignIn, onSignInAnonymous }: Props) {
  const persistedRef = useRef<{ draft?: PersistedDraft; step?: number } | null>(null);
  if (persistedRef.current === null) persistedRef.current = loadPersistedDraft();
  const persisted = persistedRef.current;
  const [step, setStep] = useState(persisted.step ?? 1);
  const [draft, setDraft] = useState<UsedListingDraft>(() => ({
    ...initialDraft,
    ...(persisted.draft ?? {}),
  }));
  const [errors, setErrors] = useState<UsedListingValidationErrors>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [guestFlow, setGuestFlow] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropNatural, setCropNatural] = useState<{ width: number; height: number } | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropMinScale, setCropMinScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [cropBusy, setCropBusy] = useState(false);
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const cropDragRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const previewUrls = useRef<string[]>([]);

  const restoredDraft = Boolean(persisted.draft);
  const catalogBrand = catalogBrands.find((brand) => brand.toLowerCase() === draft.brand.trim().toLowerCase());
  const modelOptions = catalogBrand ? getModelsByBrand(catalogBrand) : [];
  const yearOptions = Array.from({ length: 26 }, (_, index) => currentYear + 1 - index);
  const emailVerified = user?.emailVerified ?? Boolean(user?.email);
  const mustVerifyEmail = !emailVerified;

  useEffect(() => {
    const restorable: PersistedDraft = {
      brand: draft.brand,
      model: draft.model,
      year: draft.year,
      price: draft.price,
      mileage: draft.mileage,
      fuel: draft.fuel,
      transmission: draft.transmission,
      color: draft.color,
      region: draft.region,
      commune: draft.commune,
      description: draft.description,
      contactName: draft.contactName,
      contactPhone: draft.contactPhone,
      contactEmail: draft.contactEmail,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ draft: restorable, step }));
    } catch {
      return;
    }
  }, [draft, step]);

  useEffect(() => {
    const client = supabase;
    if (!verificationSent || !client || user?.email) return undefined;
    const interval = window.setInterval(() => {
      client.auth.getUser().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [verificationSent, user?.email]);

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

  const addPhotos = async (files: File[]) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const selected = files.filter((file) => allowed.includes(file.type));
    if (selected.length === 0) {
      if (files.length > 0) setSubmitError('Usa fotos en formato JPG, PNG o WebP.');
      return;
    }
    const room = MAX_LISTING_PHOTOS - draft.photos.length;
    if (room <= 0) return;
    setProcessingPhotos(true);
    setSubmitError('');
    try {
      const prepared = await Promise.all(selected.slice(0, room).map(prepareListingPhoto));
      setPhotos([...draft.photos, ...prepared].slice(0, MAX_LISTING_PHOTOS));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos procesar las fotos.');
    } finally {
      setProcessingPhotos(false);
    }
  };

  const handlePhotoSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    await addPhotos(files);
  };

  const handlePhotoDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    await addPhotos(Array.from(event.dataTransfer.files ?? []));
  };

  const removePhoto = (index: number) => {
    setPhotos(draft.photos.filter((_, photoIndex) => photoIndex !== index));
  };

  useEffect(() => {
    const frame = cropFrameRef.current;
    if (cropIndex === null || !cropNatural || !frame) return;
    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    if (!frameWidth || !frameHeight) return;
    const cover = Math.max(frameWidth / cropNatural.width, frameHeight / cropNatural.height);
    setCropMinScale(cover);
    setCropScale(cover);
    setCropPos({
      x: (frameWidth - cropNatural.width * cover) / 2,
      y: (frameHeight - cropNatural.height * cover) / 2,
    });
  }, [cropIndex, cropNatural]);

  const clampCropPos = (x: number, y: number) => {
    const frame = cropFrameRef.current;
    if (!frame || !cropNatural) return { x, y };
    const minX = Math.min(0, frame.clientWidth - cropNatural.width * cropScale);
    const minY = Math.min(0, frame.clientHeight - cropNatural.height * cropScale);
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
  };

  const openCrop = (index: number) => {
    const source = draft.photos[index];
    const preview = photoPreviews[index];
    if (!source || !preview) return;
    const image = new Image();
    image.onload = () => {
      setCropIndex(index);
      setCropNatural({ width: image.width, height: image.height });
    };
    image.onerror = () => setSubmitError('No pudimos leer esa imagen.');
    image.src = preview;
  };

  const closeCrop = () => {
    cropDragRef.current = null;
    setCropIndex(null);
    setCropNatural(null);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropNatural) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    cropDragRef.current = { pointerX: event.clientX, pointerY: event.clientY, x: cropPos.x, y: cropPos.y };
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag) return;
    setCropPos(clampCropPos(drag.x + (event.clientX - drag.pointerX), drag.y + (event.clientY - drag.pointerY)));
  };

  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cropDragRef.current && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cropDragRef.current = null;
  };

  const handleCropZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setCropScale(next);
    const frame = cropFrameRef.current;
    if (!frame || !cropNatural) return;
    setCropPos({
      x: Math.min(0, Math.max(Math.min(0, frame.clientWidth - cropNatural.width * next), cropPos.x)),
      y: Math.min(0, Math.max(Math.min(0, frame.clientHeight - cropNatural.height * next), cropPos.y)),
    });
  };

  const applyCrop = async () => {
    const frame = cropFrameRef.current;
    const targetIndex = cropIndex;
    const source = targetIndex === null ? undefined : draft.photos[targetIndex];
    if (!frame || targetIndex === null || !source || !cropNatural) return;
    setCropBusy(true);
    setSubmitError('');
    try {
      const cropped = await cropListingPhoto(source, {
        x: -cropPos.x / cropScale,
        y: -cropPos.y / cropScale,
        width: frame.clientWidth / cropScale,
        height: frame.clientHeight / cropScale,
      });
      const next = [...draft.photos];
      next[targetIndex] = cropped;
      setPhotos(next);
      closeCrop();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos recortar la imagen.');
    } finally {
      setCropBusy(false);
    }
  };

  const sendVerificationEmail = async () => {
    if (!supabase) {
      setSubmitError('El backend no está disponible.');
      return;
    }
    setSendingVerification(true);
    setSubmitError('');
    try {
      const { error } = await supabase.auth.updateUser(
        { email: draft.contactEmail.trim().toLowerCase() },
        { emailRedirectTo: `${window.location.origin}/publicar-auto` },
      );
      if (error) throw error;
      setGuestFlow(true);
      setVerificationSent(true);
    } catch (error) {
      setSubmitError(verificationErrorMessage(error, 'No pudimos enviar el correo de confirmación'));
    } finally {
      setSendingVerification(false);
    }
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

    if (mustVerifyEmail) {
      if (!draft.contactEmail.trim()) {
        setErrors({ contactEmail: 'Para publicar sin cuenta necesitamos un correo válido.' });
        setStep(3);
        return;
      }
      if (!verificationSent) {
        await sendVerificationEmail();
        return;
      }
      setSubmitError('Tu correo todavía no está confirmado. Haz clic en el enlace que te enviamos y vuelve a esta pestaña.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const finalDraft = guestFlow && user?.email ? { ...draft, contactEmail: user.email } : draft;
    try {
      await createUsedListing(finalDraft);
      clearPhotos();
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSubmitted(true);
      track('Publish');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Publica tu auto sin crear cuenta</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sin registro ni comisión. Solo pedimos un correo para confirmar que eres real: lo revisamos, tu aviso entra
            en revisión y aparece en la web cuando lo aprobamos.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await onSignInAnonymous();
                } catch {
                  setSubmitError('No pudimos iniciar la publicación.');
                }
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
            >
              Publicar sin crear cuenta
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await onSignIn();
                } catch {
                  setSubmitError('No pudimos iniciar sesión.');
                }
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Continuar con Google
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
            Publicar sin cuenta deja una sesión temporal en este navegador para que puedas editar o retirar tu aviso.
          </p>
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

      {restoredDraft && step > 1 && draft.photos.length === 0 && (
        <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 text-sm text-blue-800 dark:text-blue-200">
          Retomamos tu publicación donde la dejaste. Las fotos no se guardan en este navegador: revisa el paso 2 y
          vuelve a elegirlas si las perdiste.
        </div>
      )}

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
              <Field label="Marca" error={errors.brand}>
                <input list="publish-brands" value={draft.brand} onChange={(event) => updateDraft('brand', event.target.value)} className={inputClassName} placeholder="Ej: Toyota" />
                <datalist id="publish-brands">{catalogBrands.map((brand) => <option key={brand} value={brand} />)}</datalist>
              </Field>
              <Field label="Modelo" error={errors.model}>
                <input list="publish-models" value={draft.model} onChange={(event) => updateDraft('model', event.target.value)} className={inputClassName} placeholder="Ej: Corolla" />
                <datalist id="publish-models">{modelOptions.map((model) => <option key={model} value={model} />)}</datalist>
              </Field>
              <Field label="Año" error={errors.year}>
                <input list="publish-years" type="number" value={draft.year} onChange={(event) => updateDraft('year', Number(event.target.value))} className={inputClassName} min={1900} max={currentYear + 1} />
                <datalist id="publish-years">{yearOptions.map((year) => <option key={year} value={year} />)}</datalist>
              </Field>
              <Field label="Color"><input value={draft.color} onChange={(event) => updateDraft('color', event.target.value)} className={inputClassName} placeholder="Ej: Blanco" /></Field>
              <Field label="Combustible"><select value={draft.fuel} onChange={(event) => updateDraft('fuel', event.target.value as UsedListingDraft['fuel'])} className={inputClassName}>{USED_FUEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Transmisión"><select value={draft.transmission} onChange={(event) => updateDraft('transmission', event.target.value as UsedListingDraft['transmission'])} className={inputClassName}>{USED_TRANSMISSION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fotos del vehículo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Sube entre 1 y {MAX_LISTING_PHOTOS} fotos reales. La primera será la portada.</p>

            <details className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
                📐 Guía rápida de fotos (2 minutos)
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>Portada:</strong> 3/4 delantero a la altura del capó, con el auto completo dentro del encuadre y sin usar zoom digital.</li>
                <li><strong>Luz:</strong> a la sombra o con el sol de frente. Evita el contraluz y el flash de noche: apaga los reflejos limpiando los cristales.</li>
                <li><strong>Interior:</strong> tablero con los kilómetros legibles, butacas y estado general de las puertas.</li>
                <li><strong>Mecánica y papeles:</strong> motor, llantas y, si hay golpes o arañazos, sácalos igual: la transparencia evita idas y vueltas.</li>
                <li><strong>Detalle:</strong> permiso de circulación y factura con tus datos tapados antes de publicar.</li>
                <li><strong>Formato:</strong> horizontal si es posible. Las fotos se recortan y comprimen automáticamente a 1.800 px; nada de capturas de pantalla.</li>
              </ul>
            </details>
            <label
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handlePhotoDrop}
              className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/20'}`}
            >
              <span className="text-4xl block mb-3">📷</span>
              <span className="block text-sm font-semibold text-blue-700 dark:text-blue-300">{dragActive ? 'Suelta aquí tus fotos' : 'Elegir o arrastrar fotos'}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Arrastra las imágenes o haz clic para buscarlas. JPG, PNG o WebP, hasta {MAX_LISTING_PHOTOS}.</span>
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
                    <button type="button" onClick={() => openCrop(index)} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full" aria-label={`Ajustar foto ${index + 1}`}>✂︎ Ajustar</button>
                  </div>
                ))}
              </div>
            )}

            {cropIndex !== null && cropNatural && (
              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Ajusta la foto {cropIndex + 1} · encuadre 4:3</p>
                  <button type="button" onClick={closeCrop} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">Cancelar</button>
                </div>
                <div
                  ref={cropFrameRef}
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerUp}
                  onPointerCancel={handleCropPointerUp}
                  className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-900 touch-none select-none cursor-move"
                  role="img"
                  aria-label={`Encuadre de la foto ${cropIndex + 1}`}
                >
                  <img
                    src={photoPreviews[cropIndex]}
                    alt=""
                    draggable={false}
                    className="absolute max-w-none pointer-events-none"
                    style={{ left: cropPos.x, top: cropPos.y, width: cropNatural.width * cropScale, height: cropNatural.height * cropScale }}
                  />
                </div>
                <label className="flex items-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
                  <span>Zoom</span>
                  <input
                    type="range"
                    min={cropMinScale}
                    max={cropMinScale * 3}
                    step={0.01}
                    value={cropScale}
                    onChange={handleCropZoom}
                    className="flex-1"
                    aria-label="Zoom del recorte"
                  />
                </label>
                <button type="button" onClick={applyCrop} disabled={cropBusy} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {cropBusy ? 'Aplicando…' : 'Aplicar recorte'}
                </button>
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
              <Field label={mustVerifyEmail ? 'Correo (lo verificamos)' : 'Correo (opcional)'} error={errors.contactEmail}>
                <input
                  type="email"
                  value={draft.contactEmail}
                  onChange={(event) => updateDraft('contactEmail', event.target.value)}
                  className={inputClassName}
                  placeholder="nombre@correo.cl"
                />
                {mustVerifyEmail && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Te enviaremos un enlace de confirmación a este correo antes de publicar.
                  </span>
                )}
              </Field>
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

            {mustVerifyEmail && (
              <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4" role="status">
                {verificationSent ? (
                  <>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Confirma tu correo para publicar
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                      Enviamos un enlace de confirmación a <strong>{draft.contactEmail}</strong>. Ábrelo y esta pestaña
                      se actualizará sola. Mientras tanto, todo lo que cargaste queda guardado.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => supabase?.auth.getUser().catch(() => undefined)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700"
                      >
                        Ya confirmé, comprobar
                      </button>
                      <button
                        type="button"
                        onClick={sendVerificationEmail}
                        disabled={sendingVerification}
                        className="px-4 py-2 border border-amber-400 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {sendingVerification ? 'Enviando…' : 'Reenviar correo'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Para publicar sin cuenta validamos tu correo: en el último paso te enviamos un enlace de
                    confirmación a <strong>{draft.contactEmail || 'tu correo'}</strong>.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {submitError && <p role="alert" className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">{submitError}</p>}

        <div className="flex justify-between gap-3 mt-8">
          <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || submitting} className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40">Atrás</button>
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Continuar</button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting || sendingVerification}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : sendingVerification ? 'Enviando enlace…' : mustVerifyEmail && verificationSent ? 'Confirmar correo y enviar' : 'Enviar para revisión'}
            </button>
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
