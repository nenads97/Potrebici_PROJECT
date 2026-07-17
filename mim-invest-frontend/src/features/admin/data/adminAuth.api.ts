import { supabase } from "../../../shared/supabase/client";

const adminAuthTimeoutMs = 2500;

export async function isCurrentUserAdmin(userId?: string) {
  if (!supabase) {
    return false;
  }

  try {
    const resolvedUserId =
      userId ??
      (await withTimeout(supabase.auth.getSession(), adminAuthTimeoutMs)).data.session?.user.id;

    if (!resolvedUserId) {
      return false;
    }

    const { data, error } = await withTimeout(
      supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", resolvedUserId)
        .maybeSingle(),
      adminAuthTimeoutMs,
    );

    if (error) {
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Supabase Auth provera je istekla."));
    }, timeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}
