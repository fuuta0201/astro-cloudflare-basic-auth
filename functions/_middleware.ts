export async function onRequest(context: any) {
  const BASIC_USER = context.env.BASIC_USER ?? "admin";
  const BASIC_PASS = context.env.BASIC_PASS ?? "password";

  const authorization = context.request.headers.get("Authorization");

  if (!authorization) {
    return new Response("You need to login.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Protected", charset="UTF-8"',
      },
    });
  }

  const [scheme, encoded] = authorization.split(" ");
  if (!encoded || scheme !== "Basic") {
    return new Response("Malformed authorization header.", { status: 400 });
  }

  const credentials = atob(encoded).split(":");
  const user = credentials[0];
  const pass = credentials[1];

  if (user !== BASIC_USER || pass !== BASIC_PASS) {
    return new Response("Invalid credentials.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Protected", charset="UTF-8"',
      },
    });
  }

  // 認証後、リクエストされたコンテンツが存在するか確認
  let response = await context.next(); // 次のリクエストに渡す

  // リダイレクトが発生した場合、リダイレクト先に再度リクエストを送る
  if (response.status === 308) {
    const redirectLocation = response.headers.get("Location");
    if (redirectLocation) {
      const redirectUrl = new URL(redirectLocation, context.request.url);
      response = await fetch(redirectUrl.toString());
    }
  }

  if (response.status === 304) {
    // 304 (Not Modified) の場合、キャッシュを無効化して新しいレスポンスを取得
    response = await fetch(context.request.url, {
      headers: {
        "Cache-Control": "no-cache", // キャッシュを無効化
      },
    });
  }

  if (!response.ok) {
    return new Response("Page not found", { status: 404 });
  }

  return response;
}
