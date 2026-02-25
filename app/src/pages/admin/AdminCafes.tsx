// Restroon - Admin Cafes Management
import React, { useState, useEffect } from 'react';
import { cafeApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Search,
  Store,
  MoreVertical,
  Eye,
  Edit,
  Power,
  PowerOff,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Cafe } from '@/types';

const AdminCafes: React.FC = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const response = await cafeApi.getAll({ limit: 100 });
      if (response.data.success) {
        setCafes(response.data.data.data);
      }
    } catch (error) {
      toast.error('Failed to load cafes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCafes = cafes.filter(
    (cafe) => {
      const ownerStr = typeof cafe.owner === 'string' ? cafe.owner : (cafe.owner as any)?.name || '';
      return cafe.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ownerStr.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleToggleStatus = async () => {
    if (!selectedCafe) return;

    try {
      const response = await cafeApi.toggleStatus(selectedCafe._id);

      if (response.data.success) {
        setCafes((prev) =>
          prev.map((c) =>
            c._id === selectedCafe._id ? { ...c, isActive: !c.isActive } : c
          )
        );
        toast.success(
          `Cafe ${selectedCafe.isActive ? 'deactivated' : 'activated'} successfully`
        );
        setIsToggleDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cafe status');
    }
  };

  const openDetail = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setIsDetailOpen(true);
  };

  const confirmToggle = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setIsToggleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cafes</h2>
          <p className="text-muted-foreground">
            Manage all cafes on the platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cafes</p>
                <p className="text-2xl font-bold">{cafes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {cafes.filter((c) => c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {cafes.filter((c) => !c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cafes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Cafes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredCafes.map((cafe) => (
                <div key={cafe._id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cafe.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              cafe.isActive
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-gray-500/10 text-gray-600'
                            }
                          >
                            {cafe.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cafe.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {cafe.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cafe.address.city}, {cafe.address.state}
                            </span>
                          )}
                          {cafe.contact?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {cafe.contact.phone}
                            </span>
                          )}
                          {cafe.contact?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {cafe.contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(cafe)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmToggle(cafe)}
                      >
                        {cafe.isActive ? (
                          <PowerOff className="h-4 w-4 text-red-600" />
                        ) : (
                          <Power className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCafes.length === 0 && (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No cafes found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cafe Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCafe?.name}
              <Badge
                variant="outline"
                className={
                  selectedCafe?.isActive
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-gray-500/10 text-gray-600'
                }
              >
                {selectedCafe?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedCafe && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCafe.description || 'No description'}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedCafe.contact?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedCafe.contact.phone}
                      </p>
                    )}
                    {selectedCafe.contact?.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedCafe.contact.email}
                      </p>
                    )}
                    {selectedCafe.contact?.website && (
                      <p className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {selectedCafe.contact.website}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Address</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {selectedCafe.address ? (
                      <>
                        <p>{selectedCafe.address.street}</p>
                        <p>
                          {selectedCafe.address.city}, {selectedCafe.address.state}
                        </p>
                        <p>
                          {selectedCafe.address.zipCode}, {selectedCafe.address.country}
                        </p>
                      </>
                    ) : (
                      <p>No address provided.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Business Hours</h4>
                <div className="flex items-center gap-4 text-sm">
                  {selectedCafe.settings ? (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedCafe.settings.openingTime} - {selectedCafe.settings.closingTime}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not configured</span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₹4,56,789</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button variant={selectedCafe?.isActive ? 'destructive' : 'default'}>
              {selectedCafe?.isActive ? 'Deactivate Cafe' : 'Activate Cafe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCafe?.isActive ? 'Deactivate Cafe' : 'Activate Cafe'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedCafe?.isActive ? 'deactivate' : 'activate'}{' '}
              <strong>{selectedCafe?.name}</strong>?
              {selectedCafe?.isActive && (
                <p className="text-red-600 mt-2">
                  This will prevent the cafe from receiving new orders.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsToggleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedCafe?.isActive ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
            >
              {selectedCafe?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCafes;
