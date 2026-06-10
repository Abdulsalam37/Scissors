/// <reference types="node" />
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const RESERVED_SLUGS = ["admin", "api", "dashboard", "login"];

// Device detection helper
function getDeviceType(userAgent: string | null): string {
  if (!userAgent) return "Desktop";
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    (ua.includes("android") && !ua.includes("tablet"))
  ) {
    return "Mobile";
  }
  if (
    ua.includes("ipad") ||
    ua.includes("tablet") ||
    (ua.includes("android") && ua.includes("tablet"))
  ) {
    return "Tablet";
  }
  return "Desktop";
}

// Referrer parser helper
function getReferrer(referrerHeader: string | null): string {
  if (!referrerHeader) return "Direct";
  try {
    const url = new URL(referrerHeader);
    return url.hostname || "Direct";
  } catch {
    return referrerHeader || "Direct";
  }
}

// Custom 410 Gone HTML Page
const expiredHtml = (frontendUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired | Scissor</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
      color: #f8fafc;
      font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: rgba(30, 41, 59, 0.4);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3rem 2rem;
      border-radius: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      max-width: 480px;
      width: 90%;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      background: linear-gradient(to right, #f43f5e, #f43f5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 1.125rem;
      line-height: 1.6;
      margin: 0 0 2rem 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: white;
      text-decoration: none;
      padding: 0.875rem 2rem;
      border-radius: 9999px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⌛</div>
    <h1>410 - Link Expired</h1>
    <p>This shortened URL has reached its expiration date and is no longer active.</p>
    <a href="${frontendUrl}" class="btn">Create Your Own Link</a>
  </div>
</body>
</html>
`;

// Custom 404 Not Found HTML Page
const notFoundHtml = (frontendUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Not Found | Scissor</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
      color: #f8fafc;
      font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: rgba(30, 41, 59, 0.4);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3rem 2rem;
      border-radius: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      max-width: 480px;
      width: 90%;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      background: linear-gradient(to right, #a855f7, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 1.125rem;
      line-height: 1.6;
      margin: 0 0 2rem 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
      color: white;
      text-decoration: none;
      padding: 0.875rem 2rem;
      border-radius: 9999px;
      font-weight: 600;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔍</div>
    <h1>404 - Link Not Found</h1>
    <p>We couldn't find a shortened link matching the requested slug in our database.</p>
    <a href="${frontendUrl}" class="btn">Go to Scissor</a>
  </div>
</body>
</html>
`;

http.route({
  pathPrefix: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.pathname.slice(1); // Remove leading slash
    /// <reference types="node" />
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // If root path is accessed, redirect to frontend homepage
    if (!slug) {
      return new Response(null, {
        status: 302,
        headers: { Location: frontendUrl },
      });
    }

    // Skip handling if it's a reserved path, or if it looks like a static asset/convex system route (contains dots)
    if (RESERVED_SLUGS.includes(slug.toLowerCase()) || slug.includes(".")) {
      return new Response("Not Found", { status: 404 });
    }

    // 1. Fetch link by slug
    const link = await ctx.runQuery(api.links.getLinkBySlug, { slug });

    if (!link) {
      return new Response(notFoundHtml(frontendUrl), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    // 2. Check if expired
    const now = Date.now();
    const isExpired = link.expiresAt ? now > link.expiresAt : false;

    if (isExpired || link.expired) {
      // Mark as expired in db if not already done
      if (!link.expired) {
        await ctx.runMutation(api.links.markAsExpired, { id: link._id });
      }

      return new Response(expiredHtml(frontendUrl), {
        status: 410,
        headers: { "Content-Type": "text/html" },
      });
    }

    // 3. Collect headers for analytics
    const referrerHeader = request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");
    const country = request.headers.get("cf-ipcountry") || "Unknown";

    // 4. Record Click event in db
    await ctx.runMutation(api.clicks.recordClick, {
      linkId: link._id,
      timestamp: now,
      country,
      referrer: getReferrer(referrerHeader),
      device: getDeviceType(userAgent),
    });

    // 5. Respond with 302 redirect
    return new Response(null, {
      status: 302,
      headers: {
        Location: link.originalUrl,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }),
});

export default http;
