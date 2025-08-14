import React, { useEffect, useState } from 'react';
import { Save, Plus, Edit, Trash2, MoveUp, MoveDown, Eye, EyeClosed } from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useContent } from '@/contexts/ContentContext';
import {HeroCarousel, HeroCarouselFormData} from "@/dto/hero.ts";



const AdminHero: React.FC = () => {
  const { user } = useAuth();
  const { heroCarousel, fetchHeroCarousel, refresh } = useContent();
  const [isCarouselFormOpen, setIsCarouselFormOpen] = useState(false);
  const [editingCarouselItem, setEditingCarouselItem] = useState<HeroCarousel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCarouselItem, setSelectedCarouselItem] = useState<HeroCarousel | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [carouselFormData, setCarouselFormData] = useState<HeroCarouselFormData>({
    title: '',
    subtitle: '',
    description: '',
    background_image: '',
    cta_text: '',
    cta_link: '',
    is_active: true,
    display_order: 1
  });

  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...carouselFormData, created_by: user?.id };

    let error;
    if (editingCarouselItem) {
      ({ error } = await supabase
        .from('hero_carousel')
        .update(payload)
        .eq('id', editingCarouselItem.id));
    } else {
      ({ error } = await supabase.from('hero_carousel').insert([{ ...payload }]));
    }

    if (error) {
      toast.error('Failed to save slide: ' + error.message);
    } else {
      toast.success(editingCarouselItem ? 'Slide updated' : 'Slide created');
      handleCloseCarouselForm();
      await refresh('heroCarousel');
    }

    setLoading(false);
  };

  const handleEditCarouselItem = (item: HeroCarousel) => {
    
    setEditingCarouselItem(item);
    setCarouselFormData({ ...item });
    setIsCarouselFormOpen(true);
  };

  const handleDeleteCarouselItem = async (id: string) => {
    const { error } = await supabase.from('hero_carousel').delete().eq('id', id);
    if (error) toast.error('Delete failed: ' + error.message);
    else {
      toast.success('Slide deleted');
      await refresh('heroCarousel');
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCloseCarouselForm = () => {
    setIsCarouselFormOpen(false);
    setEditingCarouselItem(null);
    setCarouselFormData({
      title: '',
      subtitle: '',
      description: '',
      background_image: '',
      cta_text: '',
      cta_link: '',
      is_active: true,
      display_order: heroCarousel.length + 1
    });
  };

const moveCarouselItem = async (id: string, direction: 'up' | 'down') => {
  const index = heroCarousel.findIndex((item) => item.id === id);
  if (
    (direction === 'up' && index === 0) ||
    (direction === 'down' && index === heroCarousel.length - 1)
  )
    return;

  const newItems = [...heroCarousel];
  const swapIndex = direction === 'up' ? index - 1 : index + 1;

  // Swap
  [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

  // Update display_order
  newItems.forEach((item, idx) => {
    item.display_order = idx + 1;
  });

  // Save to Supabase
  const updates = newItems.map(({ id, display_order }) =>
    supabase.from('hero_carousel').update({ display_order }).eq('id', id)
  );

  await Promise.all(updates);

  await refresh('heroCarousel');

  toast.success('Order updated');
};


  useEffect(() => {
    fetchHeroCarousel();
  }, []);


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hero Carousel Management</h1>
          <div className="flex space-x-2">
            <Button onClick={() => setIsCarouselFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Slide
            </Button>
            <Button onClick={() => setShowPreview((prev) => !prev)}>

              {showPreview ? <>
                <EyeClosed className="h-4 w-4 mr-1" /> Hide Preview
              </> : <>
                <Eye className="h-4 w-4 mr-1" /> Live Preview
              </>}
            </Button>
          </div>
        </div>

        <div className="min-h-[120px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
              <span className="ml-4 text-gray-600 font-medium">Loading events...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {heroCarousel.map((item, index) => (
                <div
                  key={item.id}
                  className="card-edu p-4 flex justify-between items-center gap-4"
                >
                  {/* Image thumbnail */}
                  <div className="w-32 h-20 rounded overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300">
                    {item.background_image ? (
                      <img
                        src={item.background_image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Slide content */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p>{item.subtitle}</p>
                    <small className="block text-xs text-gray-500">
                      Order: {item.display_order} — {item.is_active ? 'Active' : 'Inactive'}
                    </small>
                  </div>

                  {/* Controls */}
                  <div className="flex space-x-2">
                    <Button variant='ghost' onClick={() => moveCarouselItem(item.id, 'up')} disabled={index === 0}>
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => moveCarouselItem(item.id, 'down')}
                      disabled={index === heroCarousel.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button variant='ghost' onClick={() => handleEditCarouselItem(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedCarouselItem(item);
                        setIsDeleteDialogOpen(true);
                      }}
                      variant='ghost'
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {showPreview && (
          <div className="card-edu p-6 relative min-h-[200px]">
            <h3 className="text-lg font-semibold mb-4">
              Live Preview</h3>

            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading preview...</div>
            ) : heroCarousel.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No slides to preview.</div>
            ) : (
              <Carousel className="w-full max-w-4xl mx-auto">
                <CarouselContent>
                  {heroCarousel.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="relative h-[300px] rounded overflow-hidden"
                    >
                      <div
                        className="w-full h-full bg-cover bg-center flex flex-col justify-center items-start p-6 text-white"
                        style={{
                          backgroundImage: `url(${item.background_image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <h2 className="text-2xl font-bold drop-shadow">{item.title}</h2>
                        <p className="drop-shadow">{item.subtitle}</p>
                        <a
                          href={item.cta_link}
                          className="mt-4 inline-block px-4 py-2 bg-white text-indigo-600 font-medium rounded"
                        >
                          {item.cta_text}
                        </a>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}



        <Dialog open={isCarouselFormOpen} onOpenChange={setIsCarouselFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCarouselItem ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCarouselSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={carouselFormData.title}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={carouselFormData.subtitle}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, subtitle: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={carouselFormData.description}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, description: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Background Image</Label>
                  <ImageUpload
                    value={carouselFormData.background_image}
                    onChange={(url) => setCarouselFormData({ ...carouselFormData, background_image: url })}
                  />
                </div>
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={carouselFormData.cta_text}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, cta_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CTA Link</Label>
                  <Input
                    value={carouselFormData.cta_link}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, cta_link: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={carouselFormData.is_active}
                  onChange={(e) => setCarouselFormData({ ...carouselFormData, is_active: e.target.checked })}
                  id="is_active"
                />
                <Label htmlFor="is_active">Active Slide</Label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseCarouselForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" /> : <Save className="h-4 w-4 mr-1" />}
                  {editingCarouselItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            if (selectedCarouselItem) {
              handleDeleteCarouselItem(selectedCarouselItem.id);
            }
          }}
          title="Delete Slide"
          description={`Are you sure you want to delete "${selectedCarouselItem?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

      </div>
    </AdminLayout>
  );
};

export default AdminHero;
