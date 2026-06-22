import { supabase } from '../lib/supabase';
import { Base, WalkLog } from '../types';

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
  const { data, error } = await supabase
    .from('bases')
    .select('id,title,subtitle,description,location,cover_image')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapBase(row as BaseRow));
}

export async function getLogs(): Promise<WalkLog[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('id,base_id,date,weather,weather_text,tags,photos,content')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapLog(row as LogRow));
}

export async function createBase(base: Base): Promise<Base> {
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

export async function createLog(log: WalkLog): Promise<WalkLog> {
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

export async function deleteLog(logId: string): Promise<void> {
  const { error } = await supabase.from('logs').delete().eq('id', logId);

  if (error) throw error;
}
