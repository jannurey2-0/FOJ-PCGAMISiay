import React from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

interface HeroPhoto {
  id: string;
  url: string;
  caption?: string;
  display_order: number;
}

interface SlideshowPanelProps {
  currentUser: UserProfile;
  heroPhotos: HeroPhoto[];
  newHeroUrl: string;
  setNewHeroUrl: (url: string) => void;
  newHeroCaption: string;
  setNewHeroCaption: (caption: string) => void;
  newHeroOrder: number;
  setNewHeroOrder: (order: number) => void;
  fetchHeroPhotos: () => void;
  showToast: (msg: string, type?: any, title?: string) => void;
}

export const SlideshowPanel: React.FC<SlideshowPanelProps> = ({
  currentUser,
  heroPhotos,
  newHeroUrl,
  setNewHeroUrl,
  newHeroCaption,
  setNewHeroCaption,
  newHeroOrder,
  setNewHeroOrder,
  fetchHeroPhotos,
  showToast
}) => {
  if (currentUser.role !== 'Admin') return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-wood shadow-md space-y-6">
      <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
        <Upload className="w-6 h-6 text-church-gold" />
        <h3 className="font-serif text-2xl font-bold">Hero Slideshow</h3>
      </div>

      {/* Add new slide form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newHeroUrl.trim()) return;

          const { error } = await supabase.from('hero_photos').insert([
            {
              url: newHeroUrl,
              caption: newHeroCaption,
              display_order: newHeroOrder
            }
          ]);

          if (error) {
            showToast(error.message, 'error', 'Error');
          } else {
            showToast('New slide added successfully!', 'success', 'Slideshow');
            setNewHeroUrl('');
            setNewHeroCaption('');
            setNewHeroOrder(0);
            fetchHeroPhotos();
          }
        }}
        className="space-y-3"
      >
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Add New Slide</h4>
        <div>
          <input
            type="text"
            required
            placeholder="Image URL (e.g. https://images.unsplash.com/...)"
            value={newHeroUrl}
            onChange={(e) => setNewHeroUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Caption"
            value={newHeroCaption}
            onChange={(e) => setNewHeroCaption(e.target.value)}
            className="col-span-2 px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
          />
          <input
            type="number"
            placeholder="Order"
            value={newHeroOrder}
            onChange={(e) => setNewHeroOrder(parseInt(e.target.value) || 0)}
            className="px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-church-charcoal"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded text-xs transition-all shadow cursor-pointer animate-press"
        >
          Add Slide Image
        </button>
      </form>

      {/* Current slides list */}
      <div className="space-y-4 pt-4 border-t border-church-creamDark">
        <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Active Slides ({heroPhotos.length})</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {heroPhotos.length === 0 ? (
            <p className="text-xs text-church-charcoal/50 text-center py-2">No custom slideshow images. Falling back to default cover.</p>
          ) : (
            heroPhotos.map((photo) => (
              <div key={photo.id} className="flex items-center space-x-3 p-2 bg-church-bg/50 rounded-lg text-xs">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Slide'}
                  className="w-12 h-12 object-cover rounded border border-church-creamDark"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800';
                  }}
                />
                <div className="flex-grow min-w-0">
                  <span className="font-semibold text-xs text-church-wood block truncate">{photo.caption || 'No Caption'}</span>
                  <span className="text-[10px] text-church-charcoal/50 block">Order: {photo.display_order}</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.from('hero_photos').delete().eq('id', photo.id);
                    if (error) showToast(error.message, 'error', 'Error');
                    else {
                      showToast('Slide image deleted successfully.', 'success', 'Slideshow');
                      fetchHeroPhotos();
                    }
                  }}
                  className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                  title="Delete Slide"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
