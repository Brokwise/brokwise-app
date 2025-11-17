export const setCookie = (
  key: string,
  value: Record<string, string | number | boolean | undefined | null>,
  expiryDays: number
) => {
  const stringValue = encodeURIComponent(JSON.stringify(value));
  const expires = new Date();
  expires.setTime(expires.getTime() + expiryDays * 24 * 60 * 60 * 1000);

  document.cookie = `${key}=${stringValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict;`;
};
