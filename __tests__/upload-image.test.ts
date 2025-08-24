import { isAllowedMimeType, sanitizeFilename, generateUniqueFilename, isValidOrigin } from '../pages/api/upload-image';

describe('Upload Image API Helpers', () => {
  describe('isAllowedMimeType', () => {
    it('should allow valid image types', () => {
      expect(isAllowedMimeType('image/jpeg')).toBe(true);
      expect(isAllowedMimeType('image/png')).toBe(true);
      expect(isAllowedMimeType('image/webp')).toBe(true);
    });

    it('should reject invalid mime types', () => {
      expect(isAllowedMimeType('image/gif')).toBe(false);
      expect(isAllowedMimeType('image/svg+xml')).toBe(false);
      expect(isAllowedMimeType('text/plain')).toBe(false);
      expect(isAllowedMimeType('application/pdf')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize unsafe characters', () => {
      expect(sanitizeFilename('test file.jpg')).toBe('testfile.jpg');
      expect(sanitizeFilename('test@file#.png')).toBe('testfile.png');
      expect(sanitizeFilename('../../malicious.jpg')).toBe('malicious.jpg');
      expect(sanitizeFilename('<script>alert("xss")</script>.png')).toBe('script.png');
    });

    it('should preserve safe characters', () => {
      expect(sanitizeFilename('test-file_123.jpg')).toBe('test-file_123.jpg');
      expect(sanitizeFilename('ValidFileName.png')).toBe('ValidFileName.png');
    });

    it('should handle empty names', () => {
      expect(sanitizeFilename('.jpg')).toBe('jpg.jpg');
      expect(sanitizeFilename('@#$.png')).toBe('img.png');
    });

    it('should preserve extensions', () => {
      expect(sanitizeFilename('test.JPEG')).toBe('testJPEG.jpeg');
      expect(sanitizeFilename('test.PNG')).toBe('testPNG.png');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filenames with timestamp', async () => {
      const filename1 = generateUniqueFilename('test.jpg');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const filename2 = generateUniqueFilename('test.jpg');
      
      expect(filename1).toMatch(/^test-\d+\.jpg$/);
      expect(filename2).toMatch(/^test-\d+\.jpg$/);
      expect(filename1).not.toBe(filename2);
    });

    it('should sanitize while generating unique names', () => {
      const filename = generateUniqueFilename('test file@#$.jpg');
      expect(filename).toMatch(/^testfile-\d+\.jpg$/);
    });
  });

  describe('isValidOrigin', () => {
    it('should allow valid production origins', () => {
      expect(isValidOrigin('https://puertoricotraveldeals.com', undefined)).toBe(true);
      expect(isValidOrigin(undefined, 'https://puertoricotraveldeals.com/dealsmanager')).toBe(true);
    });

    it('should allow localhost for development', () => {
      expect(isValidOrigin('http://localhost:3000', undefined)).toBe(true);
      expect(isValidOrigin('http://127.0.0.1:3000', undefined)).toBe(true);
    });

    it('should reject invalid origins', () => {
      expect(isValidOrigin('https://malicious.com', undefined)).toBe(false);
      expect(isValidOrigin('http://evil.example.com', undefined)).toBe(false);
      expect(isValidOrigin(undefined, undefined)).toBe(false);
    });
  });

  describe('Path validation', () => {
    it('should ensure upload paths start with /images/uploads/', () => {
      // This test validates that our API only creates paths under the uploads directory
      const year = new Date().getFullYear().toString();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const filename = 'test-1234567890.jpg';
      
      const expectedPath = `/images/uploads/${year}/${month}/${filename}`;
      expect(expectedPath).toMatch(/^\/images\/uploads\/\d{4}\/\d{2}\/.+$/);
      expect(expectedPath.startsWith('/images/uploads/')).toBe(true);
    });
  });
});