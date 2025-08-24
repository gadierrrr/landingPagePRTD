import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add global polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
