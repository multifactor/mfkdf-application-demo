function SHA256(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email').trim().toLowerCase();
    const id = searchParams.get('id').trim();

    if (request.method !== "POST") {
      return new Response("Expected POST", {status: 400});
    } else if (typeof email !== 'string' || email.length === 0) {
      return new Response("Expected email", {status: 400});
    } else {
      const user = await env.DB.get('user#' + email);
      if (user === null) {
        return new Response("User not found", {status: 400});
      } else {
        const userData = JSON.parse(user);
        const authKey = userData.authKey;
        const json = await request.json();
        const auth = json.auth;
        const time = json.time;

        if (Math.abs(time - Date.now()) > 5000) {
          return new Response("Time delta too large", {status: 400});
        } else {
          const userData = JSON.parse(user);
          const authKey = userData.authKey;
          const real = await SHA256(authKey + time);
          if (real === auth) {
            if (id.startsWith('pass#' + email)) {
              await env.DB.delete(id);
              return new Response("Password deleted", {status: 200});
            } else {
              return new Response("Insufficient permissions", {status: 400});
            }
          } else {
            return new Response("Invalid auth token", {status: 400});
          }
        }
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, {status: 500});
  }
}
