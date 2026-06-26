import { getSupabaseClient } from '../lib/supabase';
import { Base, WalkLog } from '../types';

const PHOTO_BUCKET = import.meta.env.VITE_SUPABASE_PHOTO_BUCKET ?? 'walk-log-photos';
const PHOTO_MAX_DIMENSION = 1280;
const PHOTO_COMPRESSION_QUALITY = 0.72;
const PHOTO_UPLOAD_TIMEOUT_MS = 45000;

type BaseRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  location: string | null;
  cover_image: string | null;
};

type LogRow = {
  id: string;
  base_id: string;
  date: string | null;
  weather: WalkLog['weather'] | null;
  weather_text: string | null;
  tags: string[] | null;
  photos: string[] | null;
  content: string | null;
};

function mapBase(row: BaseRow): Base {
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    location: row.location ?? '',
    coverImage: row.cover_image ?? ''
  };
}

function mapLog(row: LogRow): WalkLog {
  return {
    id: row.id,
    baseId: row.base_id,
    date: row.date ?? '',
    weather: row.weather ?? 'sunny',
    weatherText: row.weather_text ?? '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    photos: Array.isArray(row.photos) ? row.photos : undefined,
    content: row.content ?? ''
  };
}

export async function getBases(): Promise<Base[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bases')
    .select('id,title,subtitle,description,location,cover_image')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapBase(row as BaseRow));
}

export async function getLogs(): Promise<WalkLog[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .select('id,base_id,date,weather,weather_text,tags,photos,content')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapLog(row as LogRow));
}

export async function createBase(base: Base): Promise<Base> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bases')
    .insert({
      id: base.id,
      title: base.title,
      subtitle: base.subtitle,
      description: base.description,
      location: base.location,
      cover_image: base.coverImage
    })
    .select('id,title,subtitle,description,location,cover_image')
    .single();

  if (error) throw error;
  return mapBase(data as BaseRow);
}

export async function updateBase(base: Base): Promise<Base> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bases')
    .update({
      title: base.title,
      subtitle: base.subtitle,
      description: base.description,
      location: base.location,
      cover_image: base.coverImage
    })
    .eq('id', base.id)
    .select('id,title,subtitle,description,location,cover_image')
    .single();

  if (error) throw error;
  return mapBase(data as BaseRow);
}

export async function deleteBase(baseId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bases')
    .delete()
    .eq('id', baseId)
    .select('id');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('没有删除任何基地。请确认你已用作者账号登录，并且 RLS delete 策略允许当前用户删除 bases。');
  }
}

export async function createLog(log: WalkLog): Promise<WalkLog> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .insert({
      id: log.id,
      base_id: log.baseId,
      date: log.date,
      weather: log.weather,
      weather_text: log.weatherText,
      tags: log.tags,
      photos: log.photos ?? null,
      content: log.content
    })
    .select('id,base_id,date,weather,weather_text,tags,photos,content')
    .single();

  if (error) throw error;
  return mapLog(data as LogRow);
}

export async function updateLog(log: WalkLog): Promise<WalkLog> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .update({
      base_id: log.baseId,
      date: log.date,
      weather: log.weather,
      weather_text: log.weatherText,
      tags: log.tags,
      photos: log.photos ?? null,
      content: log.content
    })
    .eq('id', log.id)
    .select('id,base_id,date,weather,weather_text,tags,photos,content')
    .single();

  if (error) throw error;
  return mapLog(data as LogRow);
}

export async function deleteLog(logId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .delete()
    .eq('id', logId)
    .select('id');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('没有删除任何记录。请确认你已用作者账号登录，并且 RLS delete 策略允许当前用户删除 logs。');
  }
}

export async function deleteLogs(logIds: string[]): Promise<void> {
  if (logIds.length === 0) return;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('logs')
    .delete()
    .in('id', logIds)
    .select('id');

  if (error) throw error;
  if (!data || data.length !== logIds.length) {
    throw new Error('部分记录没有被删除。请确认你已用作者账号登录，并且 RLS delete 策略允许当前用户删除 logs。');
  }
}

type UploadablePhoto = {
  body: Blob;
  extension: string;
  contentType: string;
};

function fileExtension(fileName: string, contentType?: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;

  const mimeExtension = contentType?.split('/').pop()?.toLowerCase();
  return mimeExtension && /^[a-z0-9]+$/.test(mimeExtension) ? mimeExtension : 'jpg';
}

function makePhotoPath(extension: string, folder = 'logs') {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${folder}/${year}/${month}/${Date.now()}-${random}.${extension}`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    image.decoding = 'async';

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to decode image before upload.'));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function isCompressiblePhoto(file: File) {
  return (
    file.type.startsWith('image/') &&
    file.type !== 'image/heic' &&
    file.type !== 'image/heif' &&
    file.type !== 'image/gif' &&
    file.type !== 'image/svg+xml'
  );
}

function uploadTimeout(fileName: string) {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error(`Photo upload timed out: ${fileName || 'unnamed photo'}`));
    }, PHOTO_UPLOAD_TIMEOUT_MS);
  });
}

async function compressPhoto(file: File): Promise<UploadablePhoto> {
  const fallback: UploadablePhoto = {
    body: file,
    extension: fileExtension(file.name, file.type),
    contentType: file.type || 'application/octet-stream'
  };

  if (!isCompressiblePhoto(file)) return fallback;

  try {
    const image = await loadImage(file);
    const scale = Math.min(
      1,
      PHOTO_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return fallback;

    context.drawImage(image, 0, 0, width, height);

    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', PHOTO_COMPRESSION_QUALITY);
    if (jpegBlob && jpegBlob.size < file.size) {
      return {
        body: jpegBlob,
        extension: 'jpg',
        contentType: 'image/jpeg'
      };
    }
  } catch (error) {
    console.warn('Image compression failed; uploading original file.', error);
  }

  return fallback;
}

export async function uploadLogPhotos(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const supabase = getSupabaseClient();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const uploadablePhoto = await compressPhoto(file);
    const path = makePhotoPath(uploadablePhoto.extension);
    const uploadPromise = supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, uploadablePhoto.body, {
        cacheControl: '31536000',
        contentType: uploadablePhoto.contentType,
        upsert: false
      });
    const { error } = await Promise.race([uploadPromise, uploadTimeout(file.name)]);

    if (error) throw error;

    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

export async function uploadBaseCover(file: File): Promise<string> {
  const supabase = getSupabaseClient();
  const uploadablePhoto = await compressPhoto(file);
  const path = makePhotoPath(uploadablePhoto.extension, 'bases');
  const uploadPromise = supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, uploadablePhoto.body, {
      cacheControl: '31536000',
      contentType: uploadablePhoto.contentType,
      upsert: false
    });
  const { error } = await Promise.race([uploadPromise, uploadTimeout(file.name)]);

  if (error) throw error;

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
