export async function getObjectBuffer(stream) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks = [] as any;

    stream.once('error', (error) => reject(error.message));

    stream.on('data', (chunk) => chunks.push(chunk));

    stream.once('end', () => resolve(Buffer.concat(chunks)));
  });
}
