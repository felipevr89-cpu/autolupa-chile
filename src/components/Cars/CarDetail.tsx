import { ReactNode, useState } from 'react';
import { Car } from '../../types';
import { formatPrice, getTypeLabel, getFuelLabel, getBrandUrl, isBrandSoldNewInChile } from '../../data/brands';
import { getChargingCost, getCombustionCostPer100, HOME_KWH_CLP, FAST_KWH_CLP } from '../../data/energyCosts';
import { getCarImage } from '../../data/carImages';
import { CarImage } from './CarImage';
import { TCOCalculator } from '../TCO/TCOCalculator';
import { EVHub } from '../EV/EVHub';
import { BuyingGuide } from '../Guides/BuyingGuide';
import { TermTip } from '../Glossary/TermTip';
import { SafetyBanner } from '../Trust/SafetyBanner';
import {
  BoltIcon, WrenchIcon, Battery100Icon, PowerIcon, FireIcon,
  ShieldCheckIcon, CubeIcon, ArrowsRightLeftIcon,
  ArrowUpIcon, CircleStackIcon, StarIcon, ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Props {
  car: Car;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onPrevCar?: () => void;
  onNextCar?: () => void;
  children?: ReactNode;
}

function CarImageSection({ car }: { car: Car }) {
  const img = getCarImage(car.id);
  return (
    <div className="-mx-8 -mt-8 mb-6 overflow-hidden">
      <CarImage
        carId={car.id}
        brand={car.brand}
        model={car.model}
        type={car.type}
        className="w-full h-56"
        eager
      />
      {img?.file && img.attribution && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 px-8 pt-1 text-right">
          Foto: {img.attribution}
          {img.license ? ` · ${img.license}` : ''}
          {img.source && (
            <>
              {' · '}
              <a href={img.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">
                Wikimedia
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function NextSteps({ car }: { car: Car }) {
  const q = encodeURIComponent(`${car.brand} ${car.model} ${car.year} Chile`);
  const nuevosUrl = `https://www.chileautos.cl/vehiculos/?q=${encodeURIComponent(car.brand + ' ' + car.model)}`;
  const usadosUrl = `https://www.google.com/search?q=${encodeURIComponent(car.brand + ' ' + car.model + ' usado Chile')}`;
  const preciosUrl = `https://www.google.com/search?q=${q}+precio`;
  const shareText = `Mira el ${car.brand} ${car.model} ${car.year} (${formatPrice(car.price)}) en AutoLupa`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' — https://autolupa.pages.dev')}`;

  return (
    <div className="mt-8 mb-2 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">¿Te interesa este auto?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Estos son tus próximos pasos para comprarlo o cotizarlo.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={getBrandUrl(car.brand)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <span className="text-xl">🏢</span>
          <span className="text-sm">Cotizar en {car.brand} oficial</span>
        </a>
        <a
          href={nuevosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 transition-colors"
        >
          <span className="text-xl">🔎</span>
          <span className="text-sm">Ver disponibilidad (Chileautos)</span>
        </a>
        <a
          href={usadosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 transition-colors"
        >
          <span className="text-xl">🚗</span>
          <span className="text-sm">Buscar usados</span>
        </a>
        <a
          href={preciosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 transition-colors"
        >
          <span className="text-xl">💲</span>
          <span className="text-sm">Comparar precios reales</span>
        </a>
      </div>
      <a
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 p-2.5 bg-green-500 dark:bg-green-600 text-white rounded-xl font-medium hover:bg-green-600 dark:hover:bg-green-500 transition-colors text-sm"
      >
        <span>💬</span> Compartir por WhatsApp
      </a>
    </div>
  );
}

export function CarDetail({ car, onClose, isFavorite, onToggleFavorite, onPrevCar, onNextCar, children }: Props) {
  const charging = getChargingCost(car);
  const combustionPer100 = getCombustionCostPer100(car);
  const [activeTab, setActiveTab] = useState<'specs' | 'tco' | 'ev' | 'credit' | 'guide'>('specs');

  const isElectrified = car.fuel === 'electrico' || car.fuel === 'hibrido_enchufable';
  const tabs = [
    { id: 'tco', label: 'Costo total (TCO)' },
    ...(isElectrified ? [{ id: 'ev' as const, label: 'Eléctrico' }] : []),
    ...(children ? [{ id: 'credit' as const, label: 'Simulador de crédito' }] : []),
    { id: 'guide', label: 'Guía de compra' },
  ];

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id as typeof activeTab)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 z-10"
          >
            ×
          </button>

          <CarImageSection car={car} />

          {(onPrevCar || onNextCar) && (
            <div className="flex justify-between items-center -mt-3 mb-4 px-2">
              <button
                onClick={onPrevCar}
                disabled={!onPrevCar}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={onNextCar}
                disabled={!onNextCar}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{car.brand}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{car.model}</h2>
            <p className="text-base font-medium text-gray-800 dark:text-gray-200">{car.year} · {getTypeLabel(car.type)} · <TermTip term={car.fuel}>{getFuelLabel(car.fuel)}</TermTip></p>
          </div>

          {!isBrandSoldNewInChile(car.brand) && (
            <div className="mb-4 px-3 py-2 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300">
              <strong>{car.brand}</strong> no se comercializa oficialmente como auto nuevo en Chile; los precios y especificaciones son referenciales de otros mercados.
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {car.safety_ratings?.some(r => r.stars === 5) && (
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800/60 text-green-900 dark:text-green-200 rounded-full text-sm font-semibold flex items-center gap-1">
                🛡️ 5 ★ en crash tests
              </span>
            )}
            {car.electric_range_km && car.electric_range_km > 500 && (
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800/60 text-blue-900 dark:text-blue-200 rounded-full text-sm font-semibold flex items-center gap-1">
                🚗 Autonomía {car.electric_range_km} km
              </span>
            )}
            {car.battery_kwh && car.battery_kwh > 80 && (
              <span className="px-3 py-1 bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 rounded-full text-sm font-semibold flex items-center gap-1">
                🔋 Batería grande {car.battery_kwh} kWh
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-full text-sm font-semibold">
              {getTypeLabel(car.type)}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
              {getFuelLabel(car.fuel)}
            </span>
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
              {car.seats} plazas
            </span>
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
              {car.transmission === 'automatica' ? 'Automática' : 'Manual'}
            </span>
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
              {car.traction}
            </span>
            {car.origin_country && (
              <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
                🌍 {car.origin_country}
              </span>
            )}
            {car.airbags != null && (
              <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-800/60 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
                🛡️ {car.airbags} airbags
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{car.description}</p>

          <div className="mb-6">
            <SafetyBanner context="new" />
          </div>

          {charging && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">💡 Costo de carga estimado</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Carga completa en casa</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatPrice(charging.homeFull)}</p>
                  {charging.homePer100 != null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">≈ {formatPrice(charging.homePer100)} / 100 km</p>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Carga rápida pública</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatPrice(charging.fastFull)}</p>
                  {charging.fastPer100 != null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">≈ {formatPrice(charging.fastPer100)} / 100 km</p>
                  )}
                </div>
              </div>
              {combustionPer100 == null && charging.homePer100 != null && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                  Estimación con batería de {charging.batteryKwh} kWh · hogar ${HOME_KWH_CLP}/kWh · carga rápida ${FAST_KWH_CLP}/kWh. Valores referenciales.
                </p>
              )}
            </div>
          )}

          {combustionPer100 != null && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">⛽ Costo de combustible estimado</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Según consumo mixto {car.fuel_consumption_mixed_km_l} km/L. Precio referencial.</p>
              </div>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400 whitespace-nowrap">{formatPrice(combustionPer100)} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/ 100 km</span></p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            {car.hp != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <BoltIcon className="w-5 h-5 mx-auto text-blue-500 dark:text-blue-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1"><TermTip term="hp">Potencia</TermTip></p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.hp} HP</p>
              </div>
            )}
            {car.torque_nm != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <WrenchIcon className="w-5 h-5 mx-auto text-indigo-500 dark:text-indigo-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1"><TermTip term="torque">Torque</TermTip></p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.torque_nm} Nm</p>
              </div>
            )}
            {(car.electric_range_km ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <Battery100Icon className="w-5 h-5 mx-auto text-green-500 dark:text-green-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1"><TermTip term="autonomia">Autonomía</TermTip></p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.electric_range_km} km</p>
              </div>
            )}
            {(car.battery_kwh ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <PowerIcon className="w-5 h-5 mx-auto text-lime-500 dark:text-lime-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1"><TermTip term="kwh">Batería</TermTip></p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.battery_kwh} kWh</p>
              </div>
            )}
            {(car.fuel_consumption_mixed_km_l ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <FireIcon className="w-5 h-5 mx-auto text-green-500 dark:text-green-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1"><TermTip term="consumo_mixto">Consumo mixto</TermTip></p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.fuel_consumption_mixed_km_l} km/L</p>
              </div>
            )}
            {(car.fuel_consumption_city_km_l ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <FireIcon className="w-5 h-5 mx-auto text-emerald-500 dark:text-emerald-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Consumo ciudad</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.fuel_consumption_city_km_l} km/L</p>
              </div>
            )}
            {(car.fuel_consumption_highway_km_l ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <FireIcon className="w-5 h-5 mx-auto text-teal-500 dark:text-teal-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Consumo carretera</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.fuel_consumption_highway_km_l} km/L</p>
              </div>
            )}
            {car.airbags != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <ShieldCheckIcon className="w-5 h-5 mx-auto text-purple-500 dark:text-purple-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Airbags</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.airbags}</p>
              </div>
            )}
            {(car.trunk_liters ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <CubeIcon className="w-5 h-5 mx-auto text-orange-500 dark:text-orange-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Baúl</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.trunk_liters} L</p>
              </div>
            )}
            {car.length_mm != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <ArrowsRightLeftIcon className="w-5 h-5 mx-auto text-rose-500 dark:text-rose-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Largo</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.length_mm} mm</p>
              </div>
            )}
            {car.wheelbase_mm != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <ArrowsRightLeftIcon className="w-5 h-5 mx-auto text-pink-500 dark:text-pink-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Dist. entre ejes</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.wheelbase_mm} mm</p>
              </div>
            )}
            {car.ground_clearance_mm != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <ArrowUpIcon className="w-5 h-5 mx-auto text-fuchsia-500 dark:text-fuchsia-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Altura libre</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.ground_clearance_mm} mm</p>
              </div>
            )}
            {(car.fuel_tank_liters ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <CircleStackIcon className="w-5 h-5 mx-auto text-cyan-500 dark:text-cyan-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Tanque</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.fuel_tank_liters} L</p>
              </div>
            )}
            {(car.latin_ncap_stars ?? 0) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <StarIcon className="w-5 h-5 mx-auto text-yellow-500 dark:text-yellow-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Latin NCAP</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.latin_ncap_stars}/5</p>
              </div>
            )}
            {car.warranty_years != null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <ClockIcon className="w-5 h-5 mx-auto text-sky-500 dark:text-sky-400" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">Garantía</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.warranty_years} años{(car.warranty_km ?? 0) > 0 ? ` / ${(car.warranty_km! / 1000).toFixed(0)} mil km` : ''}</p>
              </div>
            )}
            {car.origin_country && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center shadow-sm border border-gray-200 dark:border-gray-600">
                <GlobeAltIcon className="w-5 h-5 mx-auto text-gray-600 dark:text-gray-300" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold mt-1">País de origen</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{car.origin_country}</p>
              </div>
            )}
          </div>

          {(car.safety_ratings ?? []).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Calificaciones de seguridad (crash tests)</h3>
              <div className="space-y-1.5">
                {(car.safety_ratings ?? []).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800/40">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.program}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Evaluación {r.year}
                        {r.note ? ` · ${r.note}` : ''}
                        {' · '}
                        <a
                          href={r.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          fuente
                        </a>
                      </p>
                    </div>
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300 whitespace-nowrap ml-2">
                      {'★'.repeat(Math.min(r.stars, 5))}
                      <span className="text-yellow-300 dark:text-yellow-700">{'★'.repeat(Math.max(0, 5 - r.stars))}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(car.adas ?? []).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Seguridad y ADAS</h3>
              <div className="flex flex-wrap gap-1.5">
                {(car.adas ?? []).map((a, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs font-semibold">{a}</span>
                ))}
              </div>
            </div>
          )}

          {(car.infotainment ?? []).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Tecnología</h3>
              <div className="flex flex-wrap gap-1.5">
                {(car.infotainment ?? []).map((t, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded text-xs font-semibold">{t}</span>
                ))}
              </div>
            </div>
          )}

          {car.versions && car.versions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Versiones disponibles</h3>
              <div className="space-y-2">
                {car.versions.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{v.version}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{v.transmission} · {v.traction}</p>
                    </div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatPrice(v.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio desde</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatPrice(car.price)}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Precio referencial. Confirmar en el sitio oficial.</p>
            </div>
            <div className="flex gap-2">
              <a
                href={getBrandUrl(car.brand)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                title={`Sitio oficial ${car.brand}`}
              >
                🌐 Sitio oficial {car.brand}
              </a>
              <button
                onClick={() => onToggleFavorite(car.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isFavorite
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/60'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {isFavorite ? '❤️ Guardado' : '🤍 Guardar'}
              </button>
            </div>
          </div>

          <NextSteps car={car} />

          <div className="mt-6 mb-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Herramientas del vehículo</h3>
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <TabButton key={tab.id} id={tab.id} label={tab.label} />
              ))}
            </div>

            {activeTab === 'tco' && (
              <div className="mt-4"><TCOCalculator car={car} /></div>
            )}
            {activeTab === 'ev' && isElectrified && (
              <div className="mt-4"><EVHub car={car} /></div>
            )}
            {activeTab === 'credit' && children && (
              <div className="mt-4">{children}</div>
            )}
            {activeTab === 'guide' && (
              <div className="mt-4"><BuyingGuide /></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
