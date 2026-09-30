import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCars } from './hooks/useCars';
import { useDocuments } from './hooks/useDocuments';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Footer';
import { PublishFloat } from './components/Layout/PublishFloat';
import { SEO } from './components/SEO';
import { SignatureModal } from './components/Documents/SignatureModal';
import { Home } from './pages/Home';
import { CarGridSkeleton } from './components/Cars/CarSkeleton';

const Compare = lazy(() => import('./pages/Compare').then(m => ({ default: m.Compare })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Estadisticas = lazy(() => import('./pages/Estadisticas').then(m => ({ default: m.Estadisticas })));
const Top10 = lazy(() => import('./pages/Top10').then(m => ({ default: m.Top10 })));
const LegalDocs = lazy(() => import('./pages/LegalDocs').then(m => ({ default: m.LegalDocs })));
const BrandPage = lazy(() => import('./pages/BrandPage').then(m => ({ default: m.BrandPage })));
const Usados = lazy(() => import('./pages/Usados').then(m => ({ default: m.Usados })));
const UsedListingDetail = lazy(() => import('./pages/UsedListingDetail').then(m => ({ default: m.UsedListingDetail })));
const UsadosRegion = lazy(() => import('./pages/UsadosRegion').then(m => ({ default: m.UsadosRegion })));
const PublicarAuto = lazy(() => import('./pages/PublicarAuto').then(m => ({ default: m.PublicarAuto })));
const MisAnuncios = lazy(() => import('./pages/MisAnuncios').then(m => ({ default: m.MisAnuncios })));
const TusDatos = lazy(() => import('./pages/TusDatos').then(m => ({ default: m.TusDatos })));
const Glosario = lazy(() => import('./pages/Glosario').then(m => ({ default: m.Glosario })));
const ModeracionUsados = lazy(() => import('./pages/ModeracionUsados').then(m => ({ default: m.ModeracionUsados })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogArticle = lazy(() => import('./pages/BlogArticle').then(m => ({ default: m.BlogArticle })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <CarGridSkeleton count={6} />
    </div>
  );
}

function AppContent() {
  const { user, loading: authLoading, signInWithGoogle, signInAnonymously, signOut, isCloudAuthAvailable } = useAuth();
  const {
    cars,
    allCarsCount,
    totalPages,
    currentPage,
    setCurrentPage,
    allCars,
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    favorites,
    toggleFavorite,
    recentCars,
    addRecent,
  } = useCars(user);

  const {
    showModal,
    sign,
    decline,
    privacyContent,
    responsibilityContent,
    status,
    loading: docsLoading,
  } = useDocuments(user?.uid || null);

  if (authLoading || docsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Navbar
        user={user}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
        isCloudAuthAvailable={isCloudAuthAvailable}
      />

      {showModal && (
        <SignatureModal
          type={showModal}
          version={showModal === 'privacy' ? status?.privacyPolicy.version || '1.0' : status?.responsibility.version || '1.0'}
          content={showModal === 'privacy' ? privacyContent : responsibilityContent}
          onSign={sign}
          onDecline={decline}
        />
      )}

      <main id="main">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SEO
                title="Autos Usados y Nuevos en Chile | Publica Gratis"
                description="Publica tu auto gratis y vende sin comisión. Compara precios, kilometraje y especificaciones de autos usados y nuevos en Chile."
              />
              <Home
              cars={cars}
              allCarsCount={allCarsCount}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              filters={filters}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              favorites={favorites}
              compareList={compareList}
              onToggleFavorite={toggleFavorite}
              onAddToCompare={addToCompare}
              onRemoveFromCompare={removeFromCompare}
              recentCars={recentCars}
              onAddRecent={addRecent}
            />
            </>
          }
        />
        <Route
          path="/compare"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <SEO title="Comparar" description="Compara hasta 3 vehículos lado a lado en el mercado chileno." />
              <Compare
                compareList={compareList}
                onRemoveFromCompare={removeFromCompare}
                onClearCompare={clearCompare}
              />
            </Suspense>
          }
        />
        <Route
          path="/favorites"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <SEO title="Favoritos" description="Tus vehículos favoritos guardados en un solo lugar." />
              <Favorites
                allCars={allCars}
                favorites={favorites}
                compareList={compareList}
                onToggleFavorite={toggleFavorite}
                onAddToCompare={addToCompare}
                onRemoveFromCompare={removeFromCompare}
              />
            </Suspense>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <SEO title="Estadísticas" description="Estadísticas del mercado automotriz chileno." />
              <Estadisticas />
            </Suspense>
          }
        />
        <Route
          path="/top10"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Top10 />
            </Suspense>
          }
        />
        <Route
          path="/:docType(privacidad|responsabilidad|terminos)"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LegalDocs />
            </Suspense>
          }
        />
        <Route
          path="/glosario"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Glosario />
            </Suspense>
          }
        />
        <Route
          path="/marca/:brandSlug"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <BrandPage />
            </Suspense>
          }
        />
        <Route
          path="/usados/:slug"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <UsedListingDetail user={user} isCloudAuthAvailable={isCloudAuthAvailable} onSignIn={signInWithGoogle} />
            </Suspense>
          }
        />
        <Route
          path="/usados"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Usados />
            </Suspense>
          }
        />
        <Route
          path="/autos-usados-en/:regionSlug"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <UsadosRegion />
            </Suspense>
          }
        />
        <Route
          path="/publicar-auto"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <PublicarAuto user={user} isCloudAuthAvailable={isCloudAuthAvailable} onSignIn={signInWithGoogle} onSignInAnonymous={signInAnonymously} />
            </Suspense>
          }
        />
        <Route
          path="/mis-anuncios"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <MisAnuncios user={user} isCloudAuthAvailable={isCloudAuthAvailable} onSignIn={signInWithGoogle} />
            </Suspense>
          }
        />
        <Route
          path="/moderacion"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <ModeracionUsados user={user} isCloudAuthAvailable={isCloudAuthAvailable} onSignIn={signInWithGoogle} />
            </Suspense>
          }
        />
        <Route
          path="/tus-datos"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <TusDatos user={user} isCloudAuthAvailable={isCloudAuthAvailable} onSignIn={signInWithGoogle} />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <BlogArticle />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/estadisticas-mercado"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <SEO title="Página no encontrada" description="La página que buscas no existe." />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <p className="text-7xl mb-4">🚗</p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Página no encontrada</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">La ruta a la que intentaste acceder no existe.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                  ← Volver al inicio
                </Link>
              </div>
            </Suspense>
          }
        />
      </Routes>
      </main>

      <PublishFloat />

      <div className="pb-24 sm:pb-0">
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
