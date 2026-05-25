import { supabase } from "../../../shared/supabase/client";

export async function isCurrentUserAdmin() {
  if (!supabase) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
