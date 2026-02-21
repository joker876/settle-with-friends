import express = require('express');
import type { Request, Response } from 'express';
import { URL } from 'url';

const PROXY_PORT = 5280;
const PROXY_HOST = 'localhost';

export function startLoginProxy(appUrl: string): void {
  let target: URL;

  try {
    target = new URL(appUrl);
  } catch {
    console.error(`Invalid app URL for proxy: ${appUrl}`);
    return;
  }

  const targetPort = Number(target.port || (target.protocol === 'https:' ? 443 : 80));

  if (
    (target.hostname === PROXY_HOST || target.hostname === '127.0.0.1' || target.hostname === '[::1]') &&
    targetPort === PROXY_PORT
  ) {
    console.log(`Proxy not started because app is already running on http://${PROXY_HOST}:${PROXY_PORT}`);
    return;
  }

  const proxyApp = express();

  const redirectFn = (req: Request, res: Response) => {
    // Build a correct URL regardless of trailing slashes, etc.
    const redirectUrl = new URL(req.originalUrl, appUrl).toString();

    const urlWithoutQuery =
      redirectUrl.split('?')[0] + (redirectUrl.includes('?') ? '?<params>' : '');
    console.log(`Proxying request to: ${urlWithoutQuery}`);

    res.redirect(redirectUrl);
  };

  proxyApp.use('/api', redirectFn);

  proxyApp.listen(PROXY_PORT, PROXY_HOST, () => {
    console.log(`Proxy server listening on http://${PROXY_HOST}:${PROXY_PORT} and forwarding to ${appUrl}`);
  });
}