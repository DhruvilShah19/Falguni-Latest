import PageShell from '@/components/layout/PageShell';
import FavoritesInterface from '@/components/favorites/FavoritesInterface';

export const metadata = {
  title: 'Your Wishlist | Maison Falguni',
};

export default function FavoritesPage() {
  return (
    <PageShell>
      <FavoritesInterface />
    </PageShell>
  );
}
