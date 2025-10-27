import { useState, useEffect, useRef } from 'react';
import { Trash2, Share2, Copy, MapPin, Trash } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
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
import { loadHistory, saveHistory, type HistoryItem } from '../utils/history';
import { loadSettings } from '../utils/settings';
import { Share } from '@capacitor/share';

const EXCHANGE_RATE = 1.95583;
const ITEMS_PER_PAGE = 10;

type Props = { goToSettings?: () => void };
export default function HistoryScreen({ goToSettings }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<HistoryItem[]>([]);
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Load history + settings on mount
  useEffect(() => {
    setHistory(loadHistory());
    setHistoryEnabled(loadSettings().saveHistory);
  }, []);

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
          setItemsToShow((prev) => Math.min(prev + ITEMS_PER_PAGE, history.length));
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
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setDeleteItemId(null);
    toast.success('Записът е изтрит');
  };

  const clearAllHistory = () => {
    setHistory([]);
    saveHistory([]);
    setShowClearDialog(false);
    toast.success('Историята е изчистена');
  };

  const formatShareText = (item: HistoryItem) => {
    // Calculate both currencies
    const dueEUR = item.dueEUR > 0 ? item.dueEUR : item.dueBGN / EXCHANGE_RATE;
    const dueBGN = item.dueBGN > 0 ? item.dueBGN : item.dueEUR * EXCHANGE_RATE;

    return `Данни за плащане в две валути и ресто в евро
---
Дата на събитие: ${item.time} ${item.date}
Дължима сума: ${dueEUR.toFixed(2)} € или ${dueBGN.toFixed(2)} лв.
Платено в евро: ${item.paidEUR.toFixed(2)} €
Платено в лева: ${item.paidBGN.toFixed(2)} лв.
---
Ресто за получаване: ${item.changeEUR.toFixed(2)} €`;
  };

  const shareItem = async (item: HistoryItem) => {
    const text = formatShareText(item);

    try {
      await Share.share({ text });
    } catch (error) {
      // Fallback to navigator.share if Capacitor API fails
      try {
        if (navigator.share) {
          await navigator.share({ text });
        } else {
          toast.info('Споделянето не е налично');
        }
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
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

  // Навигация към „Информация → Настройки“
  const handleGoToSettings = () => {
    if (goToSettings) {
      goToSettings(); // това ще смени таба към "info" в App и ще пусне събитието
    } else {
      // резервен вариант, ако пропът липсва:
      window.dispatchEvent(new CustomEvent('restocalc:open-settings'));
      window.location.hash = '#settings';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <AppHeader title="История на изчисленията" />

      {/* Банер при изключена история */}
      {!historyEnabled && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 p-3 -mt-2">
          <div className="text-sm leading-snug">
            Историята е <strong>деактивирана</strong> от настройките. Нови записи няма да се запазват.
          </div>
          <button
            onClick={handleGoToSettings}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
          >
            Настройки
          </button>
        </div>
      )}

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
            {displayedItems.map((item) => {
              // Calculate both currencies for display
              const dueEUR = item.dueEUR > 0 ? item.dueEUR : item.dueBGN / EXCHANGE_RATE;
              const dueBGN = item.dueBGN > 0 ? item.dueBGN : item.dueEUR * EXCHANGE_RATE;

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
                          {dueEUR.toFixed(2)} € или {dueBGN.toFixed(2)} лв.
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Платено:</span>
                        <span className="text-slate-900">
                          {item.paidEUR.toFixed(2)} € + {item.paidBGN.toFixed(2)} лв.
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <span className="text-sm text-blue-700">Ресто:</span>
                        <span className="text-blue-600">{item.changeEUR.toFixed(2)} €</span>
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
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
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
      <AlertDialog
        open={deleteItemId !== null}
        onOpenChange={(open: boolean) => !open && setDeleteItemId(null)}
      >
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
