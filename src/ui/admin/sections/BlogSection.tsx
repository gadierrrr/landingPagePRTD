import React, { useCallback, useEffect, useState } from 'react';
import { Heading } from '../../Heading';
import { Button } from '../../Button';
import type { PostMeta } from '../../../lib/blog';

type Mode = 'list' | 'create' | 'edit';

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

function createInitialForm(): PostForm {
  return {
    title: '',
    slug: '',
    publishDate: new Date().toISOString().slice(0, 16),
    author: 'PRTD Team',
    excerpt: '',
    tags: '',
    heroImageUrl: '',
    imageUrls: '',
    body: ''
  };
}

function AssetsHelper({ publishDate }: AssetsHelperProps) {
  const [images, setImages] = useState<string[]>([]);
  const [linkCheck, setLinkCheck] = useState<{
    url: string;
    status: 'checking' | 'ok' | 'error';
  } | null>(null);
  const [linkValue, setLinkValue] = useState('');

  const date = new Date(publishDate);
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const folderPath = `/public/images/uploads/${year}/${month}/`;
  const urlPrefix = `/images/uploads/${year}/${month}/`;

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/admin/blog?images=true&year=${year}&month=${month}`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setImages(data.images || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setImages([]);
        }
      });

    return () => {
      isMounted = false;
    };
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

  const copyMarkdown = (filename: string) => {
    const markdown = `![Alt text](${urlPrefix}${filename})`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(markdown);
    }
  };

  return (
    <aside className="rounded-lg border border-brand-navy/10 bg-brand-sand/20 p-4">
      <h3 className="mb-3 font-semibold text-brand-navy">Assets Helper</h3>
      <div className="space-y-3 text-sm">
        <div>
          <strong>Folder:</strong>{' '}
          <code className="rounded bg-white px-1">{folderPath}</code>
        </div>
        <div>
          <strong>URL Prefix:</strong>{' '}
          <code className="rounded bg-white px-1">{urlPrefix}</code>
        </div>
        {images.length > 0 && (
          <div>
            <strong>Available Files:</strong>
            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1">
              {images.map((filename) => (
                <div key={filename} className="flex items-center justify-between gap-2">
                  <code className="rounded bg-white px-1 text-xs">{filename}</code>
                  <button
                    type="button"
                    onClick={() => copyMarkdown(filename)}
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
              value={linkValue}
              onChange={(event) => setLinkValue(event.target.value)}
              className="border-brand-navy/20 flex-1 rounded border px-2 py-1 text-xs"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void checkLink(linkValue);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                void checkLink(linkValue);
              }}
              className="rounded bg-brand-blue px-2 py-1 text-xs text-white hover:bg-brand-navy"
            >
              Check
            </button>
          </div>
          {linkCheck && (
            <div
              className={`mt-1 text-xs ${
                linkCheck.status === 'ok'
                  ? 'text-green-600'
                  : linkCheck.status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {linkCheck.url}:{' '}
              {linkCheck.status === 'checking'
                ? 'Checking...'
                : linkCheck.status === 'ok'
                ? 'Works ✓'
                : 'Not found ✗'}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function BlogSection() {
  const [mode, setMode] = useState<Mode>('list');
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [form, setForm] = useState<PostForm>(() => createInitialForm());
  const [csrfToken, setCsrfToken] = useState<string>('');

  const loadPosts = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/admin/blog', {
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setMode('list');
    } catch (err) {
      console.error('Failed to load blog posts', err);
      setError('Failed to load blog posts.');
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadPosts();
      setIsInitializing(false);
    })();
  }, [loadPosts]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/csrf-token', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const loadPostForEdit = async (slug: string) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/blog?slug=${slug}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load post');
      }

      const data = await response.json();
      const frontmatter = data.frontmatter ?? {};

      setForm({
        title: frontmatter.title || '',
        slug: frontmatter.slug || '',
        publishDate: frontmatter.publishDate
          ? frontmatter.publishDate.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        author: frontmatter.author || 'PRTD Team',
        excerpt: frontmatter.excerpt || '',
        tags: frontmatter.tags ? frontmatter.tags.join(', ') : '',
        heroImageUrl: frontmatter.heroImageUrl || '',
        imageUrls: frontmatter.imageUrls ? frontmatter.imageUrls.join('\n') : '',
        body: data.body || ''
      });

      setEditingSlug(slug);
      setMode('edit');
    } catch (err) {
      console.error(err);
      setError('Failed to load post for editing.');
    }
  };

  const resetForm = useCallback(() => {
    setForm(createInitialForm());
    setEditingSlug(null);
    setMode('list');
    setError('');
    setLoading(false);
  }, []);

  const savePost = useCallback(async () => {
    setLoading(true);
    setError('');

    if (!form.title || !form.publishDate || !form.author || !form.excerpt) {
      setError('Title, publish date, author, and excerpt are required.');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title: form.title,
        slug: form.slug || undefined,
        publishDate: form.publishDate.includes('T')
          ? `${form.publishDate}:00Z`
          : `${form.publishDate}T00:00:00Z`,
        author: form.author,
        excerpt: form.excerpt,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        heroImageUrl: form.heroImageUrl || undefined,
        imageUrls: form.imageUrls
          ? form.imageUrls
              .split('\n')
              .map((url) => url.trim())
              .filter(Boolean)
          : undefined,
        body: form.body
      };

      const isEdit = mode === 'edit' && editingSlug;
      const url = isEdit ? `/api/admin/blog?originalSlug=${editingSlug}` : '/api/admin/blog';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }

      await loadPosts();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }, [editingSlug, form, loadPosts, mode, resetForm]);

  const startCreate = () => {
    setForm(createInitialForm());
    setEditingSlug(null);
    setError('');
    setMode('create');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const headingTitle =
    mode === 'list' ? 'Blog Posts' : mode === 'create' ? 'Create Blog Post' : 'Edit Blog Post';
  const headingSubtitle =
    mode === 'list'
      ? 'Manage long-form content and announcements.'
      : 'All fields with * are required before publishing.';

  return (
    <section className="space-y-6">
      <header className="border-brand-navy/10 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <Heading level={1} className="text-3xl">
            {headingTitle}
          </Heading>
          <p className="text-brand-navy/70">{headingSubtitle}</p>
        </div>
        {mode === 'list' ? (
          <Button onClick={startCreate}>New Post</Button>
        ) : (
          <Button variant="outline" onClick={resetForm}>
            Back to List
          </Button>
        )}
      </header>

      {mode === 'list' ? (
        <div className="rounded-lg border border-brand-navy/10 bg-white">
          {isInitializing ? (
            <div className="p-6 text-brand-navy/70">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-brand-navy/70">No posts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-sand/20">
                  <tr className="text-left text-sm text-brand-navy">
                    <th className="border-brand-navy/10 border-b p-3 font-medium">Title</th>
                    <th className="border-brand-navy/10 border-b p-3 font-medium">Date</th>
                    <th className="border-brand-navy/10 border-b p-3 font-medium">Slug</th>
                    <th className="border-brand-navy/10 border-b p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.slug} className="text-sm text-brand-navy hover:bg-brand-sand/10">
                      <td className="border-brand-navy/5 border-b p-3">{post.title}</td>
                      <td className="border-brand-navy/5 border-b p-3 font-mono text-xs">
                        {formatDate(post.publishDate)}
                      </td>
                      <td className="border-brand-navy/5 border-b p-3 font-mono text-xs">{post.slug}</td>
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
          {mode === 'list' && error && !isInitializing && (
            <div className="border-t border-brand-navy/10 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Publish Date *</label>
                <input
                  type="datetime-local"
                  value={form.publishDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, publishDate: event.target.value }))}
                  className="border-brand-navy/20 w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Author *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                  className="border-brand-navy/20 w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Slug (optional)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                rows={2}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="travel, tips, guides"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Hero Image URL</label>
              <input
                type="text"
                value={form.heroImageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, heroImageUrl: event.target.value }))}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder="/images/uploads/2025/09/hero.jpg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Image URLs (one per line)</label>
              <textarea
                value={form.imageUrls}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrls: event.target.value }))}
                rows={3}
                className="border-brand-navy/20 w-full rounded border px-3 py-2"
                placeholder={'/images/uploads/2025/09/image1.jpg\n/images/uploads/2025/09/image2.jpg'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy">Body *</label>
              <textarea
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                rows={12}
                className="border-brand-navy/20 w-full rounded border px-3 py-2 font-mono text-sm"
                placeholder="Markdown content..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={savePost} disabled={loading}>
                {loading ? 'Saving...' : 'Save Post'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {form.publishDate && <AssetsHelper publishDate={form.publishDate} />}
          </div>
        </div>
      )}
    </section>
  );
}
