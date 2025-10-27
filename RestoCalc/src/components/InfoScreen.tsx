import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
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
import { ExternalLink } from 'lucide-react';
import AppHeader from './AppHeader';
import { loadSettings, saveSettings, type ThemeMode, type Settings } from '../utils/settings';
import { getCurrentLocation } from '../utils/history';

export default function InfoScreen() {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<Settings | null>(null);

  const [tab, setTab] = useState<'how-it-works' | 'law' | 'about'>('how-it-works');

  useEffect(() => {
    const openSettings = () => setTab('about'); // „Приложението“/Настройки
    window.addEventListener('restocalc:open-settings', openSettings);
    return () => window.removeEventListener('restocalc:open-settings', openSettings);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    setPendingSettings(newSettings);
    setShowRestartDialog(true);
  };

  const handleSaveHistoryChange = (checked: boolean) => {
    const newSettings = { ...settings, saveHistory: checked };
    setSettings(newSettings);
    setPendingSettings(newSettings);
    setShowRestartDialog(true);
  };

  const handleSaveLocationChange = async (checked: boolean) => {
    if (checked) {
      const location = await getCurrentLocation();
      if (location) {
        const newSettings = { ...settings, saveLocation: true };
        setSettings(newSettings);
        setPendingSettings(newSettings);
        setShowRestartDialog(true);
      }
    } else {
      const newSettings = { ...settings, saveLocation: false };
      setSettings(newSettings);
      setPendingSettings(newSettings);
      setShowRestartDialog(true);
    }
  };

  const handleConfirmRestart = () => {
    if (pendingSettings) {
      saveSettings(pendingSettings);
      window.location.reload();
    }
  };

  const handleCancelRestart = () => {
    // Revert settings to the saved state
    setSettings(loadSettings());
    setPendingSettings(null);
    setShowRestartDialog(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      {/* <AppHeader title="Информация" /> */}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="how-it-works">Как работи</TabsTrigger>
          <TabsTrigger value="law">Закон за еврото</TabsTrigger>
          <TabsTrigger value="about">Настройки</TabsTrigger>
        </TabsList>

        {/* How it works */}
        <TabsContent value="how-it-works" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div>
                <h2 className="text-slate-900 mb-2">Как работи калкулаторът?</h2>
                <div className="text-sm text-slate-700 space-y-3">
                  <p>
                    <strong>RestoCalc</strong> е помощен инструмент за бързо изчисляване на рестото при двувалутни плащания в лева и евро. Приложението автоматично калкулира правилното ресто в евро при всяка комбинация на дължима и платена сума.
                  </p>

                  <h3 className="text-slate-900 mt-4 mb-2">Стъпка по стъпка:</h3>

                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-500 mb-1"><strong>1. Въведете дължимата сума</strong></p>
                      <p className="text-blue-300 text-xs">
                        Посочете сумата, която трябва да платите – в лева ИЛИ в евро. 
                        Калкулаторът автоматично конвертира по курса 1 евро = 1.95583 лв.
                        Можете да използвате както точка, така и запетая за десетичен разделител.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 mb-1"><strong>2. Посочете колко плащате</strong></p>
                      <p className="text-green-500 text-xs">
                        Въведете сумата, която давате при плащане – в лева, в евро или комбинация от двете валути. Използвайте бутона <strong>"избери"</strong> до всяко поле, за да изберете конкретни банкноти и монети, които ще дадете.
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-700 mb-1"><strong>3. Вижте рестото веднага</strong></p>
                      <p className="text-orange-400 text-xs">
                        Калкулаторът моментално показва:
                      </p>
                      <ul className="text-orange-400 text-xs list-disc list-inside mt-1 space-y-0.5">
                        <li>Дали сумата е недостатъчна и колко недостигът във всяка една от двете валути по отделно</li>
                        <li>Дали сумата е точна (няма ресто)</li>
                        <li>Колко е рестото в евро (при надплащане)</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-purple-700 mb-1"><strong>4. Покажете на цял екран</strong></p>
                      <p className="text-purple-500 text-xs">
                        При излизане от полето за платена сума или при натискане на <strong>"Виж на цял екран"</strong>, рестото се показва на цял екран с едър шрифт, подходящ за показване на търговец, касиер или клиент.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-100 rounded-lg p-3 mt-4">
                    <p className="text-slate-900 mb-2"><strong>Допълнителни функции:</strong></p>
                    <ul className="text-slate-700 text-xs list-disc list-inside mt-1 space-y-0.5">
                      <li><strong>Бързи бутони:</strong> При недостатъчна сума се показват бутони за доплащане с точната недостигащата сума във всяка от валутите</li>
                      <li><strong>История:</strong> Всички изчисления се записват автоматично при налично ресто <em>(ако е активирана настройката)</em></li>
                      <li><strong>Локация:</strong> Може да запазите къде е направено плащането <em>(ако е активирана настройката)</em></li>
                      <li><strong>Споделяне:</strong> Всеки запис може да се сподели или копира</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Law about Euro */}
        <TabsContent value="law" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div>
                <h2 className="text-slate-900 mb-2">Закон за еврото в България</h2>
                <div className="text-sm text-slate-700 space-y-3">
                  <p>
                    България е в <strong>период на адаптация към приемане на еврото</strong>. В момента е задължително <strong>двойното обозначаване на цените</strong> – в левове и в евро по фиксирания курс <strong>1 евро = 1.95583 лв</strong>.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-500 mb-1"><strong>До 31 декември 2025 г.</strong></p>
                    <p className="text-blue-300 text-xs">
                      Плащанията се приемат <strong>САМО в левове</strong> – не може да се плаща в евро.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 mb-1"><strong>От 1 януари 2026 г.</strong></p>
                    <p className="text-green-500 text-xs">
                      Започва използването на <strong>двете валути</strong>. Потребителите могат да плащат: в левове, в евро или <strong>смесено в двете валути</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-slate-900 text-xs mb-2">
                      <strong>Търговците нямат право да отказват</strong> нито една от двете валути.
                    </p>
                    <p className="text-slate-900 text-xs">
                      <strong>Рестото от търговеца се връща само в евро. Не се позволява връщането на ресто в лева или в комбинация от двете валути!</strong> Точно затова RestoCalc е полезен – за секунди показва какво ресто в евро следва да получите при всяка комбинация на плащане.
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-3 mt-4">
                    <h3 className="text-slate-900 mb-2"><strong>Сигнали при нарушения</strong></h3>
                    <p className="text-xs text-slate-600 mb-2">
                      При отказ да приемат левове/евро или връщане на ресто в левове - 
                      подавайте към Комисия за защита на потребителите (КЗП):
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://kzp.bg/bg/kak-se-podava-zhalba-signal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Онлайн форма: kzp.bg/bg/kak-se-podava-zhalba-signal</span>
                      </a>

                      <a
                        href="https://kzp.bg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Инфо и контакти: kzp.bg</span>
                      </a>

                      <p className="text-xs text-slate-600 pl-5">
                        Телефон на потребителя: <strong>0700 111 22</strong>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 mt-4">
                    <h3 className="text-slate-900 mb-2"><strong>Нормативна уредба и официални източници</strong></h3>
                    <div className="space-y-2">
                      <a
                        href="https://evroto.bg/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Закон и документи за въвеждане на еврото (evroto.bg)</span>
                      </a>

                      <a
                        href="https://www.bnb.bg/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>БНБ — Въпроси и отговори за еврото (bnb.bg)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div>
                <h2 className="text-slate-900 mb-2">За приложението</h2>
                <div className="text-sm text-slate-700 space-y-3">
                  <p>
                    <strong>RestoCalc</strong> е некомерсиален продукт, разработен от любител програмист в полза на потребителите. Приложението <strong>не е разработено и публикувано от името на държавна администрация</strong> и не представлява официален инструмент или доказателство.
                  </p>

                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-slate-900 mb-2"><strong>Автор:</strong> Estilian</p>
                    <p className="text-slate-900 mb-2"><strong>Версия:</strong> 2.2.0</p>
                    <p className="text-slate-900 mb-2"><strong>Последно обновяване:</strong> 01.11.2025</p>
                    <p className="text-slate-900"><strong>Технологии:</strong> React + Vite, TypeScript, localStorage (локална история), geolocation (запис на местоположение)</p>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Поверителност:</strong> Историята се съхранява локално <strong>само на вашето устройство</strong>. Приложението не събира, не съхранява и не изпраща данни към външни сървъри и няма нужда от достъп до Интернет, за да работи.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-slate-900">Настройки</h2>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>Цветова схема</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                      settings.theme === 'auto'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Автоматична
                  </button>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Светла
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Тъмна
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Промяната на цветовата схема се прилага при следващо стартиране на приложението.
                </p>
              </div>

              {/* Save History */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Запис на история</Label>
                  <p className="text-xs text-slate-500">
                    Записвай всяко изчислено ресто в историята
                  </p>
                </div>
                <Switch
                  checked={settings.saveHistory}
                  onCheckedChange={handleSaveHistoryChange}
                />
              </div>

              {/* Save Location */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Запис на локация в история</Label>
                  <p className="text-xs text-slate-500">
                    Пази местоположението при изчислено ресто в историята
                  </p>
                </div>
                <Switch
                  checked={settings.saveLocation}
                  onCheckedChange={handleSaveLocationChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restart Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Рестартиране на приложението</AlertDialogTitle>
            <AlertDialogDescription>
              За да се приложат новите настройки, приложението трябва да бъде рестартирано. Желаете ли да продължите?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestart}>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestart}>
              Рестартирай
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
