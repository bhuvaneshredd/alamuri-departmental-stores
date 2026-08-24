import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';

export const uploadImage = async (
  fileBase64OrPath: string,
  folder: string = 'quickstore'
): Promise<string> => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(fileBase64OrPath, {
        folder,
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'webp' }],
      });
      return result.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload failed:', error);
      // If upload fails, return the path/URL if it's already a URL
      if (fileBase64OrPath.startsWith('http')) return fileBase64OrPath;
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Fallback if Cloudinary is not configured: return the provided URL/placeholder
  return fileBase64OrPath;
};
