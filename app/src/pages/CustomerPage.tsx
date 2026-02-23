// OrderSmartly - Customer Page
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Cafe } from '@/types';
import CafeList from '@/components/customer/CafeList';
import Storefront from '@/components/customer/Storefront';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Zap, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4 md:px-6 max-w-5xl mx-auto">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setSelectedCafe(null)}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold">OrderSmartly</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 px-2">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2 pb-1">
                                    <p className="font-medium text-sm">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                {(user?.role === 'cafe_owner' || user?.role === 'super_admin') && (
                                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Owner Dashboard
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 md:px-6 py-6 max-w-5xl mx-auto">
                {!selectedCafe ? (
                    <CafeList onSelectCafe={setSelectedCafe} />
                ) : (
                    <Storefront cafe={selectedCafe} onBack={() => setSelectedCafe(null)} />
                )}
            </main>
        </div>
    );
};

export default CustomerPage;
