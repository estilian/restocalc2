// src/ads.ts
import {
  AdMob,
  AdmobConsentStatus,
  AdmobConsentDebugGeography,
  InterstitialAdPluginEvents,
  AdOptions,
  AdLoadInfo,
} from '@capacitor-community/admob';

// ---------------------------
// Internal debug state
// ---------------------------
let __adInit = false;
let __listenersAttached = false;
let __consentStatus: string | null = null;
let __interstitialLoaded = false;
let __lastLoadError: string | null = null;
let __lastEvent: string | null = null;
let __isTesting = true; // <- при PROD можеш да го направиш false
let __adUnitId = 'ca-app-pub-3940256099942544/1033173712'; // Google TEST interstitial (Android)
//let __adUnitId = 'ca-app-pub-4675518894512456/9632389573'; // PROD interstitial (Android)

/** Позволява да подадеш PROD unit по време на рантайм */
export function setInterstitialAdUnitId(adUnitId: string) {
  __adUnitId = adUnitId;
}

/** По желание можеш да сменяш test режим */
export function setInterstitialTesting(isTesting: boolean) {
  __isTesting = isTesting;
}

/** AdMob consent */
let consent = await AdMob.requestConsentInfo({
  debugGeography: AdmobConsentDebugGeography.EEA,  // форсира режим "Европа"
  // testDeviceIdentifiers: ['YOUR_DEVICE_ID'],    // по желание: device id за UMP test mode
});
__consentStatus = String(consent?.status ?? 'unknown');

if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
  consent = await AdMob.showConsentForm();
  __consentStatus = String(consent?.status ?? __consentStatus);
}

// ---------------------------
// Public: init / show
// ---------------------------
export async function initAds() {
  __adInit = false;
  __lastEvent = 'init:start';
  __lastLoadError = null;

  try {
    await AdMob.initialize();
  } catch (e: any) {
    __lastLoadError = `initSdk:${e?.message || String(e)}`;
    // дори инициализацията да хвърли warning, продължаваме
  }

  // ---- UMP / GDPR ----
  try {
    // За тест: смени EEA -> NOT_EEA временно, за да валидираш зареждането на реклама без форма
    const consentInfo = await AdMob.requestConsentInfo({
      // debugGeography: AdmobConsentDebugGeography.EEA,
      debugGeography: AdmobConsentDebugGeography.NOT_EEA, // <- включи само за тест, после махни!
      // testDeviceIdentifiers: ['YOUR_DEVICE_ID'],
    });
    __consentStatus = String(consentInfo?.status ?? 'unknown');

    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      const result = await AdMob.showConsentForm();
      __consentStatus = String(result?.status ?? __consentStatus);
    }
  } catch (e: any) {
    // В твоя случай това е: "Publisher misconfiguration ..."
    __lastLoadError = `ump:${e?.message || String(e)}`;
    // ВАЖНО: НЕ ВРЪЩАМЕ! Продължаваме към preload на interstitial,
    // за да може поне тестовата реклама да се зарежда докато оправяш UMP в конзолата.
  }

  attachInterstitialListenersOnce();

  try {
    await preloadInterstitial();
  } catch (e: any) {
    __lastLoadError = `preload:${e?.message || String(e)}`;
  }

  __adInit = true;
  __lastEvent = 'init:done';
}

export async function maybeShowInterstitial() {
  // ако не е заредена, опитай да я подготвиш
  if (!__interstitialLoaded) {
    await preloadInterstitial();
  }

  try {
    if (__interstitialLoaded) {
      __lastEvent = 'interstitial:show:try';
      await AdMob.showInterstitial();
      __lastEvent = 'interstitial:show:ok';
      // при Dismissed автоматично ще preload-нем нова
    } else {
      __lastEvent = 'interstitial:show:skip(not loaded)';
    }
  } catch (e: any) {
    __lastLoadError = `show:${e?.message || String(e)}`;
    __lastEvent = 'interstitial:show:err';
  }
}

// ---------------------------
// Internal helpers
// ---------------------------
function attachInterstitialListenersOnce() {
  if (__listenersAttached) return;
  __listenersAttached = true;

  AdMob.addListener(InterstitialAdPluginEvents.Loaded, (_info: AdLoadInfo) => {
    __interstitialLoaded = true;
    __lastEvent = 'interstitial:loaded';
    __lastLoadError = null;
  });

  AdMob.addListener(InterstitialAdPluginEvents.LoadFailedToLoad, (err: any) => {
    __interstitialLoaded = false;
    __lastEvent = 'interstitial:loadfail';
    __lastLoadError =
      typeof err === 'string' ? `loadfail:${err}` : `loadfail:${err?.message || JSON.stringify(err)}`;
  });

  AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
    __interstitialLoaded = false;
    __lastEvent = 'interstitial:dismissed';
    // зареди следваща, за да е готова за следващото 3-то изчисление
    await preloadInterstitial();
  });
}

async function preloadInterstitial() {
  const options: AdOptions = {
    adId: __adUnitId,
    isTesting: __isTesting,
    // immersiveMode: true, // по избор
  };

  try {
    __lastEvent = 'interstitial:prepare:start';
    __lastLoadError = null;
    await AdMob.prepareInterstitial(options);
    // Успешното prepare ще тригърне InterstitialAdPluginEvents.Loaded
  } catch (e: any) {
    __interstitialLoaded = false;
    __lastEvent = 'interstitial:prepare:fail';
    __lastLoadError = `prepare:${e?.message || String(e)}`;
  }
}

// ---------------------------
// Public: debug info
// ---------------------------
export function getAdDebugInfo(): string {
  return [
    `init=${__adInit}`,
    `consent=${__consentStatus}`,
    `loaded=${__interstitialLoaded}`,
    `lastEvent=${__lastEvent}`,
    `lastErr=${__lastLoadError}`,
    `adUnit=${__adUnitId}`,
    `isTesting=${__isTesting}`,
  ].join('\n');
}
