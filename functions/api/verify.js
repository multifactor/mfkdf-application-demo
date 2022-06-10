const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export async function onRequest(context) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (typeof email !== 'string' || email.length === 0) {
    return new Response("Expected email");
  } else if (!validateEmail(email)) {
    return new Response("Invalid email");
  } else {
    const input = email;
    const digest = await crypto.subtle.digest({name: 'SHA-256'}, new TextDecoder().decode(input));
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return new Response(base64);
  }
}
