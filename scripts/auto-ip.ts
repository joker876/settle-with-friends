import ansis from 'ansis';
import * as fs from 'fs';
import { networkInterfaces } from 'os';
import * as path from 'path';

type IpMap = Record<string, string[]>;

/**
 * Get all non-internal IPv4 addresses grouped by network interface.
 */
function getIps(): IpMap {
  const nets = networkInterfaces();
  const results: IpMap = {};

  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (!netList) continue;

    for (const net of netList) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;

      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  return results;
}

/**
 * Choose the "best" IPv4 address from the collected IPs.
 * This is a reasonable heuristic implementation, since the original choose-ip.js
 * wasn’t provided:
 *  - Prefer 192.168.* private range
 *  - Then 10.* private range
 *  - Then 172.16–172.31 private range
 *  - Fallback to the first address found
 */
function chooseBestIp(ipsByInterface: IpMap): string | null {
  const wifiIps: string[] = [];
  const ethernetIps: string[] = [];
  const otherIps: string[] = [];

  for (const iface of Object.keys(ipsByInterface)) {
    if (/wi-fi/i.test(iface)) {
      wifiIps.push(...ipsByInterface[iface]);
      continue;
    }
    if (/ethernet/i.test(iface)) {
      ethernetIps.push(...ipsByInterface[iface]);
      continue;
    }
    otherIps.push(...ipsByInterface[iface]);
  }
  const allIps = [...wifiIps, ...ethernetIps, ...otherIps];

  if (allIps.length === 0) {
    console.error(`${ansis.bold.redBright('✕')} No external IPv4 addresses found on this machine.`);
    return null;
  }

  const firstMatch = (regex: RegExp): string | undefined => allIps.find(ip => regex.test(ip));

  const ip192 = firstMatch(/^192\.168\./);
  if (ip192) return ip192;

  const ip10 = firstMatch(/^10\./);
  if (ip10) return ip10;

  const ip172 = firstMatch(/^172\.(1[6-9]|2\d|3[0-1])\./);
  if (ip172) return ip172;

  return allIps[0];
}

const rootDir = path.join(__dirname, '../');
const clientFilePath = path.join(rootDir, 'client/src/environments/api-url.ts');
const envFilePath = path.join(rootDir, 'server/.env.ip');

function createClientIpFile(ip: string, port: string): void {
  fs.writeFileSync(clientFilePath, `export const API_IP = "${ip}";\nexport const API_PORT = "${port}";\n`);
  console.log(`${ansis.bold.greenBright('✓')} Created api-url.ts file!`);
}

function modifyServerDotEnv(ip: string): string | null {
  if (!fs.existsSync(envFilePath)) {
    console.error(`${ansis.bold.redBright('✕')} .env.ip file doesn't exist - cannot modify it.`);
    return null;
  }

  const content = fs.readFileSync(envFilePath, { encoding: 'utf-8' });

  if (!/NODE_ENV=(|")local\1/.test(content)) {
    console.error(
      `${ansis.bold.redBright('✕')} Current environment is not marked as local. This scipt can only be run in local environment. To mark it as local, set NODE_ENV="local" in .env file.`
    );
    return null;
  }

  let port = content.match(/PORT=(|")(\d+)\1/)?.[2];
  if (port) {
    console.log(`${ansis.bold.greenBright('✓')} Found server port: ${port}`);
  } else {
    port = '8080';
    console.log(`${ansis.bold.yellowBright('⚠')} No server port found in .env file, using default port 8080.`);
  }

  if (!/FRONTEND_URL=.*/.test(content)) {
    console.error(
      `${ansis.bold.redBright('✕')} .env file does not contain a FRONTEND_URL variable.`
    );
    return null;
  }
  if (!/APP_HOST=.*/.test(content)) {
    console.error(
      `${ansis.bold.redBright('✕')} .env file does not contain a APP_HOST variable.`
    );
    return null;
  }

  const newContent = content
    .replace(/FRONTEND_URL=.*/, `FRONTEND_URL="http://${ip}:5260,http://localhost:5260"`)
    .replace(/APP_HOST=.*/, `APP_HOST="${ip}"`);

  fs.writeFileSync(envFilePath, newContent);
  console.log(`${ansis.bold.greenBright('✓')} Modified .env file!`);

  return port;
}

function createIpFiles(ip: string): void {
  const port = modifyServerDotEnv(ip);
  if (!port) {
    return;
  }

  createClientIpFile(ip, port);
}

async function main() {
  const ips = getIps();
  const bestIp = chooseBestIp(ips);

  if (!bestIp) {
    return;
  }

  console.log(
    `${ansis.bold.greenBright('✓')} Found best IP address: ${ansis.cyan(bestIp)} (frontend will be accessible at ${ansis.cyan(`http://${bestIp}:4200`)})`
  );

  const ifaceEntry = Object.entries(ips).find(([, addresses]) => addresses.includes(bestIp));
  if (ifaceEntry) {
    const [ifaceName] = ifaceEntry;

    if (/wi-fi/i.test(ifaceName)) {
      console.log(
        `${ansis.bold.greenBright('✓')} Using Wi-Fi interface. ${ansis.greenBright('Can use page on the phone via wi-fi!')}`
      );
    } else if (/ethernet/i.test(ifaceName)) {
      console.log(
        `${ansis.bold.greenBright('✓')} Using Ethernet interface. ${ansis.yellow('Phone needs to be connected via cable!')}`
      );
    } else {
      console.log(
        `${ansis.bold.greenBright('✓')} Network interface used: ${ifaceName}. ${ansis.redBright('Cannot use page on the phone!')}`
      );
    }
  }

  createIpFiles(bestIp);

  await new Promise(resolve => setTimeout(resolve, 2000));
}

main();
