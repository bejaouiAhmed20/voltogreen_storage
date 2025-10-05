import { supabase } from "./supabaseClient";

export async function uploadToolImage(file) {
  // For now, return a placeholder or use a different approach
  // You can use a free image hosting service or disable RLS on the bucket
  
  // Temporary solution: convert to base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
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