export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') {
      return new Response('ok');
    }
    if (url.pathname === '/api/proxy') {
      return fetch('https://upstream.example.invalid/v1/data');
    }
    // env.SESSIONS_KV and env.API_TOKEN used by name only in real code
    return new Response('not found', { status: 404 });
  },
};
