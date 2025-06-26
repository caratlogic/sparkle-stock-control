
import { useState } from 'react';
import { GemTable } from './GemTable';
import { GemForm } from './GemForm';
import { ConsignmentCreation } from './ConsignmentCreation';
import { InvoiceCreation } from './InvoiceCreation';
import { useGems } from '@/hooks/useGems';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type View = 'inventory' | 'gemCreation' | 'gemEdit' | 'invoiceCreation' | 'consignmentCreation';

export const Dashboard = () => {
  const { gems, loading, error, addGem, updateGem, deleteGem, refetch } = useGems();
  const [activeView, setActiveView] = useState<View>('inventory');
  const [selectedGem, setSelectedGem] = useState(null);
  const [selectedGemForInvoice, setSelectedGemForInvoice] = useState(null);
  const [selectedGemForConsignment, setSelectedGemForConsignment] = useState(null);

  const handleCreateGem = () => {
    setActiveView('gemCreation');
  };

  const handleEditGem = (gem) => {
    setSelectedGem(gem);
    setActiveView('gemEdit');
  };

  const handleDeleteGem = async (id) => {
    const result = await deleteGem(id);
    if (result.success) {
      // Don't call refetch here as deleteGem already does it
      console.log('Gem deleted successfully');
    } else {
      alert(result.error || 'Failed to delete gem');
    }
  };

  const handleCreateInvoice = (gem) => {
    setSelectedGemForInvoice(gem);
    setActiveView('invoiceCreation');
  };

  const handleCreateConsignment = (gem) => {
    setSelectedGemForConsignment(gem);
    setActiveView('consignmentCreation');
  };

  const handleGemSubmit = async (gemData) => {
    let result;
    if (selectedGem) {
      result = await updateGem(selectedGem.id, gemData);
    } else {
      result = await addGem(gemData);
    }

    if (result.success) {
      setActiveView('inventory');
      setSelectedGem(null);
      // Don't call refetch here as updateGem/addGem already does it
    } else {
      alert(result.error || 'Failed to save gem');
    }
  };

  const handleCancel = () => {
    setActiveView('inventory');
    setSelectedGem(null);
    setSelectedGemForInvoice(null);
    setSelectedGemForConsignment(null);
  };

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gem Inventory Dashboard</h1>
        {activeView === 'inventory' && (
          <Button onClick={handleCreateGem} className="bg-diamond-gradient hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Gem
          </Button>
        )}
      </div>

      {loading && <div className="text-center">Loading gems...</div>}
      {error && <div className="text-red-500 text-center">Error: {error}</div>}

      {activeView === 'inventory' && (
        <GemTable
          gems={gems}
          onEdit={handleEditGem}
          onDelete={handleDeleteGem}
          onCreateInvoice={handleCreateInvoice}
          onCreateConsignment={handleCreateConsignment}
        />
      )}

      {activeView === 'gemCreation' && (
        <GemForm
          onSubmit={handleGemSubmit}
          onCancel={handleCancel}
        />
      )}

      {activeView === 'gemEdit' && selectedGem && (
        <GemForm
          gem={selectedGem}
          onSubmit={handleGemSubmit}
          onCancel={handleCancel}
        />
      )}

      {activeView === 'invoiceCreation' && (
        <InvoiceCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForInvoice}
        />
      )}

      {activeView === 'consignmentCreation' && (
        <ConsignmentCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForConsignment}
        />
      )}
    </div>
  );
};
