export async function fileUrlToFileBase64(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl).then(r => r.arrayBuffer());
  return Buffer.from(response).toString('base64');
}
