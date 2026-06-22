import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { INITIAL_BASES, INITIAL_LOGS } from '../src/data';
import { Base, WalkLog } from '../src/types';

config({ path: '.env.local' });
config();

type BaseRow = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  cover_image: string;
};

type LogRow = {
  id: string;
  base_id: string;
  date: string;
  weather: WalkLog['weather'];
  weather_text: string;
  tags: string[];
  photos: string[] | null;
  content: string;
};

const apply = process.argv.includes('--apply');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local.');
}

function baseAlias(baseId: string) {
  const numberedBase = /^base-(\d+)$/.exec(baseId);

  if (numberedBase) return `b${numberedBase[1].padStart(2, '0')}`;
  if (baseId === 'roadside-observations') return 'roadside';

  return baseId.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function compareLogs(
  left: { log: WalkLog; originalIndex: number },
  right: { log: WalkLog; originalIndex: number }
) {
  const baseCompare = baseAlias(left.log.baseId).localeCompare(baseAlias(right.log.baseId));
  if (baseCompare !== 0) return baseCompare;

  const dateCompare = left.log.date.localeCompare(right.log.date);
  if (dateCompare !== 0) return dateCompare;

  return left.originalIndex - right.originalIndex;
}

function normalizeLogIds(logs: WalkLog[]) {
  const sequenceByBaseDate = new Map<string, number>();
  const sortedLogs = logs
    .map((log, originalIndex) => ({ log, originalIndex }))
    .sort(compareLogs);

  return sortedLogs.map(({ log }) => {
    const alias = baseAlias(log.baseId);
    const sequenceKey = `${alias}-${log.date}`;
    const sequence = (sequenceByBaseDate.get(sequenceKey) ?? 0) + 1;
    sequenceByBaseDate.set(sequenceKey, sequence);

    return {
      ...log,
      id: `log-${alias}-${log.date}-${String(sequence).padStart(2, '0')}`
    };
  });
}

function toBaseRow(base: Base): BaseRow {
  return {
    id: base.id,
    title: base.title,
    subtitle: base.subtitle,
    description: base.description,
    location: base.location,
    cover_image: base.coverImage
  };
}

function toLogRow(log: WalkLog): LogRow {
  return {
    id: log.id,
    base_id: log.baseId,
    date: log.date,
    weather: log.weather,
    weather_text: log.weatherText,
    tags: log.tags,
    photos: log.photos ?? null,
    content: log.content
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

async function main() {
  const normalizedLogs = normalizeLogIds(INITIAL_LOGS);
  const baseRows = INITIAL_BASES.map(toBaseRow);
  const logRows = normalizedLogs.map(toLogRow);
  const oldLogIds = INITIAL_LOGS.map((log) => log.id);
  const normalizedLogIds = normalizedLogs.map((log) => log.id);
  const seedLogIds = unique([...oldLogIds, ...normalizedLogIds]);

  console.log(`Bases to seed: ${baseRows.length}`);
  console.log(`Logs to replace: ${logRows.length}`);
  console.log('Log ID examples:');
  normalizedLogs.slice(0, 6).forEach((log) => {
    const original = INITIAL_LOGS.find(
      (item) => item.baseId === log.baseId && item.date === log.date && item.content === log.content
    );
    console.log(`  ${original?.id ?? '(unknown)'} -> ${log.id}`);
  });

  if (!apply) {
    console.log('\nDry run only. Run with "-- --apply" to write to Supabase.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const deleteLogsResult = await supabase.from('logs').delete().in('id', seedLogIds);
  if (deleteLogsResult.error) throw deleteLogsResult.error;

  const existingBasesResult = await supabase.from('bases').select('id');
  if (existingBasesResult.error) throw existingBasesResult.error;

  const existingBaseIds = new Set(
    (existingBasesResult.data ?? []).map((row) => String(row.id))
  );
  const missingBaseRows = baseRows.filter((row) => !existingBaseIds.has(row.id));

  if (missingBaseRows.length > 0) {
    const insertBasesResult = await supabase.from('bases').insert(missingBaseRows);
    if (insertBasesResult.error) throw insertBasesResult.error;
  }

  const insertLogsResult = await supabase.from('logs').insert(logRows);
  if (insertLogsResult.error) throw insertLogsResult.error;

  console.log(`\nSeed complete. Inserted ${missingBaseRows.length} missing bases and ${logRows.length} logs.`);
}

main().catch((error) => {
  console.error('\nSeed failed.');
  console.error(error);
  process.exitCode = 1;
});
