import React, { useState, useEffect } from 'react';
import { Deal } from '../../lib/forms';
import { Button } from '../Button';
import { DealForm } from './DealForm';
import { DealsGrid } from './DealsGrid';

export const DealsManager: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      setError('Failed to load deals');
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (dealData: Omit<Deal, 'id'>) => {
    try {
      setError('');
      
      if (editingDeal) {
        // Update existing deal
        const response = await fetch('/api/deals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editingDeal.id, ...dealData })
        });
        
        if (!response.ok) throw new Error('Failed to update deal');
        
        const updatedDeal = await response.json();
        setDeals(prev => prev.map(deal => 
          deal.id === editingDeal.id ? updatedDeal : deal
        ));
      } else {
        // Create new deal
        const response = await fetch('/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dealData)
        });
        
        if (!response.ok) throw new Error('Failed to create deal');
        
        const newDeal = await response.json();
        setDeals(prev => [...prev, newDeal]);
      }
      
      setShowForm(false);
      setEditingDeal(undefined);
    } catch (error) {
      setError(editingDeal ? 'Failed to update deal' : 'Failed to create deal');
      console.error('Error saving deal:', error);
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      setError('');
      
      const response = await fetch('/api/deals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) throw new Error('Failed to delete deal');
      
      setDeals(prev => prev.filter(deal => deal.id !== id));
    } catch (error) {
      setError('Failed to delete deal');
      console.error('Error deleting deal:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDeal(undefined);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-brand-navy">Loading deals...</div>
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
              Deals ({deals.length})
            </h2>
            <p className="text-brand-navy/60 text-sm">Manage your travel deals</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            Add New Deal
          </Button>
        </div>
      )}
      
      {showForm ? (
        <DealForm
          deal={editingDeal}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <DealsGrid
          deals={deals}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};