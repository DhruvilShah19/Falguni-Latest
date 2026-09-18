import PageShell from '@/components/layout/PageShell';
import FavoritesInterface from '@/components/favorites/FavoritesInterface';

export const metadata = {
  title: 'My Favorite Items | Falguni Sweets',
  description: 'Your favorite authentic Gujarati snacks, sweets, and farsan.',
};

export default function FavoritesPage() {
  return (
    <PageShell>
      <FavoritesInterface />
    </PageShell>
  );
}
