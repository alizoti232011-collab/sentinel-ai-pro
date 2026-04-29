import { supabase } from './supabase';

/**
 * Upload PDF file to Supabase storage
 */
export async function uploadPDF(file: File, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}.pdf`;

    const { data, error } = await supabase.storage
      .from('journal-exports')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('journal-exports')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading PDF:', error);
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
}

/**
 * Upload user file to Supabase storage
 */
export async function uploadUserFile(file: File, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFile(bucket: string, filename: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, filename: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return data.publicUrl;
}
