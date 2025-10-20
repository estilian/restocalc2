import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Share2, Copy, MapPin, Trash } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import AppHeader from './AppHeader';

const EXCHANGE_RATE = 1.95583;

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  dueEUR: number;
  dueBGN: number;
  paidEUR: number;
  paidBGN: number;
  changeEUR: number;
  location?: { lat: number; lng: number };
}

// Extended mock data (25 items)
const mockHistory: HistoryItem[] = [
  {
    id: '1',
    date: '20.10.2025',
    time: '16:45',
    dueEUR: 45.80,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 100,
    changeEUR: 5.06,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '2',
    date: '20.10.2025',
    time: '14:23',
    dueEUR: 23.50,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 50,
    changeEUR: 2.04,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '3',
    date: '20.10.2025',
    time: '11:15',
    dueEUR: 15.20,
    dueBGN: 0,
    paidEUR: 20,
    paidBGN: 0,
    changeEUR: 4.80,
  },
  {
    id: '4',
    date: '19.10.2025',
    time: '18:45',
    dueEUR: 0,
    dueBGN: 45.99,
    paidEUR: 10,
    paidBGN: 20,
    changeEUR: 6.48,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '5',
    date: '19.10.2025',
    time: '15:30',
    dueEUR: 32.40,
    dueBGN: 0,
    paidEUR: 50,
    paidBGN: 0,
    changeEUR: 17.60,
  },
  {
    id: '6',
    date: '19.10.2025',
    time: '12:10',
    dueEUR: 8.75,
    dueBGN: 0,
    paidEUR: 10,
    paidBGN: 0,
    changeEUR: 1.25,
  },
  {
    id: '7',
    date: '18.10.2025',
    time: '20:05',
    dueEUR: 0,
    dueBGN: 125.50,
    paidEUR: 50,
    paidBGN: 50,
    changeEUR: 24.32,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '8',
    date: '18.10.2025',
    time: '16:22',
    dueEUR: 55.90,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 120,
    changeEUR: 5.47,
  },
  {
    id: '9',
    date: '18.10.2025',
    time: '13:40',
    dueEUR: 12.30,
    dueBGN: 0,
    paidEUR: 20,
    paidBGN: 0,
    changeEUR: 7.70,
  },
  {
    id: '10',
    date: '17.10.2025',
    time: '19:15',
    dueEUR: 27.85,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 60,
    changeEUR: 2.84,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '11',
    date: '17.10.2025',
    time: '17:50',
    dueEUR: 0,
    dueBGN: 89.99,
    paidEUR: 30,
    paidBGN: 30,
    changeEUR: 14.98,
  },
  {
    id: '12',
    date: '17.10.2025',
    time: '14:35',
    dueEUR: 18.60,
    dueBGN: 0,
    paidEUR: 20,
    paidBGN: 0,
    changeEUR: 1.40,
  },
  {
    id: '13',
    date: '16.10.2025',
    time: '21:10',
    dueEUR: 42.15,
    dueBGN: 0,
    paidEUR: 50,
    paidBGN: 0,
    changeEUR: 7.85,
  },
  {
    id: '14',
    date: '16.10.2025',
    time: '18:25',
    dueEUR: 9.90,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 20,
    changeEUR: 0.33,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '15',
    date: '16.10.2025',
    time: '15:45',
    dueEUR: 0,
    dueBGN: 215.80,
    paidEUR: 100,
    paidBGN: 50,
    changeEUR: 24.52,
  },
  {
    id: '16',
    date: '15.10.2025',
    time: '20:30',
    dueEUR: 35.70,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 80,
    changeEUR: 5.20,
  },
  {
    id: '17',
    date: '15.10.2025',
    time: '17:15',
    dueEUR: 22.40,
    dueBGN: 0,
    paidEUR: 50,
    paidBGN: 0,
    changeEUR: 27.60,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '18',
    date: '15.10.2025',
    time: '13:55',
    dueEUR: 0,
    dueBGN: 67.50,
    paidEUR: 20,
    paidBGN: 20,
    changeEUR: 9.72,
  },
  {
    id: '19',
    date: '14.10.2025',
    time: '19:40',
    dueEUR: 14.25,
    dueBGN: 0,
    paidEUR: 20,
    paidBGN: 0,
    changeEUR: 5.75,
  },
  {
    id: '20',
    date: '14.10.2025',
    time: '16:05',
    dueEUR: 51.30,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 110,
    changeEUR: 5.00,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '21',
    date: '14.10.2025',
    time: '12:20',
    dueEUR: 0,
    dueBGN: 38.75,
    paidEUR: 15,
    paidBGN: 10,
    changeEUR: 10.18,
  },
  {
    id: '22',
    date: '13.10.2025',
    time: '20:55',
    dueEUR: 29.80,
    dueBGN: 0,
    paidEUR: 50,
    paidBGN: 0,
    changeEUR: 20.20,
  },
  {
    id: '23',
    date: '13.10.2025',
    time: '17:30',
    dueEUR: 11.95,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 30,
    changeEUR: 3.40,
    location: { lat: 42.6977, lng: 23.3219 }
  },
  {
    id: '24',
    date: '13.10.2025',
    time: '14:10',
    dueEUR: 0,
    dueBGN: 152.40,
    paidEUR: 70,
    paidBGN: 20,
    changeEUR: 12.08,
  },
  {
    id: '25',
    date: '12.10.2025',
    time: '21:25',
    dueEUR: 37.60,
    dueBGN: 0,
    paidEUR: 0,
    paidBGN: 100,
    changeEUR: 13.56,
  },
];

