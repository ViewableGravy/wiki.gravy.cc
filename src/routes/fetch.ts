const baseServingRoute = `${__dirname}/../public`

export const fetchRoute = async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname.includes('..')) {
    return new Response("Invalid Path", { status: 400 });
  }

  const parsePath = (path: string) => {
    const _path = path.replace(/^\//, '')

    if (_path === '/') {
      return { path: 'index.html' };
    }

    if (!/\.(html|css|js)$/.test(_path)) {
      return { path: 'index.html' };
    }

    return { path: _path };
  }

  const file = Bun.file(`${baseServingRoute}/${parsePath(url.pathname).path}`);
  
  if (!await file.exists()) {
    return new Response("Page not found", { status: 404 });
  }
  
  return new Response(file);
}