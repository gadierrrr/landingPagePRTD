import React, { useState, useRef } from 'react';
import { Event } from '../../lib/forms';
import { Button } from '../Button';

interface EventFormProps {
  event?: Event;
  weekStart: string;
  onSubmit: (weekStart: string, event: Omit<Event, 'id' | 'slug'>) => void;
  onCancel: () => void;
}

const CITIES = [
  { value: 'San Juan', label: 'San Juan' },
  { value: 'Bayamón', label: 'Bayamón' },
  { value: 'Ponce', label: 'Ponce' },
  { value: 'Mayagüez', label: 'Mayagüez' },
  { value: 'Caguas', label: 'Caguas' },
  { value: 'Arecibo', label: 'Arecibo' },
  { value: 'Guaynabo', label: 'Guaynabo' }
] as const;

const GENRES = [
  { value: 'music', label: 'Music' },
  { value: 'food', label: 'Food' },
  { value: 'art', label: 'Art' },
  { value: 'sports', label: 'Sports' },
  { value: 'family', label: 'Family' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'culture', label: 'Culture' }
] as const;

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'sold_out', label: 'Sold Out' }
] as const;

export const EventForm: React.FC<EventFormProps> = ({ event, weekStart, onSubmit, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'success' | 'error'>('ready');
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    descriptionShort: event?.descriptionShort || '',
    startDateTime: event?.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
    endDateTime: event?.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : '',
    city: event?.city || 'San Juan' as const,
    venueName: event?.venueName || '',
    address: event?.address || '',
    genre: event?.genre || 'music' as const,
    free: event?.free || false,
    priceFrom: event?.priceFrom?.toString() || '',
    ageRestriction: event?.ageRestriction || '',
    detailsUrl: event?.links?.details || '',
    ticketsUrl: event?.links?.tickets || '',
    canonicalUrl: event?.canonicalUrl || '',
    heroImageUrl: event?.heroImage?.url || '',
    heroImageAlt: event?.heroImage?.alt || '',
    status: event?.status || 'scheduled' as const,
    source: event?.source || '',
    sponsorPlacement: event?.sponsorPlacement || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to event structure
    const processedData = {
      title: formData.title,
      descriptionShort: formData.descriptionShort,
      startDateTime: new Date(formData.startDateTime).toISOString(),
      endDateTime: formData.endDateTime ? new Date(formData.endDateTime).toISOString() : undefined,
      timezone: 'America/Puerto_Rico',
      city: formData.city,
      venueName: formData.venueName || undefined,
      address: formData.address || undefined,
      genre: formData.genre,
      free: formData.free,
      priceFrom: formData.priceFrom ? Number(formData.priceFrom) : undefined,
      ageRestriction: formData.ageRestriction || undefined,
      links: {
        details: formData.detailsUrl || undefined,
        tickets: formData.ticketsUrl || undefined
      },
      canonicalUrl: formData.canonicalUrl || undefined,
      heroImage: (formData.heroImageUrl && formData.heroImageAlt) ? {
        url: formData.heroImageUrl,
        alt: formData.heroImageAlt
      } : undefined,
      status: formData.status,
      source: formData.source,
      sponsorPlacement: formData.sponsorPlacement as 'hero' | 'featured' | undefined || undefined
    };
    
    onSubmit(weekStart, processedData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      setUploadStatus('error');
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 5MB.');
      setUploadStatus('error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('ready');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/events/upload', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Update form with uploaded image URL and suggested alt text
      setFormData(prev => ({
        ...prev,
        heroImageUrl: result.url,
        heroImageAlt: prev.heroImageAlt || result.altSuggestion || ''
      }));
      
      setUploadStatus('success');
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
    }
  };


  return (
    <div className="bg-brand-sand/30 rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-brand-navy">
          {event ? 'Edit Event' : 'Add New Event'}
        </h3>
        <span className="text-brand-navy/60 text-sm">Week of {weekStart}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Event Title <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Concert, Festival, Art Show..."
            />
            <div className="text-brand-navy/50 mt-1 text-xs">{formData.title.length}/80</div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Genre <span className="text-brand-red">*</span>
            </label>
            <select
              required
              value={formData.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              {GENRES.map(genre => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">
            Short Description <span className="text-brand-red">*</span>
          </label>
          <textarea
            required
            maxLength={180}
            value={formData.descriptionShort}
            onChange={(e) => handleChange('descriptionShort', e.target.value)}
            className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            rows={3}
            placeholder="Brief description for the event card..."
          />
          <div className="text-brand-navy/50 mt-1 text-xs">{formData.descriptionShort.length}/180</div>
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Start Date & Time <span className="text-brand-red">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDateTime}
              onChange={(e) => handleChange('startDateTime', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            />
            <div className="text-brand-navy/50 mt-1 text-xs">Puerto Rico time (AST)</div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) => handleChange('endDateTime', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            />
            <div className="text-brand-navy/50 mt-1 text-xs">Leave empty for single time events</div>
          </div>
        </div>

        {/* Location */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              City <span className="text-brand-red">*</span>
            </label>
            <select
              required
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Venue Name
            </label>
            <input
              type="text"
              maxLength={100}
              value={formData.venueName}
              onChange={(e) => handleChange('venueName', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Concert Hall, Restaurant..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Address
            </label>
            <input
              type="text"
              maxLength={200}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="123 Main St, San Juan, PR"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="free"
              checked={formData.free}
              onChange={(e) => handleChange('free', e.target.checked)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 size-4 rounded text-brand-blue focus:ring-2"
            />
            <label htmlFor="free" className="text-sm font-medium text-brand-navy">
              Free Event
            </label>
          </div>

          {!formData.free && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-brand-navy">
                  Price From
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceFrom}
                  onChange={(e) => handleChange('priceFrom', e.target.value)}
                  className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brand-navy">
                  Age Restriction
                </label>
                <input
                  type="text"
                  value={formData.ageRestriction}
                  onChange={(e) => handleChange('ageRestriction', e.target.value)}
                  className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
                  placeholder="21+, All ages..."
                />
              </div>
            </>
          )}
        </div>

        {/* Links */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Details URL
            </label>
            <input
              type="url"
              value={formData.detailsUrl}
              onChange={(e) => handleChange('detailsUrl', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="https://example.com/event-info"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Tickets URL
            </label>
            <input
              type="url"
              value={formData.ticketsUrl}
              onChange={(e) => handleChange('ticketsUrl', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="https://tickets.example.com"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">
            Hero Image
          </label>
          
          {/* Current Image Preview */}
          {formData.heroImageUrl && (
            <div className="mb-4">
              <div className="aspect-[16/9] max-w-md overflow-hidden rounded-lg bg-brand-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={formData.heroImageUrl} 
                  alt={formData.heroImageAlt}
                  className="size-full object-cover"
                />
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-xs font-medium text-brand-navy">
                  Alt Text <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  required={!!formData.heroImageUrl}
                  value={formData.heroImageAlt}
                  onChange={(e) => handleChange('heroImageAlt', e.target.value)}
                  className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded border px-2 py-1 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1"
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 text-sm text-brand-navy"
            />
            
            {selectedFile && (
              <div className="flex items-center gap-3">
                <span className="text-brand-navy/70 text-sm">Selected: {selectedFile.name}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
            
            {uploadError && (
              <div className="text-sm text-brand-red">{uploadError}</div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="text-sm text-success">Image uploaded successfully!</div>
            )}
          </div>

          {/* Manual URL Entry */}
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-brand-navy">
              Or paste image URL:
            </label>
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => handleChange('heroImageUrl', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded border px-2 py-1 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1"
              placeholder="/images/event-photo.jpg"
            />
          </div>
        </div>

        {/* Meta Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Source <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Event organizer, website..."
            />
          </div>
        </div>

        {/* Sponsorship */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">
            Sponsor Placement
          </label>
          <select
            value={formData.sponsorPlacement}
            onChange={(e) => handleChange('sponsorPlacement', e.target.value)}
            className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
          >
            <option value="">None</option>
            <option value="hero">Hero (top of page)</option>
            <option value="featured">Featured (every 4th card)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {event ? 'Update Event' : 'Create Event'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};