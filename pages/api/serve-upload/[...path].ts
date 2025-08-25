import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file path from the dynamic route
    const { path: filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Join the path segments and sanitize
    const requestedPath = filePath.join('/');
    
    // Security: ensure the path doesn't contain directory traversal attempts
    if (requestedPath.includes('..') || requestedPath.includes('\\') || requestedPath.startsWith('/')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build the full file system path
    const fullPath = path.join(process.cwd(), 'public', 'images', 'uploads', requestedPath);
    
    // Security: ensure the resolved path is still within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats for headers
    const stats = fs.statSync(fullPath);
    
    // Determine content type
    const mimeType = lookup(fullPath) || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year since files are timestamped
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // Generate ETag based on file stats
    const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
    res.setHeader('ETag', etag);
    
    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      return res.status(304).end();
    }

    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve file' });
      }
    });

    // Pipe the file to the response
    fileStream.pipe(res);

  } catch (error) {
    console.error('Serve upload error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}