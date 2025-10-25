// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.estilian.restocalc',
  appName: 'RestoCalc',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http'
  }
};

export default config;