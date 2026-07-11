import { IInventoryRepository } from '@tecbunny/types';
import { BaseSupabaseClient } from '../supabase/base-client';

export class SupabaseInventoryRepository implements IInventoryRepository {
  constructor(private readonly baseClient: BaseSupabaseClient) {}

  async getInventorySummary(): Promise<any[]> {
    const { data, error } = await this.baseClient.rawClient
      .from('inventory_items')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getProductsFallback(): Promise<any[]> {
    const { data, error } = await this.baseClient.rawClient
      .from('products')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async recordAtomicStockMovement(params: {
    productId: string;
    movementType: string;
    quantity: number;
    referenceType: string;
    notes: string;
    createdBy: string | null;
  }): Promise<string> {
    const { data, error } = await this.baseClient.rawClient.rpc('record_atomic_stock_movement', {
      p_product_id: params.productId,
      p_movement_type: params.movementType,
      p_quantity: params.quantity,
      p_reference_id: null,
      p_reference_type: params.referenceType,
      p_notes: params.notes,
      p_allow_negative: false,
      p_created_by: params.createdBy
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
