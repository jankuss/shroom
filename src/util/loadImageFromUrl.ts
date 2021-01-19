export async function loadImageFromUrl(imageUrl: string) {
  const image = new Image();

  image.src = imageUrl;

  await new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };

    image.onerror = (value) => reject(value);
  });

  return image;
}
