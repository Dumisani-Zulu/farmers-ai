/**
 * Utility functions for AI image analysis
 */

/**
 * Converts an image URI to base64 data URI format required by Gemini AI
 * @param imageUri - The local image URI from camera or gallery
 * @returns Promise<string> - Base64 data URI string
 */
export const convertImageToDataUri = async (imageUri: string): Promise<string> => {
  try {
    console.log('🔄 Converting image to base64 data URI...');
    console.log('📷 Original URI length:', imageUri.length);
    
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log('✅ Image converted to base64');
        console.log('📊 Base64 length:', result.length);
        console.log('🔍 Format:', result.substring(0, 50) + '...');
        resolve(result);
      };
      reader.onerror = () => {
        console.error('❌ Failed to convert image to base64');
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(blob);
    });

    // Validate the data URI format
    if (!base64.startsWith('data:image/')) {
      throw new Error('Invalid data URI format generated');
    }

    return base64;
  } catch (error) {
    console.error('❌ Image conversion failed:', error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validates image URI format
 * @param imageUri - The image URI to validate
 * @returns boolean - True if valid
 */
export const validateImageUri = (imageUri: string | null): boolean => {
  if (!imageUri) return false;
  
  // Check if it's a valid URI
  try {
    const url = new URL(imageUri);
    return url.protocol === 'file:' || url.protocol === 'content:' || url.protocol === 'data:';
  } catch {
    return false;
  }
};

/**
 * Common error messages for AI analysis failures
 */
export const AI_ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your internet connection and try again.',
  API_LIMIT: 'API limit reached. Please try again later.',
  INVALID_IMAGE: 'Invalid image format. Please use a clear JPEG or PNG image.',
  PROCESSING: 'Image processing failed. Please try again with a different image.',
  GENERIC: 'Analysis failed. Please try again with a clear, well-lit photo.',
} as const;

/**
 * Gets appropriate error message based on error type
 * @param error - The error object or message
 * @returns string - User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return AI_ERROR_MESSAGES.NETWORK;
    }
    if (message.includes('quota') || message.includes('limit')) {
      return AI_ERROR_MESSAGES.API_LIMIT;
    }
    if (message.includes('image') || message.includes('format')) {
      return AI_ERROR_MESSAGES.INVALID_IMAGE;
    }
    if (message.includes('processing') || message.includes('parse')) {
      return AI_ERROR_MESSAGES.PROCESSING;
    }
  }
  
  return AI_ERROR_MESSAGES.GENERIC;
};

export default {
  convertImageToDataUri,
  validateImageUri,
  getErrorMessage,
  AI_ERROR_MESSAGES,
};
