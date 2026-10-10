import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const username = body.username;

    if (!username) {
      return new Response(
        JSON.stringify({ valid: false, error: "Username is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillProof-AI",
      },
    });

    if (response.status === 404) {
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ valid: false, error: "GitHub API error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        valid: true,
        login: data.login,
        email: data.email ?? null,
        public_repos: data.public_repos,
        avatar_url: data.avatar_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
