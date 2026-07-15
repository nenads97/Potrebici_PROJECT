import { supabase } from "../../../shared/supabase/client";

const adminAuthTimeoutMs = 2500;

export async function isCurrentUserAdmin() {
  if (!supabase) {
    return false;
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await withTimeout(
      supabase.auth.getUser(),
      adminAuthTimeoutMs,
    );
    const userId = user?.id;

    if (userError || !userId) {
      return false;
    }

    const { data, error } = await withTimeout(
      supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", userId)
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
