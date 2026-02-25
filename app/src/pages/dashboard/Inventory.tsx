// Restroon - Inventory Management Page
import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  History,
  Minus,
  Plus as PlusIcon,
  ArrowUpDown,
  Box,
} from 'lucide-react';
import type { InventoryItem } from '@/types';

const Inventory: React.FC = () => {
  const { cafe } = useCafe();
  const {
    items,
    lowStockItems,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    addStock,
    removeStock,
    getLogs,
  } = useInventory({ cafeId: cafe?._id, showLowStock: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemLogs, setItemLogs] = useState<unknown[]>([]);
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockReason, setStockReason] = useState('');

  // Form state
  const [itemForm, setItemForm] = useState({
    name: '',
    unit: 'kg',
    currentStock: '',
    minStock: '',
    maxStock: '',
    costPerUnit: '',
    supplier: '',
  });

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetItemForm = () => {
    setItemForm({
      name: '',
      unit: 'kg',
      currentStock: '',
      minStock: '',
      maxStock: '',
      costPerUnit: '',
      supplier: '',
    });
  };

  const openItemDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        unit: item.unit,
        currentStock: item.currentStock.toString(),
        minStock: item.minStock.toString(),
        maxStock: item.maxStock.toString(),
        costPerUnit: item.costPerUnit.toString(),
        supplier: item.supplier || '',
      });
    } else {
      setEditingItem(null);
      resetItemForm();
    }
    setIsItemDialogOpen(true);
  };

  const openStockDialog = (item: InventoryItem, action: 'add' | 'remove') => {
    setSelectedItem(item);
    setStockAction(action);
    setStockQuantity('');
    setStockReason('');
    setIsStockDialogOpen(true);
  };

  const openLogsDialog = async (item: InventoryItem) => {
    setSelectedItem(item);
    const logs = await getLogs(item._id);
    setItemLogs(logs);
    setIsLogsDialogOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: itemForm.name,
      unit: itemForm.unit,
      currentStock: parseFloat(itemForm.currentStock) || 0,
      minStock: parseFloat(itemForm.minStock) || 0,
      maxStock: parseFloat(itemForm.maxStock) || 0,
      costPerUnit: parseFloat(itemForm.costPerUnit) || 0,
      cafe: cafe?._id || '',
      supplier: itemForm.supplier || undefined,
    };

    try {
      if (editingItem) {
        await updateItem(editingItem._id, data);
      } else {
        await createItem(data as Omit<InventoryItem, '_id' | 'createdAt' | 'updatedAt'>);
      }
      setIsItemDialogOpen(false);
      resetItemForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const quantity = parseFloat(stockQuantity);
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      if (stockAction === 'add') {
        await addStock(selectedItem._id, quantity, stockReason || 'Manual stock addition');
      } else {
        await removeStock(selectedItem._id, quantity, stockReason || 'Manual stock removal');
      }
      setIsStockDialogOpen(false);
      setStockQuantity('');
      setStockReason('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (item.currentStock <= item.minStock) {
      return { label: 'Low Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    }
    if (percentage < 30) {
      return { label: 'Running Low', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    }
    return { label: 'In Stock', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min(100, Math.max(0, (item.currentStock / item.maxStock) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Track and manage your café's ingredients and supplies
          </p>
        </div>
        <Button onClick={() => openItemDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Box className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">
                  {items.filter((i) => i.currentStock > i.minStock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingDown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Value</p>
                <p className="text-2xl font-bold">
                  ₹{items
                    .reduce((acc, item) => acc + item.currentStock * item.costPerUnit, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              The following items are running low and need to be restocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge
                  key={item._id}
                  variant="outline"
                  className="bg-red-500/10 text-red-600 border-red-500/20"
                >
                  {item.name} ({item.currentStock} {item.unit})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredItems.map((item) => {
                const status = getStockStatus(item);
                const percentage = getStockPercentage(item);
                
                return (
                  <div key={item._id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline" className={status.textColor}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cost: ₹{item.costPerUnit}/{item.unit}
                          {item.supplier && ` • Supplier: ${item.supplier}`}
                        </p>
                        
                        {/* Stock Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-muted-foreground">
                              Max: {item.maxStock} {item.unit}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openStockDialog(item, 'add')}
                          title="Add Stock"
                        >
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openStockDialog(item, 'remove')}
                          title="Remove Stock"
                        >
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openLogsDialog(item)}
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openItemDialog(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inventory items found</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first item to start tracking inventory
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={itemForm.name}
                onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <select
                  id="unit"
                  value={itemForm.unit}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Liter (L)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost per Unit (₹)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.costPerUnit}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, costPerUnit: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.currentStock}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, currentStock: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.minStock}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, minStock: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">Max Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.maxStock}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, maxStock: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={itemForm.supplier}
                onChange={(e) => setItemForm((prev) => ({ ...prev, supplier: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - Current: {selectedItem?.currentStock} {selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity ({selectedItem?.unit}) *</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                placeholder={stockAction === 'add' ? 'e.g., New delivery received' : 'e.g., Used in production'}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={stockAction === 'add' ? 'default' : 'destructive'}
              >
                {stockAction === 'add' ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Add Stock
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Remove Stock
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Stock History - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {itemLogs.length > 0 ? (
                (itemLogs as Array<{ _id: string; type: string; quantity: number; reason: string; createdAt: string; createdBy: { name: string } }>).map((log, index) => (
                  <div key={log._id || index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div
                      className={`p-2 rounded-full ${
                        log.type === 'in' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      {log.type === 'in' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {log.type === 'in' ? '+' : '-'}
                        {log.quantity} {selectedItem?.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">{log.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()} by {log.createdBy?.name || 'System'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No history available</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
