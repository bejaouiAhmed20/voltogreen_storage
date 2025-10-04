import { supabase } from "./supabaseClient";

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createUser(user) {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function updateUser(id, user) {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
}