// Restroon - Menu Management Page
import React, { useState, useRef } from 'react';
import { useCafe } from '@/context/CafeContext';
import { useMenu } from '@/hooks/useMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Image as ImageIcon,
  UtensilsCrossed,
  Leaf,
  Flame,
  Wheat,
  Clock,
  DollarSign,
  GripVertical,
  Check,
  X,
} from 'lucide-react';
import type { Product, Category, Addon, ProductVariant } from '@/types';

const Menu: React.FC = () => {
  const { cafe } = useCafe();
  const {
    categories,
    products,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
  } = useMenu({ cafeId: cafe?._id });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'category'; id: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    category: '',
    preparationTime: '',
    isAvailable: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    image: null as File | null,
    imagePreview: '',
    addons: [] as Addon[],
    variants: [] as ProductVariant[],
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
      (typeof product.category === 'string' ? product.category : product.category._id) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      category: '',
      preparationTime: '',
      isAvailable: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      image: null,
      imagePreview: '',
      addons: [],
      variants: [],
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        category: typeof product.category === 'string' ? product.category : product.category._id,
        preparationTime: product.preparationTime?.toString() || '',
        isAvailable: product.isAvailable,
        isVegan: product.isVegan || false,
        isGlutenFree: product.isGlutenFree || false,
        isSpicy: product.isSpicy || false,
        image: null,
        imagePreview: product.image || '',
        addons: product.addons || [],
        variants: product.variants || [],
      });
    } else {
      setEditingProduct(null);
      resetProductForm();
    }
    setIsProductDialogOpen(true);
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setIsCategoryDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cafe?._id) {
      toast.error('Cafe profile is required to add products.');
      return;
    }

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('cafe', cafe?._id || '');
    formData.append('isAvailable', productForm.isAvailable.toString());
    formData.append('isVegan', productForm.isVegan.toString());
    formData.append('isGlutenFree', productForm.isGlutenFree.toString());
    formData.append('isSpicy', productForm.isSpicy.toString());

    if (productForm.costPrice) formData.append('costPrice', productForm.costPrice);
    if (productForm.preparationTime) formData.append('preparationTime', productForm.preparationTime);
    if (productForm.image) formData.append('image', productForm.image);
    if (productForm.addons.length > 0) formData.append('addons', JSON.stringify(productForm.addons));
    if (productForm.variants.length > 0) formData.append('variants', JSON.stringify(productForm.variants));

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setIsProductDialogOpen(false);
      resetProductForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cafe?._id) {
      toast.error('Cafe profile is required to add categories.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, {
          ...editingCategory,
          name: categoryForm.name,
          description: categoryForm.description,
        });
      } else {
        await createCategory({
          name: categoryForm.name,
          description: categoryForm.description,
          cafe: cafe?._id || '',
          sortOrder: categories.length,
          isActive: true,
        });
      }
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'product') {
        await deleteProduct(itemToDelete.id);
      } else {
        await deleteCategory(itemToDelete.id);
      }
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const confirmDelete = (type: 'product' | 'category', id: string) => {
    setItemToDelete({ type, id });
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage your café's menu, categories, and products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCategoryDialog()} disabled={!cafe?._id}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button
            onClick={() => {
              if (categories.length === 0) {
                toast.error('Please create a category first before adding products.');
                return;
              }
              openProductDialog();
            }}
            disabled={!cafe?._id || categories.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {!cafe?._id && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6 text-center space-y-4">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-destructive/80" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-destructive">Cafe Profile Incomplete</h3>
              <p className="text-sm text-destructive/80">
                You need to set up your Cafe Profile completely before you can start adding menus and categories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <X className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => !p.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="aspect-[4/3] w-full relative bg-muted overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {product.isVegan && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <Leaf className="h-3 w-3 mr-1" />
                    Vegan
                  </Badge>
                )}
                {product.isSpicy && (
                  <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                    <Flame className="h-3 w-3 mr-1" />
                    Spicy
                  </Badge>
                )}
                {product.isGlutenFree && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                    <Wheat className="h-3 w-3 mr-1" />
                    GF
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openProductDialog(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => confirmDelete('product', product._id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-lg font-bold">₹{product.price}</p>
                  {product.preparationTime && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {product.preparationTime} min
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={product.isAvailable}
                    onCheckedChange={() => toggleProductAvailability(product._id)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your menu categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {products.filter((p) =>
                        typeof p.category === 'string'
                          ? p.category === category._id
                          : p.category._id === category._id
                      ).length}{' '}
                      products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openCategoryDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete('category', category._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No categories yet. Create your first category to organize your menu.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product details below'
                : 'Fill in the details to add a new product'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {productForm.imagePreview ? (
                  <img
                    src={productForm.imagePreview}
                    alt="Preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.costPrice}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, costPrice: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparationTime">Prep Time (min)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  min="0"
                  value={productForm.preparationTime}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, preparationTime: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Dietary Options */}
            <div className="space-y-3">
              <Label>Dietary Information</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={productForm.isVegan}
                    onCheckedChange={(checked) =>
                      setProductForm((prev) => ({ ...prev, isVegan: checked }))
                    }
                  />
                  <span className="text-sm">Vegan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={productForm.isGlutenFree}
                    onCheckedChange={(checked) =>
                      setProductForm((prev) => ({ ...prev, isGlutenFree: checked }))
                    }
                  />
                  <span className="text-sm">Gluten Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={productForm.isSpicy}
                    onCheckedChange={(checked) =>
                      setProductForm((prev) => ({ ...prev, isSpicy: checked }))
                    }
                  />
                  <span className="text-sm">Spicy</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <Switch
                checked={productForm.isAvailable}
                onCheckedChange={(checked) =>
                  setProductForm((prev) => ({ ...prev, isAvailable: checked }))
                }
              />
              <span className="text-sm">Available for ordering</span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Category Name *</Label>
              <Input
                id="catName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDescription">Description</Label>
              <Input
                id="catDescription"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;
