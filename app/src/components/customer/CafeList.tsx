import React, { useState, useEffect } from 'react';
import { cafeApi } from '@/services/api';
import type { Cafe } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CafeListProps {
    onSelectCafe: (cafe: Cafe) => void;
}

const CafeList: React.FC<CafeListProps> = ({ onSelectCafe }) => {
    const [cafes, setCafes] = useState<Cafe[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCafes = async () => {
            try {
                const response = await cafeApi.getAll({ limit: 50 });
                if (response.data.success) {
                    // Filter to only active cafes
                    const activeCafes = response.data.data.data.filter(c => c.isActive);
                    setCafes(activeCafes);
                }
            } catch (error) {
                toast.error('Failed to load cafes nearest to you');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCafes();
    }, []);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-32 w-full rouded-none" />
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (cafes.length === 0) {
        return (
            <div className="text-center p-12 bg-muted/20 rounded-xl border border-dashed">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No active cafés found</h3>
                <p className="text-muted-foreground">Check back later when cafés re-open on our platform.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Order from nearby cafés</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cafes.map((cafe) => (
                    <Card
                        key={cafe._id}
                        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                        onClick={() => onSelectCafe(cafe)}
                    >
                        <div className="h-32 bg-muted relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                                src={cafe.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80'}
                                alt={cafe.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={cafe.logo} />
                                    <AvatarFallback>{cafe.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-white">
                                    <h3 className="font-bold text-lg leading-tight">{cafe.name}</h3>
                                    <div className="flex items-center text-white/80 text-xs mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>{cafe.settings?.openingTime || '09:00'} - {cafe.settings?.closingTime || '22:00'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground truncate flex-1">
                                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                <span className="truncate">{cafe.address.street}, {cafe.address.city}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CafeList;
