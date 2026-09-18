import PageShell from '@/components/layout/PageShell';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesRow from '@/components/home/CategoriesRow';
import ProductsGrid from '@/components/home/ProductsGrid';
import FeatureStrip from '@/components/home/FeatureStrip';
import OurHeritageSection from '@/components/home/OurHeritageSection';
import GoogleReviewsSection from '@/components/home/GoogleReviewsSection';
import LocationSection from '@/components/home/LocationSection';

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col bg-[#FAF7F2]">

        {/* 1. Hero Banner ("Generations of Taste") */}
        <HeroBanner />

        {/* 2. Categories ("Something for Every Craving") */}
        <CategoriesRow />

        {/* 3. Products Carousel ("Falguni Favourites") */}
        <ProductsGrid
          title="Falguni Favourites"
          subtitle="Loved by 1000+ customers across India"
          viewAllHref="/products?sort=bestseller"
          limitCount={20}
          sliceStart={0}
          sliceEnd={12}
        />

        {/* 4. Feature Strip (4 Value Pillars) */}
        <FeatureStrip />

        {/* 5. Heritage Section ("A Legacy of Purity") */}
        <OurHeritageSection />

        {/* 6. Customer Reviews ("What Our Customers Say" 4.8/5) */}
        <GoogleReviewsSection />

        {/* 7. Flagship Store & Mobile App ("Visit Falguni" + "Falguni Wherever You Go") */}
        <LocationSection />

      </div>
    </PageShell>
  );
}
