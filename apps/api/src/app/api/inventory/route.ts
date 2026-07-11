import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole, type RoleCheckOptions } from "@tecbunny/core/server-role-guard";
import { InventoryService } from "@tecbunny/core/server";
import { BaseSupabaseClient, SupabaseInventoryRepository } from "@tecbunny/infra";
import { envConfig } from "@tecbunny/core/environment-validator";

const INVENTORY_ACCESS: RoleCheckOptions = {
  allowedRoles: ['sales', 'manager'],
  minimumRole: 'admin'
};

function getInventoryService() {
  const baseClient = new BaseSupabaseClient({
    url: envConfig.supabase.url,
    key: envConfig.supabase.serviceRoleKey || envConfig.supabase.anonKey
  });
  const repository = new SupabaseInventoryRepository(baseClient);
  return new InventoryService(repository);
}

export async function GET(_request: NextRequest) {
  try {
    const access = await requireApiRole(INVENTORY_ACCESS);
    if ('error' in access) {
      return access.error;
    }
    
    const inventoryService = getInventoryService();
    const { inventory } = await inventoryService.getInventorySummary();

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Inventory API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiRole(INVENTORY_ACCESS);
    if ('error' in access) {
      return access.error;
    }
    
    const { product_id, movement_type, quantity, notes, reference_type } = await request.json();

    if (!product_id || !movement_type || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, movement_type, quantity' },
        { status: 400 }
      );
    }

    const inventoryService = getInventoryService();
    
    try {
      const result = await inventoryService.adjustStock({
        productId: product_id,
        movementType: movement_type,
        quantity: Number(quantity),
        referenceType: reference_type,
        notes: notes,
        userId: access.session?.user.id as string
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Stock movement recorded successfully',
        movement_id: result.movementId 
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireApiRole(INVENTORY_ACCESS);
    if ('error' in access) {
      return access.error;
    }
    if (!access.role || !['manager', 'admin', 'superadmin'].includes(access.role)) {
      return NextResponse.json({ error: 'Only managers and administrators can perform absolute stock adjustments' }, { status: 403 });
    }
    
    const { product_id, new_quantity } = await request.json();

    if (!product_id || new_quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id and new_quantity' },
        { status: 400 }
      );
    }

    const inventoryService = getInventoryService();
    
    try {
      const result = await inventoryService.setAbsoluteStock({
        productId: product_id,
        newQuantity: Number(new_quantity),
        userId: access.session?.user.id as string
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Inventory updated successfully',
        new_quantity: result.newQuantity,
        result: result.movementId
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Inventory PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
