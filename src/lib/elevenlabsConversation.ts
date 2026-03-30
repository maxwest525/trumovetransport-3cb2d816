import { supabase } from "@/integrations/supabase/client";

export async function fetchElevenLabsConversationToken() {
  const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
    method: "POST",
  });

  if (error) {
    throw new Error(error.message || "Failed to start voice session");
  }

  if (!data?.token) {
    throw new Error(data?.error || "No conversation token received");
  }

  return data.token as string;
}