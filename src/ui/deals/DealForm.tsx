import React, { useState, useRef } from 'react';
import { Deal } from '../../lib/forms';
import { Button } from '../Button';
import Image from 'next/image';

interface DealFormProps {
  deal?: Deal;
  onSubmit: (deal: Omit<Deal, 'id' | 'slug'>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'activity', label: 'Activity' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'tour', label: 'Tour' }
] as const;

export const DealForm: React.FC<DealFormProps> = ({ deal, onSubmit, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'success' | 'error'>('ready');
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    description: deal?.description || '',
    amountLabel: deal?.amountLabel || '',
    location: deal?.location || '',
    image: deal?.image || '',
    category: deal?.category || 'restaurant' as const,
    expiry: deal?.expiry || '',
    partner: deal?.partner || '',
    // New fields
    externalUrl: deal?.externalUrl || '',
    fullDescription: deal?.fullDescription || '',
    highlights: deal?.highlights?.join('\n') || '', // Store as newline-separated string for editing
    terms: deal?.terms || '',
    expiresAt: deal?.expiresAt || '',
    price: deal?.price || '',
    originalPrice: deal?.originalPrice || '',
    currency: deal?.currency || 'USD'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process highlights back to array
    const processedData = {
      ...formData,
      highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
      price: formData.price ? Number(formData.price) : undefined,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      // Handle empty strings as undefined for optional fields
      externalUrl: formData.externalUrl || undefined,
      fullDescription: formData.fullDescription || undefined,
      terms: formData.terms || undefined,
      expiresAt: formData.expiresAt || undefined
    };
    onSubmit(processedData);
  };

  const handleChange = (field: string, value: string) => {
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

      // Ensure CSRF token is available
      let tokenToUse = csrfToken;
      if (!tokenToUse) {
        try {
          const resp = await fetch('/api/csrf-token', { credentials: 'include' });
          if (resp.ok) {
            const data = await resp.json();
            tokenToUse = data.csrfToken;
            setCsrfToken(tokenToUse);
          }
        } catch (e) {
          // ignore
        }
      }

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'x-csrf-token': tokenToUse,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.ok && result.path) {
        // Update the image field with the uploaded path
        handleChange('image', result.path);
        setUploadStatus('success');
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <div className="ring-brand-navy/20 rounded-xl bg-white p-6 ring-1">
      <h3 className="mb-4 text-lg font-bold text-brand-navy">
        {deal ? 'Edit Deal' : 'Add New Deal'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-bold text-brand-navy">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={80}
            required
            className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-bold text-brand-navy">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            maxLength={180}
            rows={3}
            className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="amountLabel" className="mb-1 block text-sm font-bold text-brand-navy">
              Amount Label *
            </label>
            <input
              type="text"
              id="amountLabel"
              value={formData.amountLabel}
              onChange={(e) => handleChange('amountLabel', e.target.value)}
              maxLength={20}
              placeholder="e.g., 20% off, $50 off"
              required
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-bold text-brand-navy">
              Location *
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              maxLength={60}
              required
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-bold text-brand-navy">
            Image Path *
          </label>
          <input
            type="text"
            id="image"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="/images/deal-photo.png"
            required
            className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          
          {/* Image upload UI */}
          <div className="border-brand-navy/10 bg-brand-sand/20 mt-3 rounded-lg border p-3">
            <label htmlFor="file-upload" className="mb-2 block text-sm font-bold text-brand-navy">
              Or upload image
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="text-brand-navy/70 hover:file:bg-brand-blue/90 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-1 file:text-sm file:font-medium file:text-white"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className="shrink-0"
              >
                {uploadStatus === 'uploading' ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
            
            {/* Status messages */}
            <div className="mt-2 min-h-[1.25rem]">
              {uploadStatus === 'ready' && selectedFile && (
                <p className="text-brand-navy/60 text-xs">Ready to upload {selectedFile.name}</p>
              )}
              {uploadStatus === 'uploading' && (
                <p className="text-xs text-brand-blue">Uploading…</p>
              )}
              {uploadStatus === 'success' && (
                <p className="text-xs text-green-600">Upload successful - Image will be visible after saving the deal</p>
              )}
              {uploadStatus === 'error' && uploadError && (
                <p className="text-xs text-brand-red">{uploadError}</p>
              )}
            </div>
            
            {/* Preview */}
            {formData.image && formData.image !== '/images/' && (
              <div className="mt-3">
                <p className="text-brand-navy/60 mb-2 text-xs">Preview:</p>
                <div className="relative aspect-video w-32 overflow-hidden rounded-lg">
                  {formData.image.startsWith('/images/uploads/') || formData.image.startsWith('/api/serve-upload/') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.image}
                      alt="Deal image preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={formData.image}
                      alt="Deal image preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-bold text-brand-navy">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expiry" className="mb-1 block text-sm font-bold text-brand-navy">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              id="expiry"
              value={formData.expiry ? new Date(formData.expiry).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('expiry', e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        <div>
          <label htmlFor="partner" className="mb-1 block text-sm font-bold text-brand-navy">
            Partner
          </label>
          <input
            type="text"
            id="partner"
            value={formData.partner}
            onChange={(e) => handleChange('partner', e.target.value)}
            maxLength={80}
            className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        {/* New fields for detail pages */}
        <div className="border-brand-navy/10 border-t pt-4">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">Detail Page Information</h4>
          
          <div>
            <label htmlFor="externalUrl" className="mb-1 block text-sm font-bold text-brand-navy">
              External URL
            </label>
            <input
              type="url"
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => handleChange('externalUrl', e.target.value)}
              placeholder="https://partner-website.com/book-deal"
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-brand-navy/60 mt-1 text-xs">Where users will be redirected to book/purchase this deal</p>
          </div>

          <div>
            <label htmlFor="fullDescription" className="mb-1 block text-sm font-bold text-brand-navy">
              Full Description
            </label>
            <textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => handleChange('fullDescription', e.target.value)}
              rows={4}
              placeholder="Detailed description for the deal page..."
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-brand-navy/60 mt-1 text-xs">Detailed description for the deal page. Leave empty to use the regular description.</p>
          </div>

          <div>
            <label htmlFor="highlights" className="mb-1 block text-sm font-bold text-brand-navy">
              Highlights
            </label>
            <textarea
              id="highlights"
              value={formData.highlights}
              onChange={(e) => handleChange('highlights', e.target.value)}
              rows={4}
              placeholder="One highlight per line:\nFree WiFi\nComplimentary breakfast\nOcean view room"
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-brand-navy/60 mt-1 text-xs">Key features or benefits, one per line</p>
          </div>

          <div>
            <label htmlFor="terms" className="mb-1 block text-sm font-bold text-brand-navy">
              Terms & Conditions
            </label>
            <textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => handleChange('terms', e.target.value)}
              rows={3}
              placeholder="Valid for stays through December 31, 2024. Subject to availability..."
              className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiresAt" className="mb-1 block text-sm font-bold text-brand-navy">
                Expires At
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <p className="text-brand-navy/60 mt-1 text-xs">When this deal expires (separate from legacy expiry field)</p>
            </div>

            <div>
              <label htmlFor="currency" className="mb-1 block text-sm font-bold text-brand-navy">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-bold text-brand-navy">
                Sale Price
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                min="0"
                step="0.01"
                placeholder="199.99"
                className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="originalPrice" className="mb-1 block text-sm font-bold text-brand-navy">
                Original Price
              </label>
              <input
                type="number"
                id="originalPrice"
                value={formData.originalPrice}
                onChange={(e) => handleChange('originalPrice', e.target.value)}
                min="0"
                step="0.01"
                placeholder="299.99"
                className="border-brand-navy/20 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
          
          <p className="text-brand-navy/60 text-xs">Prices are optional but enable structured data and discount calculations</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {deal ? 'Update Deal' : 'Create Deal'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
