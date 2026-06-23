import { Metadata } from 'next';
import CustomSetupOffersManager from '@/components/superadmin/CustomSetupOffersManager';

export const metadata: Metadata = {
  title: 'Custom Setup Offers | Superadmin',
  description: 'Manage special offers and discounts for custom setups',
};

export default function CustomSetupOffersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <CustomSetupOffersManager />
    </div>
  );
}
