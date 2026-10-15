const DESKTOP_COOKIE_CLEAR = 'nihongo-prefer-desktop=; Path=/; Max-Age=0; SameSite=Lax';

function isMobileUserAgent(request) {
  const ua = request.headers.get('User-Agent') || '';
  const secChMobile = request.headers.get('Sec-CH-UA-Mobile');
  if (secChMobile === '?1') return true;
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
  // iPadOS 13+ pode reportar Macintosh; touch indica tablet/telefone
  if (/iPad|Macintosh/i.test(ua) && /Mobile/i.test(ua)) return true;
  return false;
}

function hasDesktopCookie(request) {
  const cookies = request.headers.get('Cookie') || '';
  return cookies.includes('nihongo-prefer-desktop=1');
}

function cloneSearchParams(fromUrl, toUrl, skipKeys = []) {
  fromUrl.searchParams.forEach((value, key) => {
    if (!skipKeys.includes(key)) toUrl.searchParams.set(key, value);
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/index.html') {
      if (url.searchParams.has('mobile')) {
        const mobileUrl = new URL('/mobile.html', url.origin);
        cloneSearchParams(url, mobileUrl, ['mobile']);
        return Response.redirect(mobileUrl.toString(), 302, {
          'Set-Cookie': DESKTOP_COOKIE_CLEAR,
        });
      }

      if (url.searchParams.has('desktop') || hasDesktopCookie(request)) {
        const assetRequest =
          path === '/'
            ? new Request(new URL('/index.html', url.origin), request)
            : request;
        const response = await env.ASSETS.fetch(assetRequest);
        if (url.searchParams.has('desktop')) {
          const headers = new Headers(response.headers);
          headers.append(
            'Set-Cookie',
            'nihongo-prefer-desktop=1; Path=/; Max-Age=2592000; SameSite=Lax'
          );
          return new Response(response.body, { status: response.status, headers });
        }
        return response;
      }

      if (isMobileUserAgent(request)) {
        const mobileUrl = new URL('/mobile.html', url.origin);
        cloneSearchParams(url, mobileUrl);
        return Response.redirect(mobileUrl.toString(), 302);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
