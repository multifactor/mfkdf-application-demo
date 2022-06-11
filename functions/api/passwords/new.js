export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email').trim();

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

        // TODO: validate auth

        const id = Date.now() + '-' + Math.random();
        const key = 'pass#' + email + '#' + id;
        await env.DB.put(key, json.object);

        return new Response("Password created", {status: 200});
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, {status: 500});
  }
}
