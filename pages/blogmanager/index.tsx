import React, { useState, useEffect } from 'react';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { Section } from '../../src/ui/Section';
import { Heading } from '../../src/ui/Heading';
import { Button } from '../../src/ui/Button';
import { SEO } from '../../src/ui/SEO';
import type { PostMeta } from '../../src/lib/blog';

type Mode = 'auth' | 'list' | 'create' | 'edit';

interface PostForm {
  title: string;
  slug: string;
  publishDate: string;
  author: string;
  excerpt: string;
  tags: string;
  heroImageUrl: string;
  imageUrls: string;
  body: string;
}

interface AssetsHelperProps {
  publishDate: string;
}

function AssetsHelper({ publishDate }: AssetsHelperProps) {
  const [images, setImages] = useState<string[]>([]);
  const [linkCheck, setLinkCheck] = useState<{url: string, status: 'checking' | 'ok' | 'error'} | null>(null);
  
  const date = new Date(publishDate);
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const folderPath = `/public/images/uploads/${year}/${month}/`;
  const urlPrefix = `/images/uploads/${year}/${month}/`;

  useEffect(() => {
    fetch(`/api/admin/blog?images=true&year=${year}&month=${month}`)
      .then(res => res.json())
      .then(data => setImages(data.images || []))
      .catch(() => setImages([]));
  }, [year, month]);

  const checkLink = async (url: string) => {
    if (!url.trim()) return;
    
    setLinkCheck({ url, status: 'checking' });
    try {
      const response = await fetch(url, { method: 'HEAD' });
      setLinkCheck({ url, status: response.ok ? 'ok' : 'error' });
    } catch {
      setLinkCheck({ url, status: 'error' });
    }
  };

  const generateMarkdown = (filename: string) => {
    return `![Alt text](${urlPrefix}${filename})`;
  };

  return (
    <div className="border-brand-navy/10 bg-brand-sand/20 rounded-lg border p-4">
      <h3 className="mb-3 font-semibold text-brand-navy">Assets Helper</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>Folder:</strong> <code className="rounded bg-white px-1">{folderPath}</code>
        </div>
        
        <div>
          <strong>URL Prefix:</strong> <code className="rounded bg-white px-1">{urlPrefix}</code>
        </div>

        {images.length > 0 && (
          <div>
            <strong>Available Files:</strong>
            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
              {images.map(filename => (
                <div key={filename} className="flex items-center gap-2">
                  <code className="rounded bg-white px-1 text-xs">{filename}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(generateMarkdown(filename))}
                    className="text-xs text-brand-blue hover:text-brand-navy"
                  >
                    Copy MD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <strong>Link Validator:</strong>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              placeholder="/images/uploads/..."
              className="border-brand-navy/20 flex-1 rounded border px-2 py-1 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkLink((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                checkLink(input.value);
              }}
              className="rounded bg-brand-blue px-2 py-1 text-xs text-white hover:bg-brand-navy"
            >
              Check
            </button>
          </div>
          {linkCheck && (
            <div className={`mt-1 text-xs ${linkCheck.status === 'ok' ? 'text-green-600' : linkCheck.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
              {linkCheck.url}: {linkCheck.status === 'checking' ? 'Checking...' : linkCheck.status === 'ok' ? 'Works ✓' : 'Not found ✗'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogManager() {
  const [mode, setMode] = useState<Mode>('auth');
  const [token, setToken] = useState('');
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
  const [form, setForm] = useState<PostForm>({
    title: '',
    slug: '',
    publishDate: new Date().toISOString().slice(0, 16),
    author: 'PRTD Team',
    excerpt: '',
    tags: '',
    heroImageUrl: '',
    imageUrls: '',
    body: ''
  });

  useEffect(() => {
    // Check if already authenticated
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setMode('list');
      } else if (response.status === 401) {
        setMode('auth');
      }
    } catch {
      setMode('auth');
    }
  };

  const authenticate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        await loadPosts();
      } else {
        setError('Invalid token');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPostForEdit = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/blog?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        const fm = data.frontmatter;
        
        setForm({
          title: fm.title || '',
          slug: fm.slug || '',
          publishDate: fm.publishDate || '',
          author: fm.author || '',
          excerpt: fm.excerpt || '',
          tags: fm.tags ? fm.tags.join(', ') : '',
          heroImageUrl: fm.heroImageUrl || '',
          imageUrls: fm.imageUrls ? fm.imageUrls.join('\n') : '',
          body: data.body || ''
        });
        
        setEditingSlug(slug);
        setMode('edit');
      }
    } catch {
      setError('Failed to load post');
    }
  };

  const savePost = async () => {
    setLoading(true);
    setError('');

    if (!form.title || !form.publishDate || !form.author || !form.excerpt) {
      setError('Title, publish date, author, and excerpt are required');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title: form.title,
        slug: form.slug || undefined,
        publishDate: form.publishDate.includes('T') ? form.publishDate : `${form.publishDate}:00Z`,
        author: form.author,
        excerpt: form.excerpt,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        heroImageUrl: form.heroImageUrl || undefined,
        imageUrls: form.imageUrls ? form.imageUrls.split('\n').map(u => u.trim()).filter(Boolean) : undefined,
        body: form.body
      };

      const isEdit = mode === 'edit' && editingSlug;
      const url = isEdit ? `/api/admin/blog?originalSlug=${editingSlug}` : '/api/admin/blog';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        await loadPosts();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Save failed');
      }
    } catch {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      publishDate: new Date().toISOString().slice(0, 16),
      author: 'PRTD Team',
      excerpt: '',
      tags: '',
      heroImageUrl: '',
      imageUrls: '',
      body: ''
    });
    setEditingSlug(null);
    setMode('list');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (mode === 'auth') {
    return (
      <SiteLayout>
        <SEO title="Blog Manager — PRTD" />
        <Section>
          <div className="mx-auto max-w-md">
            <Heading level={1}>Blog Manager</Heading>
            <div className="mt-6 space-y-4">
              <input
                type="password"
                placeholder="Admin token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && authenticate()}
              />
              <Button 
                onClick={authenticate} 
                disabled={loading || !token}
                className="w-full"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </Section>
      </SiteLayout>
    );
  }

  if (mode === 'list') {
    return (
      <SiteLayout>
        <SEO title="Blog Manager — PRTD" />
        <Section>
          <div className="mb-6 flex items-center justify-between">
            <Heading level={1}>Blog Manager</Heading>
            <Button onClick={() => setMode('create')}>New Post</Button>
          </div>

          {posts.length === 0 ? (
            <p className="text-brand-navy/70">No posts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-brand-navy/10 w-full rounded-lg border bg-white">
                <thead className="bg-brand-sand/20">
                  <tr>
                    <th className="border-brand-navy/10 border-b p-3 text-left">Title</th>
                    <th className="border-brand-navy/10 border-b p-3 text-left">Date</th>
                    <th className="border-brand-navy/10 border-b p-3 text-left">Slug</th>
                    <th className="border-brand-navy/10 border-b p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.slug} className="hover:bg-brand-sand/10">
                      <td className="border-brand-navy/5 border-b p-3">{post.title}</td>
                      <td className="border-brand-navy/5 border-b p-3 text-sm">{formatDate(post.publishDate)}</td>
                      <td className="border-brand-navy/5 border-b p-3 font-mono text-sm">{post.slug}</td>
                      <td className="border-brand-navy/5 border-b p-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => loadPostForEdit(post.slug)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </SiteLayout>
    );
  }

  // Create/Edit mode
  return (
    <SiteLayout>
      <SEO title={`${mode === 'create' ? 'Create' : 'Edit'} Post — Blog Manager`} />
      <Section>
        <div className="mb-6 flex items-center justify-between">
          <Heading level={1}>{mode === 'create' ? 'Create Post' : 'Edit Post'}</Heading>
          <Button variant="outline" onClick={resetForm}>Back to List</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Publish Date *</label>
                <input
                  type="datetime-local"
                  value={form.publishDate}
                  onChange={(e) => setForm(prev => ({ ...prev, publishDate: e.target.value }))}
                  className="border-brand-navy/20 w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Author *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                  className="border-brand-navy/20 w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Slug (optional)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="travel, tips, guides"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Hero Image URL</label>
              <input
                type="text"
                value={form.heroImageUrl}
                onChange={(e) => setForm(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="/images/uploads/2025/09/hero.jpg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Image URLs (one per line)</label>
              <textarea
                value={form.imageUrls}
                onChange={(e) => setForm(prev => ({ ...prev, imageUrls: e.target.value }))}
                rows={3}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="/images/uploads/2025/09/image1.jpg&#10;/images/uploads/2025/09/image2.jpg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Body *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                rows={12}
                className="border-brand-navy/20 w-full rounded border px-3 py-2 font-mono text-sm"
                placeholder="Markdown content..."
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={savePost} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Post'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="lg:col-span-1">
            {form.publishDate && <AssetsHelper publishDate={form.publishDate} />}
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}