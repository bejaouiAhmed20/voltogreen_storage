import { supabase } from "./supabaseClient";

export async function getMaintenance() {
  const { data, error } = await supabase
    .from("maintenance")
    .select(`
      *,
      tools(name)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createMaintenance(maintenance) {
  const { data, error } = await supabase
    .from("maintenance")
    .insert([maintenance])
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function updateMaintenance(id, maintenance) {
  const { data, error } = await supabase
    .from("maintenance")
    .update(maintenance)
    .eq("id", id)
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteMaintenance(id) {
  const { error } = await supabase
    .from("maintenance")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
}