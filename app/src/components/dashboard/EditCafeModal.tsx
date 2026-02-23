import React, { useState, useRef } from 'react';
import { useCafe } from '@/context/CafeContext';
import { uploadApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Edit2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface EditCafeModalProps {
    children?: React.ReactNode;
}

const EditCafeModal: React.FC<EditCafeModalProps> = ({ children }) => {
    const { cafe, updateCafe, createCafe } = useCafe();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: cafe?.name || '',
        logo: cafe?.logo || '',
        upiId: cafe?.paymentDetails?.upiId || '',
        bankAccount: cafe?.paymentDetails?.bankDetails?.accountNumber || '',
        ifscCode: cafe?.paymentDetails?.bankDetails?.ifscCode || '',
        accountName: cafe?.paymentDetails?.bankDetails?.accountName || '',
    });

    const [previewLogo, setPreviewLogo] = useState(cafe?.logo || '');

    // Reset form when opened with new cafe data
    React.useEffect(() => {
        if (isOpen && cafe) {
            setFormData({
                name: cafe.name || '',
                logo: cafe.logo || '',
                upiId: cafe.paymentDetails?.upiId || '',
                bankAccount: cafe.paymentDetails?.bankDetails?.accountNumber || '',
                ifscCode: cafe.paymentDetails?.bankDetails?.ifscCode || '',
                accountName: cafe.paymentDetails?.bankDetails?.accountName || '',
            });
            setPreviewLogo(cafe.logo || '');
        }
    }, [isOpen, cafe]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        setPreviewLogo(URL.createObjectURL(file));

        try {
            setIsLoading(true);
            const res = await uploadApi.uploadImage(file, 'cafes');
            setFormData(prev => ({ ...prev, logo: res.data.data.url }));
            toast.success('Logo uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload logo');
            setPreviewLogo(formData.logo); // Revert preview
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const payload = {
                name: formData.name,
                logo: formData.logo,
                paymentDetails: {
                    ...(cafe?.paymentDetails || {}),
                    upiId: formData.upiId,
                    bankDetails: {
                        accountNumber: formData.bankAccount,
                        ifscCode: formData.ifscCode,
                        accountName: formData.accountName,
                        bankName: cafe?.paymentDetails?.bankDetails?.bankName || '',
                    }
                }
            };

            if (cafe) {
                await updateCafe(payload);
            } else {
                await createCafe(payload);
            }

            setIsOpen(false);
        } catch (error) {
            // Error handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{cafe ? 'Edit Café Profile' : 'Create Café Profile'}</DialogTitle>
                    <DialogDescription>
                        {cafe ? 'Update your café details, logo, and payment information.' : 'Enter your café details to get started on the platform.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                            <AvatarImage src={previewLogo} />
                            <AvatarFallback className="bg-muted">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                            Change Logo
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Café Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                            id="upiId"
                            placeholder="merchant@upi"
                            value={formData.upiId}
                            onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountName">Bank Account Name</Label>
                        <Input
                            id="accountName"
                            value={formData.accountName}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bankAccount">Account Number</Label>
                            <Input
                                id="bankAccount"
                                value={formData.bankAccount}
                                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ifscCode">IFSC Code</Label>
                            <Input
                                id="ifscCode"
                                value={formData.ifscCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCafeModal;
