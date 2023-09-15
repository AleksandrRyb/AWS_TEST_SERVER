import jimp from 'jimp';

export const getResizdObjectBuffer = async (buffer: Buffer, width: number, height: number) => {
  try {
    const jimpImage = await jimp.read(buffer);
    const mime = jimpImage.getMIME();

    const resizedImageBuffer = await jimpImage.scaleToFit(width, height).getBufferAsync(mime);

    return resizedImageBuffer;
  } catch (error) {
    throw new Error(error.message);
  }
};
