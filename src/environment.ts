import { config as devConfig } from './config.dev';
import { config as prodConfig } from './config.prod';

const isProduction = false; // Set to true for production builds

export const environment = isProduction ? prodConfig : devConfig;
