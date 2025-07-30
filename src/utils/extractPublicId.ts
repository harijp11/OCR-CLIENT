// Example: https://res.cloudinary.com/dyxss1qle/image/upload/v1721982667/folder/my-image_xyz123.jpg
export const extractPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const versionIndex = parts.findIndex((part) => part.startsWith('v'));
  const publicIdParts = parts.slice(versionIndex + 1);
  const publicIdWithExtension = publicIdParts.join('/');
  return publicIdWithExtension.replace(/\.[^/.]+$/, ''); // remove file extension
};
