const LATTE_ART_TABLE = "latte_art_orders";
const LATTE_ART_BUCKET = "latte-art-videos";

async function saveLatteArtRequest(orderId, selection) {
  const { data, error } = await getSupabaseClient()
    .from(LATTE_ART_TABLE)
    .insert({
      order_id: orderId,
      item_name: selection.menuName,
      shape: selection.shape,
      note: selection.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("saveLatteArtRequest failed:", error);
    return null;
  }
  return data;
}

async function getLatteArtByOrderId(orderId) {
  const { data, error } = await getSupabaseClient()
    .from(LATTE_ART_TABLE)
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("getLatteArtByOrderId failed:", error);
    return null;
  }
  return data;
}

async function uploadLatteArtVideo(orderId, file) {
  const client = getSupabaseClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  const filePath = `${orderId}-${Date.now()}.${extension}`;

  const { error: uploadError } = await client.storage.from(LATTE_ART_BUCKET).upload(filePath, file);

  if (uploadError) {
    console.error("uploadLatteArtVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(LATTE_ART_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(LATTE_ART_TABLE)
    .update({ video_url: urlData.publicUrl, video_uploaded_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) {
    console.error("uploadLatteArtVideo db update failed:", error);
    return null;
  }
  return data;
}
