import PageShell from '@/components/layout/PageShell';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesRow from '@/components/home/CategoriesRow';
import FlashSalesSection from '@/components/home/FlashSalesSection';
import ProductsGrid from '@/components/home/ProductsGrid';

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
        <HeroBanner />
        <CategoriesRow />
        <FlashSalesSection />
        <ProductsGrid title="Featured Products" limitCount={20} />
      </div>
    </PageShell>
  );
}
