// heic2any ships no types (no @types package exists) -- minimal ambient
// declaration covering the single call shape used in lib/image-compression.ts.
declare module "heic2any" {
  interface Heic2AnyOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }

  function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;

  export default heic2any;
}
