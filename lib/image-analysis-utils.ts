import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Convert a local image URI to a data URI with base64 encoding.
 * @param uri Local file URI of the image.
 */
export async function convertImageToDataUri(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Fallback for web: fetch the image and convert to data URI
    const response = await fetch(uri);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert blob to data URI'));
      };
      reader.readAsDataURL(blob);
    });
  } else {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:image/jpeg;base64,${base64}`;
  }
}

/**
 * Extract a user-friendly message from an error.
 * @param error The error thrown.
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}
