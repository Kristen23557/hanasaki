// src/index.ts - 适配 Wrangler 4.x 的最简版本
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 处理根路径 → 指向 index.html
    if (path === "/" || path === "") {
      return fetch(new Request(`${url.origin}/index.html`, request));
    }

    // 2. 处理其他页面/静态资源（自动匹配文件）
    return fetch(request);
  },
};