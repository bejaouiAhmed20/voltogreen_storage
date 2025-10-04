import { supabase } from "./supabaseClient";

export async function loginUser(cin, password) {
  // Look for the user by CIN + password
  const { data, error } = await supabase
    .from("users")
    .select("id, name, cin, role, is_admin, password")
    .eq("cin", cin)
    .eq("password", password)
    .single();

  if (error) {
    throw new Error("CIN ou mot de passe incorrect");
  }

  return data;
}