const ITEMS_PER_PAGE = 10;

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [displayedItems, setDisplayedItems] = useState<HistoryItem[]>([]);
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Update displayed items when history or itemsToShow changes
  useEffect(() => {
    setDisplayedItems(history.slice(0, itemsToShow));
  }, [history, itemsToShow]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && itemsToShow < history.length) {
          // Load more items
          setItemsToShow(prev => Math.min(prev + ITEMS_PER_PAGE, history.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [itemsToShow, history.length]);

  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setDeleteItemId(null);
    toast.success('Записът е изтрит');
  };

  const clearAllHistory = () => {
    setHistory([]);
    setShowClearDialog(false);
    toast.success('Историята е изчистена');
  };

  const formatShareText = (item: HistoryItem) => {
    // Calculate both currencies
    const dueEUR = item.dueEUR > 0 ? item.dueEUR : (item.dueBGN / EXCHANGE_RATE);
    const dueBGN = item.dueBGN > 0 ? item.dueBGN : (item.dueEUR * EXCHANGE_RATE);
    
    return `Данни за плащане в две валути и ресто в евро
Дата на събитие: ${item.time} ${item.date}
Дължима сума: ${dueEUR.toFixed(2)} EUR или ${dueBGN.toFixed(2)} BGN
Платено в евро: ${item.paidEUR.toFixed(2)} EUR
Платено в лева: ${item.paidBGN.toFixed(2)} BGN
---
Ресто за получаване: ${item.changeEUR.toFixed(2)} EUR`;
  };

  const shareItem = async (item: HistoryItem) => {
    const text = formatShareText(item);
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        toast.info('Споделянето не е налично');
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
    }
  };

  const copyToClipboard = async (item: HistoryItem) => {
    const text = formatShareText(item);
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Копирано в clipboard');
    } catch (error) {
      toast.error('Грешка при копиране');
    }
  };

  const viewOnMap = (location: { lat: number; lng: number }) => {
    window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`, '_blank');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <AppHeader title="История на изчисленията" />
      
      {history.length > 0 && (
        <div className="flex justify-between items-center -mt-2">
          <p className="text-xs text-slate-500">
            Показани {displayedItems.length} от {history.length} записа
          </p>
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-2" />
            Изчисти всички
          </Button>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Няма записи в историята</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {displayedItems.map(item => {
              // Calculate both currencies for display
              const dueEUR = item.dueEUR > 0 ? item.dueEUR : (item.dueBGN / EXCHANGE_RATE);
              const dueBGN = item.dueBGN > 0 ? item.dueBGN : (item.dueEUR * EXCHANGE_RATE);
              
              return (
                <Card key={item.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    {/* Date and time */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-500">
                        {item.date} в {item.time}
                      </span>
                      <button
                        onClick={() => setDeleteItemId(item.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Transaction details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Дължимо:</span>
                        <span className="text-slate-900">
                          {dueEUR.toFixed(2)} EUR или {dueBGN.toFixed(2)} BGN
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Платено:</span>
                        <span className="text-slate-900">
                          {item.paidEUR.toFixed(2)} EUR + {item.paidBGN.toFixed(2)} BGN
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <span className="text-sm text-blue-700">Ресто:</span>
                        <span className="text-blue-600">{item.changeEUR.toFixed(2)} EUR</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => shareItem(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Сподели
                      </button>
                      <button
                        onClick={() => copyToClipboard(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Копирай
                      </button>
                      {item.location && (
                        <button
                          onClick={() => viewOnMap(item.location!)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-700 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Карта
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Infinite scroll loader */}
          {itemsToShow < history.length && (
            <div ref={loaderRef} className="flex justify-center py-4">
              <div className="animate-pulse text-sm text-slate-500">
                Зареждане...
              </div>
            </div>
          )}
        </>
      )}

      {/* Clear all confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изчистване на историята</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете всички записи от историята? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAllHistory}
              className="bg-red-600 hover:bg-red-700"
            >
              Изчисти всичко
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete single item confirmation dialog */}
      <AlertDialog open={deleteItemId !== null} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на запис</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете този запис от историята? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemId && deleteItem(deleteItemId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
