// src/index.ts - Cloudflare Worker 核心逻辑：服务 HTML 页面+静态资源
import type { AssetBinding } from "@cloudflare/workers-types";

// 定义环境变量类型（用于代码提示）
interface Env {
  ASSETS: AssetBinding; // 绑定的静态资产
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 处理 HTML 页面请求
    const htmlMap: Record<string, string> = {
      "/": "index.html",
      "/Documents": "Documents.html",
      "/Thanks": "Thanks.html"
    };
    if (htmlMap[path]) {
      const htmlFile = await env.ASSETS.get(htmlMap[path]);
      if (!htmlFile) return new Response("页面不存在", { status: 404 });
      return new Response(htmlFile.body, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 2. 处理静态资源请求（比如 pictures 里的图片）
    const asset = await env.ASSETS.get(path.slice(1)); // 去掉路径开头的 "/"
    if (asset) {
      // 自动识别资源类型（图片、文件等）
      return new Response(asset.body, {
        headers: { "Content-Type": asset.contentType || "application/octet-stream" }
      });
    }

    // 3. 处理不存在的路径
    return new Response("404 页面未找到", { status: 404 });
  },
};