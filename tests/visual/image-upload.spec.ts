import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Image Upload', () => {
  test('should upload image and update deal form @smoke', async ({ page }) => {
    // Navigate to deals manager
    await page.goto('/dealsmanager');
    
    // Click "Add New Deal" button
    await page.getByRole('button', { name: 'Add New Deal' }).click();
    
    // Verify the form is visible
    await expect(page.getByText('Add New Deal')).toBeVisible();
    
    // Verify the existing image path input is present
    await expect(page.getByLabel('Image Path *')).toBeVisible();
    
    // Verify the upload section is present
    await expect(page.getByText('Or upload image')).toBeVisible();
    await expect(page.getByLabel('Upload image')).toBeVisible();
    
    // Create a small test image file (1x1 PNG)
    const testImagePath = path.join(__dirname, '../../test-results/test-image.png');
    const testImageDir = path.dirname(testImagePath);
    
    // Ensure test-results directory exists
    if (!fs.existsSync(testImageDir)) {
      fs.mkdirSync(testImageDir, { recursive: true });
    }
    
    // Create a minimal 1x1 PNG file (base64 decoded)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);
    
    // Select the test file
    await page.getByLabel('Upload image').setInputFiles(testImagePath);
    
    // Verify file is selected (status message should appear)
    await expect(page.getByText(/Ready to upload.*test-image\.png/)).toBeVisible();
    
    // Click upload button
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for upload to complete
    await expect(page.getByText('Upload successful')).toBeVisible({ timeout: 10000 });
    
    // Verify the image path field was updated with the upload path
    const imagePathInput = page.getByLabel('Image Path *');
    const imagePath = await imagePathInput.inputValue();
    
    // Should match pattern /images/uploads/YYYY/MM/filename.ext
    expect(imagePath).toMatch(/^\/images\/uploads\/\d{4}\/\d{2}\/test-image-\d+\.png$/);
    
    // Verify preview image appears
    await expect(page.getByText('Preview:')).toBeVisible();
    await expect(page.getByAltText('Deal image preview')).toBeVisible();
    
    // Fill in required fields to test form submission still works
    await page.getByLabel('Title *').fill('Test Deal with Uploaded Image');
    await page.getByLabel('Description').fill('Test description');
    await page.getByLabel('Amount Label *').fill('20% off');
    await page.getByLabel('Location *').fill('San Juan');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Deal' }).click();
    
    // Verify deal was created successfully (should redirect back to deals list)
    await expect(page.getByText('Test Deal with Uploaded Image')).toBeVisible({ timeout: 5000 });
    
    // Cleanup: remove test image file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  test('should handle invalid file types gracefully', async ({ page }) => {
    // Navigate to deals manager and open form
    await page.goto('/dealsmanager');
    await page.getByRole('button', { name: 'Add New Deal' }).click();
    
    // Create a test text file (invalid type)
    const testFilePath = path.join(__dirname, '../../test-results/test-file.txt');
    const testFileDir = path.dirname(testFilePath);
    
    if (!fs.existsSync(testFileDir)) {
      fs.mkdirSync(testFileDir, { recursive: true });
    }
    
    fs.writeFileSync(testFilePath, 'This is a test file');
    
    // Try to upload invalid file type
    await page.getByLabel('Upload image').setInputFiles(testFilePath);
    
    // Verify error message appears
    await expect(page.getByText('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')).toBeVisible();
    
    // Verify upload button is not enabled (no file selected after validation failure)
    await expect(page.getByRole('button', { name: 'Upload' })).toBeDisabled();
    
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('should maintain backward compatibility with text input', async ({ page }) => {
    // Navigate to deals manager and open form
    await page.goto('/dealsmanager');
    await page.getByRole('button', { name: 'Add New Deal' }).click();
    
    // Test that manually entering image path still works
    const manualPath = '/images/mock-deal-1.png';
    await page.getByLabel('Image Path *').fill(manualPath);
    
    // Verify preview appears for manually entered path
    await expect(page.getByText('Preview:')).toBeVisible();
    await expect(page.getByAltText('Deal image preview')).toBeVisible();
    
    // Verify the image path value is correct
    const imagePathInput = page.getByLabel('Image Path *');
    expect(await imagePathInput.inputValue()).toBe(manualPath);
  });
});