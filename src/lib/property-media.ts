export const SAMPLE_LAND_MEDIA_PATH = "/images/sample-land-media.jpg";
export const LEGACY_SAMPLE_LAND_MEDIA_PATH = "/images/sample-land-media.png";

export const SAMPLE_LAND_MEDIA_DISCLAIMER =
  "Sample image for illustration purpose only. It does not depict the original property.";

const MEDIA_CDN_HOSTS = ["firebasestorage.googleapis.com", "picsum.photos"];

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const isSampleLandMedia = (value?: string | null): boolean =>
  value === SAMPLE_LAND_MEDIA_PATH || value === LEGACY_SAMPLE_LAND_MEDIA_PATH;

export const normalizeSampleLandMediaPath = (value?: string | null): string =>
  isSampleLandMedia(value) ? SAMPLE_LAND_MEDIA_PATH : (value || "");

export const isAllowedPropertyMedia = (value?: string | null): boolean => {
  if (!value) return false;
  if (isSampleLandMedia(value)) return true;
  if (isHttpUrl(value)) return true;
  return MEDIA_CDN_HOSTS.some((host) => value.includes(host));
};

export const getPropertyMediaSrc = (value?: string | null): string =>
  isAllowedPropertyMedia(value)
    ? normalizeSampleLandMediaPath(value)
    : "/images/placeholder.webp";
