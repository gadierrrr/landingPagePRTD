import React from 'react';
import { Beach } from '../../lib/forms';
import { Button } from '../Button';
import { TAG_LABELS } from '../../constants/beachVocab';

interface BeachesGridProps {
  beaches: Beach[];
  onEdit: (beach: Beach) => void;
  onDelete: (id: string) => void;
}

export const BeachesGrid: React.FC<BeachesGridProps> = ({ beaches, onEdit, onDelete }) => {
  const handleDelete = (beach: Beach) => {
    if (confirm(`Are you sure you want to delete "${beach.name}"? This action cannot be undone.`)) {
      onDelete(beach.id!);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (beaches.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-6xl mb-4">🏖️</div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">No beaches yet</h3>
        <p className="text-brand-navy/60">Create your first beach to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-brand-navy/10 w-full rounded-lg border bg-white">
        <thead className="bg-brand-sand/20">
          <tr>
            <th className="border-brand-navy/10 border-b p-3 text-left">Beach</th>
            <th className="border-brand-navy/10 border-b p-3 text-left">Municipality</th>
            <th className="border-brand-navy/10 border-b p-3 text-left">Tags</th>
            <th className="border-brand-navy/10 border-b p-3 text-left">Updated</th>
            <th className="border-brand-navy/10 border-b p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {beaches.map((beach) => (
            <tr key={beach.id} className="hover:bg-brand-sand/10">
              <td className="border-brand-navy/5 border-b p-3">
                <div className="flex items-center space-x-3">
                  {beach.coverImage && (
                    <div className="size-12 overflow-hidden rounded-lg bg-brand-sand">
                      <img 
                        src={beach.coverImage} 
                        alt={beach.name}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-brand-navy">{beach.name}</div>
                    {beach.accessLabel && (
                      <div className="text-xs text-brand-navy/60">{beach.accessLabel}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="border-brand-navy/5 border-b p-3">
                <span className="text-sm text-brand-navy">{beach.municipality}</span>
              </td>
              <td className="border-brand-navy/5 border-b p-3">
                <div className="flex flex-wrap gap-1">
                  {beach.tags?.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex rounded-full bg-brand-sand px-2 py-1 text-xs text-brand-navy"
                    >
                      {TAG_LABELS[tag] || tag}
                    </span>
                  ))}
                  {beach.tags && beach.tags.length > 3 && (
                    <span className="text-xs text-brand-navy/60">
                      +{beach.tags.length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="border-brand-navy/5 border-b p-3">
                <span className="text-sm text-brand-navy/80">
                  {beach.updatedAt ? formatDate(beach.updatedAt) : 'Unknown'}
                </span>
              </td>
              <td className="border-brand-navy/5 border-b p-3">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(beach)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(beach)}
                    className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};