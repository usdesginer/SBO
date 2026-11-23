import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ASSET_KEYS = new Set([
  "logo",
  "hero",
  "mobileApp",
  "vault",
  "swissHeritage",
  "businessBanking",
  "dashboardPreview",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const MIME_EXT_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "image/avif": "avif",
};

function revalidateBrandPages() {
  for (const path of ["/", "/personal", "/business", "/investments", "/loans", "/support", "/login", "/open-account"]) {
    revalidatePath(path);
  }
}

async function authorizeStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "supervisor", "executive"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden: Institutional role required" }, { status: 403 }) };
  }

  // Prefer service role client when configured; fall back to authenticated staff session client (governed by RLS).
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const dbClient = (hasServiceRole ? createAdminClient() : supabase) as ReturnType<typeof createAdminClient>;
  return { user, dbClient, hasServiceRole };
}

/**
 * Institutional Asset Uplink
 * Handles image uploads to Supabase Storage and updates the global site_settings registry.
 */
export async function POST(req: NextRequest) {
  const auth = await authorizeStaff();
  if ("error" in auth) return auth.error;
  const { dbClient, hasServiceRole } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const assetKey = formData.get("assetKey");

    if (!(file instanceof File) || typeof assetKey !== "string" || !assetKey) {
      return NextResponse.json({ error: "Missing file or asset key identification." }, { status: 400 });
    }

    if (!ALLOWED_ASSET_KEYS.has(assetKey)) {
      return NextResponse.json({ error: `Unsupported asset key "${assetKey}".` }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file format. Please upload PNG, JPG, WEBP, SVG, GIF, or AVIF." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Image must be between 1 byte and 10 MB." }, { status: 400 });
    }

    if (hasServiceRole) {
      const { data: bucket } = await dbClient.storage.getBucket("site-assets");
      if (!bucket) {
        await dbClient.storage.createBucket("site-assets", { public: true });
      }
    }

    const fileExt = MIME_EXT_MAP[file.type] || file.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `brand/${assetKey}-${crypto.randomUUID()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload to Storage (bucket: site-assets)
    const { error: uploadError } = await dbClient.storage
      .from("site-assets")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 2. Resolve Public URL
    const { data: { publicUrl } } = dbClient.storage
      .from("site-assets")
      .getPublicUrl(filePath);

    // 3. Update Site Settings Registry
    const { data: currentSettings } = await dbClient
      .from("site_settings")
      .select("value")
      .eq("key", "brand_assets")
      .maybeSingle();

    const newSettings: Record<string, string> = {
      ...((currentSettings?.value as Record<string, string>) || {}),
      [assetKey]: publicUrl,
    };

    const { error: settingsError } = await dbClient
      .from("site_settings")
      .upsert(
        {
          key: "brand_assets",
          value: newSettings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (settingsError) throw settingsError;

    revalidateBrandPages();

    return NextResponse.json({ success: true, url: publicUrl, assets: newSettings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Content Upload Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Reset a brand asset back to its default placeholder image.
 */
export async function DELETE(req: NextRequest) {
  const auth = await authorizeStaff();
  if ("error" in auth) return auth.error;
  const { dbClient } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const assetKey = searchParams.get("assetKey");

    if (!assetKey || !ALLOWED_ASSET_KEYS.has(assetKey)) {
      return NextResponse.json({ error: "Invalid or missing assetKey." }, { status: 400 });
    }

    const { data: currentSettings } = await dbClient
      .from("site_settings")
      .select("value")
      .eq("key", "brand_assets")
      .maybeSingle();

    const currentMap = { ...((currentSettings?.value as Record<string, string>) || {}) };
    delete currentMap[assetKey];

    const { error: settingsError } = await dbClient
      .from("site_settings")
      .upsert(
        {
          key: "brand_assets",
          value: currentMap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (settingsError) throw settingsError;

    revalidateBrandPages();

    return NextResponse.json({ success: true, assets: currentMap });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Reset failed";
    console.error("Content Reset Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
