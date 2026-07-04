/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare module 'node:fs' {
  export function existsSync(path: string): boolean;
}

declare module 'node:fs/promises' {
  export function readdir(path: string, options?: { withFileTypes?: false }): Promise<string[]>;
  export function readdir(
    path: string,
    options: { withFileTypes: true },
  ): Promise<Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>>;
  export function readFile(path: string | URL, encoding: BufferEncoding): Promise<string>;
}

declare module 'node:path' {
  const sep: string;
  export { sep };
  export function join(...paths: string[]): string;
  export function relative(from: string, to: string): string;
}

declare module 'node:url' {
  export class URL extends globalThis.URL {}
  export function pathToFileURL(path: string): URL;
}

type BufferEncoding = 'utf8';
