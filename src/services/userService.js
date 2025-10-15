import { supabase } from "./supabaseClient";

export async function uploadUserImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('users_pictures')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw new Error(error.message);
  
  const { data: urlData } = supabase.storage
    .from('users_pictures')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

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