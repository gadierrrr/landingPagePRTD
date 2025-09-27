import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Beach } from '../../lib/forms';
import { Button } from '../Button';
import { 
  TAGS, 
  AMENITIES, 
  CONDITION_SCALES, 
  MUNICIPALITIES,
  TAG_LABELS,
  AMENITY_LABELS,
  CONDITION_LABELS,
  BeachTag,
  BeachAmenity,
  Municipality,
  SargassumLevel,
  SurfLevel,
  WindLevel
} from '../../constants/beachVocab';

interface BeachFormProps {
  beach?: Beach;
  onSubmit: (beach: Omit<Beach, 'id' | 'slug'>, options?: { duplicateDecision?: 'save_anyway' | 'merge' }) => void;
  onCancel: () => void;
  duplicates?: Array<{
    id: string;
    name: string;
    municipality: string;
    distance: number;
    similarity: number;
    reason: string;
  }>;
  onCheckDuplicates?: (beach: Omit<Beach, 'id' | 'slug'>) => void;
}

export const BeachForm: React.FC<BeachFormProps> = ({ 
  beach, 
  onSubmit, 
  onCancel,
  duplicates,
  onCheckDuplicates
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'success' | 'error'>('ready');
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: beach?.name || '',
    municipality: beach?.municipality || 'San Juan',
    lat: beach?.coords.lat?.toString() || '',
    lng: beach?.coords.lng?.toString() || '',
    tags: beach?.tags || [],
    amenities: beach?.amenities || [],
    sargassum: beach?.sargassum || '',
    surf: beach?.surf || '',
    wind: beach?.wind || '',
    coverImage: beach?.coverImage || '',
    gallery: beach?.gallery || [],
    aliases: beach?.aliases?.join(', ') || '',
    parentId: beach?.parentId || '',
    accessLabel: beach?.accessLabel || '',
    notes: beach?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const beachData: Omit<Beach, 'id' | 'slug'> = {
      name: formData.name,
      municipality: formData.municipality as Municipality,
      coords: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      },
      tags: formData.tags as BeachTag[],
      amenities: formData.amenities as BeachAmenity[],
      sargassum: formData.sargassum ? formData.sargassum as SargassumLevel : undefined,
      surf: formData.surf ? formData.surf as SurfLevel : undefined,
      wind: formData.wind ? formData.wind as WindLevel : undefined,
      coverImage: formData.coverImage,
      gallery: formData.gallery,
      aliases: formData.aliases ? formData.aliases.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      parentId: formData.parentId || undefined,
      accessLabel: formData.accessLabel || undefined,
      notes: formData.notes || undefined
    };

    onSubmit(beachData);
  };

  const handleCheckDuplicates = () => {
    if (!onCheckDuplicates) return;
    
    const beachData: Omit<Beach, 'id' | 'slug'> = {
      name: formData.name,
      municipality: formData.municipality as Municipality,
      coords: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      },
      tags: formData.tags as BeachTag[],
      amenities: formData.amenities as BeachAmenity[],
      coverImage: formData.coverImage,
      gallery: formData.gallery
    };

    onCheckDuplicates(beachData);
  };

  const handleSaveAnyway = () => {
    const beachData: Omit<Beach, 'id' | 'slug'> = {
      name: formData.name,
      municipality: formData.municipality as Municipality,
      coords: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      },
      tags: formData.tags as BeachTag[],
      amenities: formData.amenities as BeachAmenity[],
      sargassum: formData.sargassum ? formData.sargassum as SargassumLevel : undefined,
      surf: formData.surf ? formData.surf as SurfLevel : undefined,
      wind: formData.wind ? formData.wind as WindLevel : undefined,
      coverImage: formData.coverImage,
      gallery: formData.gallery,
      aliases: formData.aliases ? formData.aliases.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      parentId: formData.parentId || undefined,
      accessLabel: formData.accessLabel || undefined,
      notes: formData.notes || undefined
    };

    onSubmit(beachData, { duplicateDecision: 'save_anyway' });
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    const newTags = formData.tags.includes(tag as BeachTag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag as BeachTag];
    handleChange('tags', newTags);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity as BeachAmenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity as BeachAmenity];
    handleChange('amenities', newAmenities);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

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

      const response = await fetch('/api/upload-image', {
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
      
      handleChange('coverImage', result.path);
      setUploadStatus('success');
      setSelectedFile(null);
      
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
          {beach ? 'Edit Beach' : 'Add New Beach'}
        </h3>
      </div>

      {/* Duplicates Warning */}
      {duplicates && duplicates.length > 0 && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h4 className="mb-2 font-semibold text-orange-800">⚠️ Possible Duplicates Found</h4>
          <div className="space-y-2">
            {duplicates.map(dup => (
              <div key={dup.id} className="text-sm text-orange-700">
                <strong>{dup.name}</strong> in {dup.municipality} - {dup.reason}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSaveAnyway} size="sm">
              Save Anyway
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Beach Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Beach name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Municipality <span className="text-brand-red">*</span>
            </label>
            <select
              required
              value={formData.municipality}
              onChange={(e) => handleChange('municipality', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              {MUNICIPALITIES.map(municipality => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Latitude <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              required
              step="0.000001"
              min="17.8"
              max="18.6"
              value={formData.lat}
              onChange={(e) => handleChange('lat', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="18.123456"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              Longitude <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              required
              step="0.000001"
              min="-67.4"
              max="-65.2"
              value={formData.lng}
              onChange={(e) => handleChange('lng', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="-66.123456"
            />
          </div>
        </div>

        {/* Check Duplicates Button */}
        {onCheckDuplicates && !duplicates && (
          <div>
            <Button 
              type="button" 
              onClick={handleCheckDuplicates}
              variant="outline"
              size="sm"
            >
              Check for Duplicates
            </Button>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">Beach Features</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {TAGS.map(tag => (
              <label key={tag} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="border-brand-navy/20 focus:ring-brand-blue/20 size-4 rounded text-brand-blue focus:ring-2"
                />
                <span className="text-sm text-brand-navy">{TAG_LABELS[tag]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">Amenities</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {AMENITIES.map(amenity => (
              <label key={amenity} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="border-brand-navy/20 focus:ring-brand-blue/20 size-4 rounded text-brand-blue focus:ring-2"
                />
                <span className="text-sm text-brand-navy">{AMENITY_LABELS[amenity]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Sargassum Level</label>
            <select
              value={formData.sargassum}
              onChange={(e) => handleChange('sargassum', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              <option value="">Not specified</option>
              {CONDITION_SCALES.sargassum.map(level => (
                <option key={level} value={level}>
                  {CONDITION_LABELS.sargassum[level]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Surf Conditions</label>
            <select
              value={formData.surf}
              onChange={(e) => handleChange('surf', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              <option value="">Not specified</option>
              {CONDITION_SCALES.surf.map(level => (
                <option key={level} value={level}>
                  {CONDITION_LABELS.surf[level]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Wind Conditions</label>
            <select
              value={formData.wind}
              onChange={(e) => handleChange('wind', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            >
              <option value="">Not specified</option>
              {CONDITION_SCALES.wind.map(level => (
                <option key={level} value={level}>
                  {CONDITION_LABELS.wind[level]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-navy">
            Cover Image <span className="text-brand-red">*</span>
          </label>
          
          {formData.coverImage && (
            <div className="mb-4">
              <div className="aspect-[16/9] max-w-md overflow-hidden rounded-lg bg-brand-sand">
                <Image 
                  src={formData.coverImage} 
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="border-brand-navy/20 focus:ring-brand-blue/20 flex-1 rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
            />
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
              size="sm"
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          
          {uploadError && (
            <p className="mt-1 text-sm text-red-600">{uploadError}</p>
          )}
        </div>

        {/* Optional Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Alternative Names (comma-separated)</label>
            <input
              type="text"
              value={formData.aliases}
              onChange={(e) => handleChange('aliases', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Playa Example, Example Beach"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Access Label</label>
            <input
              type="text"
              maxLength={50}
              value={formData.accessLabel}
              onChange={(e) => handleChange('accessLabel', e.target.value)}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Main entrance, North access, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">Notes</label>
            <textarea
              maxLength={500}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="border-brand-navy/20 focus:ring-brand-blue/20 w-full rounded-lg border px-3 py-2 text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              placeholder="Additional information about the beach..."
            />
            <div className="text-brand-navy/50 mt-1 text-xs">{formData.notes.length}/500</div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit">
            {beach ? 'Update Beach' : 'Create Beach'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};