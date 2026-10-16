import type { Blueprint, BlueprintListData } from '@tecbunny/contracts';
import type { SupabaseClient } from '@tecbunny/database';

import { ServiceError } from './errors';

export async function listPublishedBlueprints(db: SupabaseClient): Promise<BlueprintListData> {
  const { data, error } = await db.from('published_blueprints').select('id, updated_at');
  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load blueprints.');
  return { blueprints: (data ?? []) as BlueprintListData['blueprints'] };
}

export async function getPublishedBlueprint(db: SupabaseClient, id: string): Promise<Blueprint> {
  const { data, error } = await db
    .from('published_blueprints')
    .select('*, profiles:creator_id(name, avatar_url)')
    .eq('id', id)
    .maybeSingle();

  // Malformed ids (e.g. non-uuid) surface as query errors; for a public lookup they are simply "not found".
  if (error && error.code !== '22P02') throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load blueprint.');
  if (!data) throw new ServiceError(404, 'NOT_FOUND', 'Blueprint not found.');
  return data as Blueprint;
}
