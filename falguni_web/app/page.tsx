import PageShell from '@/components/layout/PageShell';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesRow from '@/components/home/CategoriesRow';
import FlashSalesSection from '@/components/home/FlashSalesSection';
import ProductsGrid from '@/components/home/ProductsGrid';
import FeatureStrip from '@/components/home/FeatureStrip';
import AppDownloadSection from '@/components/home/AppDownloadSection';
import OurHeritageSection from '@/components/home/OurHeritageSection';
import RecentlyPurchasedSection from '@/components/home/RecentlyPurchasedSection';
import GoogleReviewsSection from '@/components/home/GoogleReviewsSection';
import LocationSection from '@/components/home/LocationSection';

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col pb-8 md:pb-16">

        {/* ── Hero banner (SliderWidget) ── */}
        <div className="px-4 md:px-8 lg:px-12 pt-4 md:pt-6">
          <HeroBanner />
        </div>

        {/* ── Feature strip — desktop only, below the banner ── */}
        <FeatureStrip />



        {/* ── App Download Section ── */}
        <AppDownloadSection />



        {/* ── Categories — "EXPLORE BY / CATEGORIES" ── */}
        <CategoriesRow />

        {/* ── Our Heritage Section ── */}
        <OurHeritageSection />

        {/* ── Flash Sales — "LIMITED TIME / FLASH SALES" (hidden if empty) ── */}
        <FlashSalesSection />

        {/* ── Recent Picks — (hidden if not logged in or no recent purchases) ── */}
        <RecentlyPurchasedSection />

        {/* ── Curated For You (Part 1) ── */}
        <ProductsGrid
          title="Curated For You"
          subtitle="Handpicked"
          viewAllHref="/products"
          limitCount={30}
          sliceStart={0}
          sliceEnd={15}
        />

        {/* ── Location Map Module ── */}
        <LocationSection />
        
        {/* ── Google Reviews ── */}
        <GoogleReviewsSection />

        {/* ── Curated For You (Part 2) ── */}
        <ProductsGrid
          title="More For You"
          subtitle="Continue Exploring"
          limitCount={30}
          sliceStart={15}
          sliceEnd={30}
        />

      </div>
    </PageShell>
  );
}
