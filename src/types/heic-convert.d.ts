// No upstream type definitions — this is the minimal shape this project
// actually calls (see src/app/api/image-proxy/route.ts).
declare module "heic-convert" {
  function convert(options: {
    buffer: Buffer | ArrayBuffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }): Promise<ArrayBuffer>;

  export default convert;
}
