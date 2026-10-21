import type { SupabaseClient } from '@supabase/supabase-js';

import type { AmcContract, AmcContractQuery, AmcContracts } from '@tecbunny/contracts';

import { ServiceError } from './errors';

type AmcContractRow = Omit<AmcContract, 'status' | 'days_remaining'> & { status?: string | null };

function computedStatus(contract: AmcContractRow, now: number) {
  if (contract.status && contract.status !== 'ACTIVE') {
    return { status: contract.status, days_remaining: daysUntil(contract.end_date, now) };
  }
  const days_remaining = daysUntil(contract.end_date, now);
  if (days_remaining === null) return { status: contract.status || 'DRAFT', days_remaining: null };
  if (days_remaining < 0) return { status: 'EXPIRED', days_remaining };
  if (days_remaining <= 30) return { status: 'EXPIRING', days_remaining };
  return { status: 'ACTIVE', days_remaining };
}

function daysUntil(date: string | null | undefined, now: number): number | null {
  if (!date) return null;
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.ceil((timestamp - now) / 86_400_000);
}

function escapeIlike(value: string) {
  return value.replace(/[\\%_,()"']/g, '\\$&');
}

export function summarizeAmcContracts(rows: AmcContractRow[], query: AmcContractQuery, now = Date.now()): AmcContracts {
  const search = query.search?.trim().toLocaleLowerCase();
  const searched = rows
    .filter((contract) => {
      if (!search) return true;
      return [contract.customer_name, contract.contract_number]
        .some((value) => value?.toLocaleLowerCase().includes(search));
    })
    .map((contract) => ({ ...contract, ...computedStatus(contract, now) }))
    .sort((a, b) => {
      if (!a.end_date) return b.end_date ? 1 : 0;
      if (!b.end_date) return -1;
      return a.end_date.localeCompare(b.end_date);
    });

  const counts = {
    ACTIVE: searched.filter((contract) => contract.status === 'ACTIVE').length,
    EXPIRING: searched.filter((contract) => contract.status === 'EXPIRING').length,
    EXPIRED: searched.filter((contract) => contract.status === 'EXPIRED').length,
  };
  const contracts = query.status === 'ALL'
    ? searched
    : searched.filter((contract) => contract.status === query.status);

  return { contracts: contracts as AmcContract[], counts };
}

/** List AMC contracts. Search, status derivation, summary counts and ordering are API-owned. */
export async function listAmcContracts(db: SupabaseClient, query: AmcContractQuery): Promise<AmcContracts> {
  let builder = db
    .from('amc_contracts')
    .select('id,customer_name,customer_phone,contract_number,contract_type,end_date,status,annual_value');

  if (query.search) {
    const value = escapeIlike(query.search.trim());
    builder = builder.or(`customer_name.ilike.%${value}%,contract_number.ilike.%${value}%`);
  }

  const { data, error } = await builder.order('end_date', { ascending: true, nullsFirst: false });
  if (error) throw new ServiceError(502, 'UPSTREAM_ERROR', 'Failed to load AMC contracts.');
  return summarizeAmcContracts((data ?? []) as AmcContractRow[], query);
}
