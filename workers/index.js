export default {
  async fetch(request) {
    const auth = request.headers.get("Authorization");
    const username = "youruser";
    const password = "yourpass";
    const domain = "astro-cloudflare-practice";

    const validAuth = "Basic " + btoa(`${username}:${password}`);

    if (auth !== validAuth) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    // 認証OK → PagesのURLにリダイレクト
    const url = new URL(request.url);
    return fetch(`https://${domain}.pages.dev${url.pathname}`, request);
  },
};
