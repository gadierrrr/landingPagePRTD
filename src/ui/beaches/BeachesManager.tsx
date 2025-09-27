import React, { useState, useEffect } from 'react';
import { Beach } from '../../lib/forms';
import { Button } from '../Button';
import { BeachForm } from './BeachForm';
import { BeachesGrid } from './BeachesGrid';

export const BeachesManager: React.FC = () => {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBeach, setEditingBeach] = useState<Beach | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [duplicates, setDuplicates] = useState<Array<{
    id: string;
    name: string;
    municipality: string;
    distance: number;
    similarity: number;
    reason: string;
  }> | undefined>(undefined);
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    fetchBeaches();
    fetchCSRFToken();
  }, []);

  const fetchBeaches = async () => {
    try {
      const response = await fetch('/api/beaches', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch beaches');
      const data = await response.json();
      setBeaches(data);
    } catch (error) {
      setError('Failed to load beaches');
      console.error('Error fetching beaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch CSRF token');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const handleSubmit = async (
    beachData: Omit<Beach, 'id' | 'slug'>, 
    options?: { duplicateDecision?: 'save_anyway' | 'merge' }
  ) => {
    try {
      setError('');
      
      const requestBody = {
        ...beachData,
        checkDuplicates: !options?.duplicateDecision, // Only check if no decision made
        duplicateDecision: options?.duplicateDecision
      };
      
      if (editingBeach) {
        // Update existing beach
        const response = await fetch(`/api/beaches/${editingBeach.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        if (response.status === 409) {
          // Duplicates found
          const data = await response.json();
          setDuplicates(data.duplicates);
          return; // Don't close form, show duplicates
        }
        
        if (!response.ok) throw new Error('Failed to update beach');
        
        const updatedBeach = await response.json();
        setBeaches(prev => prev.map(beach => 
          beach.id === editingBeach.id ? updatedBeach : beach
        ));
      } else {
        // Create new beach
        const response = await fetch('/api/beaches', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        if (response.status === 409) {
          // Duplicates found
          const data = await response.json();
          setDuplicates(data.duplicates);
          return; // Don't close form, show duplicates
        }
        
        if (!response.ok) throw new Error('Failed to create beach');
        
        const newBeach = await response.json();
        setBeaches(prev => [...prev, newBeach]);
      }
      
      // Success - close form and clear state
      setShowForm(false);
      setEditingBeach(undefined);
      setDuplicates(undefined);
    } catch (error) {
      setError(editingBeach ? 'Failed to update beach' : 'Failed to create beach');
      console.error('Error saving beach:', error);
    }
  };

  const handleCheckDuplicates = async (beachData: Omit<Beach, 'id' | 'slug'>) => {
    try {
      setError('');
      
      const response = await fetch('/api/beaches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          ...beachData,
          checkDuplicates: true
        })
      });
      
      if (response.status === 409) {
        const data = await response.json();
        setDuplicates(data.duplicates);
      } else if (response.ok) {
        // No duplicates found
        alert('No duplicates found! You can safely save this beach.');
        setDuplicates([]);
      } else {
        throw new Error('Failed to check for duplicates');
      }
    } catch (error) {
      setError('Failed to check for duplicates');
      console.error('Error checking duplicates:', error);
    }
  };

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach);
    setShowForm(true);
    setDuplicates(undefined); // Clear any previous duplicates
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      
      const response = await fetch(`/api/beaches/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete beach');
      
      setBeaches(prev => prev.filter(beach => beach.id !== id));
    } catch (error) {
      setError('Failed to delete beach');
      console.error('Error deleting beach:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBeach(undefined);
    setDuplicates(undefined);
  };

  const handleCreateNew = () => {
    setEditingBeach(undefined);
    setShowForm(true);
    setDuplicates(undefined);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-brand-navy">Loading beaches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-brand-red/10 border-brand-red/20 rounded-lg border px-4 py-3 text-brand-red">
          {error}
        </div>
      )}
      
      {!showForm && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">
              Beaches ({beaches.length})
            </h2>
            <p className="text-brand-navy/60 text-sm">Manage your beach database</p>
          </div>
          <Button onClick={handleCreateNew}>
            Add New Beach
          </Button>
        </div>
      )}
      
      {showForm ? (
        <BeachForm
          beach={editingBeach}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          duplicates={duplicates}
          onCheckDuplicates={handleCheckDuplicates}
        />
      ) : (
        <BeachesGrid
          beaches={beaches}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};