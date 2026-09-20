// Browser-safe barrel: roles only. `logger` and `image-processor` pull in
// Node-only dependencies (pino/sharp) and must be imported via their subpaths.
export * from './roles';
