
import { useState } from 'react';
import { GemTable } from './GemTable';
import { GemForm } from './GemForm';
import { ConsignmentCreation } from './ConsignmentCreation';
import { InvoiceCreation } from './InvoiceCreation';
import { useGems } from '@/hooks/useGems';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

type View = 'inventory' | 'gemCreation' | 'gemEdit' | 'invoiceCreation' | 'consignmentCreation';

export const Dashboard = () => {
  const { gems, loading, error, addGem, updateGem, deleteGem } = useGems();
  const [activeView, setActiveView] = useState<View>('inventory');
  const [selectedGem, setSelectedGem] = useState(null);
  const [selectedGemForInvoice, setSelectedGemForInvoice] = useState(null);
  const [selectedGemForConsignment, setSelectedGemForConsignment] = useState(null);

  const handleCreateGem = () => {
    setSelectedGem(null);
    setActiveView('gemCreation');
  };

  const handleEditGem = (gem) => {
    setSelectedGem(gem);
    setActiveView('gemEdit');
  };

  const handleDeleteGem = async (id) => {
    if (window.confirm('Are you sure you want to delete this gem?')) {
      const result = await deleteGem(id);
      if (result.success) {
        console.log('Gem deleted successfully');
      } else {
        alert(result.error || 'Failed to delete gem');
      }
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

  const getViewTitle = () => {
    switch (activeView) {
      case 'gemCreation':
        return 'Add New Gem';
      case 'gemEdit':
        return `Edit Gem - ${selectedGem?.stockId}`;
      case 'invoiceCreation':
        return 'Create Invoice';
      case 'consignmentCreation':
        return 'Create Consignment';
      default:
        return 'Gem Inventory Dashboard';
    }
  };

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {activeView !== 'inventory' && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Inventory</span>
            </Button>
          )}
          <h1 className="text-3xl font-bold text-slate-800">{getViewTitle()}</h1>
        </div>
        {activeView === 'inventory' && (
          <Button onClick={handleCreateGem} className="bg-diamond-gradient hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Gem
          </Button>
        )}
      </div>

      {loading && <div className="text-center">Loading gems...</div>}
      {error && <div className="text-red-500 text-center mb-4">Error: {error}</div>}

      {activeView === 'inventory' && !loading && (
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

      {activeView === 'invoiceCreation' && selectedGemForInvoice && (
        <InvoiceCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForInvoice}
        />
      )}

      {activeView === 'consignmentCreation' && selectedGemForConsignment && (
        <ConsignmentCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForConsignment}
        />
      )}
    </div>
  );
};
