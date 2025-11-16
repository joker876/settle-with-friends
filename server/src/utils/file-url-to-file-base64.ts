export async function fileUrlToFileBase64(fileUrl: string | undefined): Promise<string> {
  if (!fileUrl) return '';
  const response = await fetch(fileUrl).then(r => r.arrayBuffer());
  return Buffer.from(response).toString('base64');
}
