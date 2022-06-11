const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email').trim();
    const name = searchParams.get('name').trim();
    const code = searchParams.get('code').trim();

    if (request.method == "POST") {
      return new Response("Expected POST", {status: 400});
    } else if (typeof name !== 'string' || name.length === 0) {
      return new Response("Expected name", {status: 400});
    } else if (typeof email !== 'string' || email.length === 0) {
      return new Response("Expected email", {status: 400});
    } else if (!validateEmail(email)) {
      return new Response("Invalid email", {status: 400});
    } else if (typeof email !== 'string' || email.length === 0)) {
      return new Response("Expected code", {status: 400});
    } else {
      const input = email + env.MAC;
      const digest = await crypto.subtle.digest({name: 'SHA-256'}, new TextEncoder().encode(input));
      const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
      if (base64 === code) {
        const key = 'user#' + email.toLowerCase();
        const user = await DB.get(key);
        if (user === null) {
          await DB.put(key, await request.text());
          return new Response("User created", {status: 200});
        } else {
          return new Response("User already exists", {status: 400});
        }
      } else {
        return new Response("Invalid confirmation code", {status: 400});
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, {status: 500});
  }
}
