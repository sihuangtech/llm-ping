import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

import type { CheckItem } from "@llm-ping/shared";

export type NetworkProbe = {
  items: CheckItem[];
  dnsMs?: number;
  tcpMs?: number;
  tlsMs?: number;
};

// 基础网络探测只负责 DNS/TCP/TLS，不碰 Provider 协议。
export async function probeNetwork(rawUrl: string, timeoutMs: number): Promise<NetworkProbe> {
  const url = new URL(rawUrl);
  const items: CheckItem[] = [];

  const dnsStart = performance.now();
  await dns.lookup(url.hostname);
  const dnsMs = Math.round(performance.now() - dnsStart);
  items.push({ name: "DNS 检测", status: "success", message: "域名解析成功。", latencyMs: dnsMs });

  const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
  const tcpMs = await connectTcp(url.hostname, port, timeoutMs);
  items.push({ name: "TCP 检测", status: "success", message: "TCP 连接成功。", latencyMs: tcpMs });

  let tlsMs: number | undefined;
  if (url.protocol === "https:") {
    tlsMs = await connectTls(url.hostname, port, timeoutMs);
    items.push({ name: "TLS 检测", status: "success", message: "TLS 握手成功。", latencyMs: tlsMs });
  } else {
    items.push({ name: "TLS 检测", status: "skipped", message: "非 HTTPS 地址，跳过 TLS 检测。" });
  }

  return { items, dnsMs, tcpMs, tlsMs };
}

function connectTcp(host: string, port: number, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const socket = net.connect({ host, port });
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      socket.destroy();
      resolve(Math.round(performance.now() - started));
    });
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("TCP timeout"));
    });
    socket.once("error", reject);
  });
}

function connectTls(host: string, port: number, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: true });
    socket.setTimeout(timeoutMs);
    socket.once("secureConnect", () => {
      socket.destroy();
      resolve(Math.round(performance.now() - started));
    });
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("TLS timeout"));
    });
    socket.once("error", reject);
  });
}
