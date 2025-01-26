export function parseCookies(
  cookieString: string | undefined
): Record<string, string> {
  // If no cookie string is provided, return an empty object
  if (!cookieString) {
    return {};
  }

  // Split the cookie string into individual cookies
  const cookieArray = cookieString.split(";");

  // Reduce the array into an object
  const cookies = cookieArray.reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);

  return cookies;
}
