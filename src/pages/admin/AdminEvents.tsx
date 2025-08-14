
import React, { useEffect, useState } from 'react';
import { Save, Plus, Edit, Trash2, Calendar, MapPin, Clock, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { ImageUpload } from '../../components/ui/image-upload';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { set } from 'date-fns';
import { useContent } from '@/contexts/ContentContext';


interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  image?: string;
  registration_link?: string;
  is_active: boolean;
  created_by: string;
}

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  image?: string;
  registration_link?: string;
  is_active: boolean;
}

const AdminEvents: React.FC = () => {
  const { user } = useAuth();
  const { events, searchTerm, setSearchTerm, refresh, fetchEvents } = useContent();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const addForm = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      event_type: '',
      image: '',
      registration_link: '',
      is_active: true
    }
  })

  const editForm = useForm<EventFormData>();



  useEffect(() => {
    fetchEvents();
  }, [searchTerm])

  const handleAdd = async (data: EventFormData) => {
    setLoading(true);
    const { error } = await supabase
      .from('events')
      .insert([{ ...data, created_by: user?.id }]);

    if (error) {
      toast.error("Failed to create event");
      setError(error.message);
    } else {
      await refresh('events');
      toast.success("Event created successfully!");
      setIsAddDialogOpen(false);
      addForm.reset();
    }
    setLoading(false);
  };


  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    editForm.reset({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      location: event.location,
      event_type: event.event_type,
      image: event.image || '',
      registration_link: event.registration_link || '',
      is_active: event.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: EventFormData) => {
    if (!selectedEvent) return;
    setLoading(true);
    const { error } = await supabase
      .from('events')
      .update(data)
      .eq('id', selectedEvent.id);
    if (error) {
      toast.error("Failed to update event");
      setError(error.message);
    } else {
      await refresh('events');
      setIsEditDialogOpen(false);
      toast.success("Event updated successfully!");
      setSelectedEvent(null);
    }
  };


  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);

  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', selectedEvent.id);

    if (error) {
      toast.error("Failed to delete event");
      setError(error.message);
    } else {
      // fetchEvents();
      await refresh('events');
      toast.success("Event deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
    setLoading(false);
  }


  const getevent_typeColor = (type: string) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      seminar: 'bg-purple-100 text-purple-800',
      admission: 'bg-orange-100 text-orange-800',
      exam: 'bg-red-100 text-red-800',
      joining: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600 mt-1">Manage upcoming events and notifications</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className='space-y-4'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor='add-title'>Event Title</Label>
                    <Input id='add-title' placeholder='Enter event title' {...addForm.register('title', { required: true })} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor='add-event-type'>Event Type</Label>
                    <select id='add-event-type' {...addForm.register('event_type', { required: true })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value='' disabled>Select event type</option>
                      <option value='webinar'>Webinar</option>
                      <option value='workshop'>Workshop</option>
                      <option value='seminar'>Seminar</option>
                      <option value='admission'>Admission</option>
                      <option value='exam'>Exam</option>
                      <option value='joining'>Joining</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor='add-event-date'>Event Date</Label>
                    <Input id='add-event-date' type='date' {...addForm.register('event_date', { required: true })} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor='add-event-time'>Event Time</Label>
                    <Input id='add-event-time' type='time' {...addForm.register('event_time', { required: true })} />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='add-location'>Event Location</Label>
                    <Input id='add-location' placeholder='Enter event location' {...addForm.register('location', { required: true })} />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='add-description'>Event Description</Label>
                    <Textarea rows={4} id='add-description' placeholder='Enter event description' {...addForm.register('description', { required: true })} />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='add-registration-link'>Registration Link</Label>
                    <Input id='add-registration-link' type='url' placeholder='https://example.com/register' {...addForm.register('registration_link')} />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label htmlFor='add-image'>Event Image</Label>
                    <ImageUpload
                      value={addForm.watch('image')}
                      onChange={(value) => addForm.setValue('image', value)}
                      placeholder='Upload event image'
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex items-center gap-2 mt-2">
                    <input
                      type='checkbox'
                      id='add-is-active'
                      {...addForm.register('is_active')}
                      className='accent-primary'
                    />
                    <Label htmlFor='add-is-active'>Active Event</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    <span>Create Event</span>
                  </Button>

                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>



        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full"></span>
            <span className="ml-4 text-gray-600 font-medium">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-600 font-medium">No Events Found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="card-edu p-6">
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getevent_typeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.event_date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.event_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-500">
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          handleEdit(event);
                        }}
                        disabled={loading}
                        
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                        className="text-red-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className='space-y-4'>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor='edit-title'>Event Title</Label>
                  <Input id='edit-title' placeholder='Enter event title' {...editForm.register('title', { required: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor='edit-event-type'>Event Type</Label>
                  <select
                    id='edit-event-type'
                    {...editForm.register('event_type', { required: true })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value='' disabled>Select event type</option>
                    <option value='webinar'>Webinar</option>
                    <option value='workshop'>Workshop</option>
                    <option value='seminar'>Seminar</option>
                    <option value='admission'>Admission</option>
                    <option value='exam'>Exam</option>
                    <option value='joining'>Joining</option>
                    <option value='other'>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor='edit-event-date'>Event Date</Label>
                  <Input id='edit-event-date' type='date' {...editForm.register('event_date', { required: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor='edit-event-time'>Event Time</Label>
                  <Input id='edit-event-time' type='time' {...editForm.register('event_time', { required: true })} />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <Label htmlFor='edit-description'>Event Description</Label>
                  <Textarea
                    id='edit-description'
                    rows={4}
                    placeholder='Enter event description' {...editForm.register('description', { required: true })} />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <Label htmlFor='edit-event-location'>Event Location</Label>
                  <Input id='edit-event-location' placeholder='Enter event location' {...editForm.register('location', { required: true })} />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <Label htmlFor='edit-registration-link'>Registration Link</Label>
                  <Input id='edit-registration-link' type='url' placeholder='https://example.com/register' {...editForm.register('registration_link')} />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <Label htmlFor='edit-image'>Event Image</Label>
                  <ImageUpload
                    value={editForm.watch('image')}
                    onChange={(value) => editForm.setValue('image', value)}
                    placeholder='Upload event image'
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type='checkbox'
                    id='edit-is-active'
                    {...editForm.register('is_active')}
                    className='accent-primary'
                  />
                  <Label htmlFor='edit-is-active'>Active Event</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  <span>Edit Event</span>
                </Button>

              </div>
            </form>
          </DialogContent>
        </Dialog>


        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Event"
          description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText='Cancel'
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
