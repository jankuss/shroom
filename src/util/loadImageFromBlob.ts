export async function loadImageFromBlob(blob: Blob) {
  const reader = new FileReader();
  const url = await new Promise<string>((resolve) => {
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
  });

  return url;
}
