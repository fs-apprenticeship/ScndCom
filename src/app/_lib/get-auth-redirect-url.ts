export default function getAuthRedirectUrl(redirectUrl?: string) {
  const baseUrl = "/api/auth/sync";

  if (!redirectUrl) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("redirect_url", redirectUrl);

  return `${baseUrl}?${searchParams.toString()}`;
}
