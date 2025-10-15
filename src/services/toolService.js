import { supabase } from "./supabaseClient";

export async function uploadToolImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('tools_pictures')
    .upload(fileName, file);
  
  if (error) throw new Error(error.message);
  
  const { data: { publicUrl } } = supabase.storage
    .from('tools_pictures')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

export async function getTools() {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createTool(tool) {
  const { data, error } = await supabase
    .from("tools")
    .insert([tool])
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function updateTool(id, tool) {
  const { data, error } = await supabase
    .from("tools")
    .update(tool)
    .eq("id", id)
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteTool(id) {
  const { error } = await supabase
    .from("tools")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
}