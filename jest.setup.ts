import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add global polyfills for Node.js environment
global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;
