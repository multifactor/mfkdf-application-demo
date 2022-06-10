const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export async function onRequest(context) {
  try {
    const { request } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email').trim();
    const name = searchParams.get('name').trim();

    if (typeof name !== 'string' || name.length === 0) {
      return new Response("Expected name", {status: 400});
    } else if (typeof email !== 'string' || email.length === 0) {
      return new Response("Expected email", {status: 400});
    } else if (!validateEmail(email)) {
      return new Response("Invalid email", {status: 400});
    } else {
      const input = email + MAC;
      const digest = await crypto.subtle.digest({name: 'SHA-256'}, new TextEncoder().encode(input));
      const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
      const url = "https://demo.mfkdf.com/setup?email=" + encodeURIComponent(email) + "&code=" + digest + "&name=" + encodeURIComponent(name);

      let html = `
        <p>Dear ${name},</p>
        <p>Thank you for trying the MFKDF application demo!</p>
        <p>Here is the link you requested to create an account:</p>
        <p>${url}</p>
        <p>Please do not share this link with anyone else. Nobody will ever call or email you to request this link. If you did not request this link, do not click on it; no further action is necessary. Thank you for trying MFKDF!</p>
        <p><i>The application exists for demonstration purposes only. It has not been tested/audited as thoroughly as the core MFKDF library, and is not intended to be used as a production-ready application.</i></p>
      `;

      const send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
          "method": "POST",
          "headers": { "content-type": "application/json" },
          "body": JSON.stringify({
              "personalizations": [ { "to": [ {"email": email, "name": name} ] } ],
              "from": { "email": "authentication@multifactor.com", "name": "Multifactor" },
              "subject": "Your Requested One-Time Login Code",
              "content": [{ "type": "text/html", "value": html }],
          }),
      });

      const resp = await fetch(send_request);

      if (resp.status === 200) {
        return new Response("Sent confirmation email", {status: 200});
      } else {
        return new Response("Error sending confirmation email: " + resp.text(), {status: 500});
      }
    }
  } catch (err) {
    return new Response("Internal error: " + JSON.stringify(err), {status: 500});
  }
}
