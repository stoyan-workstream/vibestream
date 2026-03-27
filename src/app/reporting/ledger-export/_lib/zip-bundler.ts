export async function bundleAsZip(
  files: Array<{ name: string; data: Uint8Array }>
): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.data);
  }
  return await zip.generateAsync({ type: "uint8array" });
}
