import { supabase } from "./supabaseClient";

export async function getMaintenance() {
  const { data, error } = await supabase
    .from("maintenance")
    .select(`
      *,
      tools(name, type, condition, picture)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createMaintenance(maintenance) {
  // Create maintenance record
  const { data, error } = await supabase
    .from("maintenance")
    .insert([maintenance])
    .select();
  
  if (error) throw new Error(error.message);
  
  // Set tool availability to false (under maintenance)
  const { error: updateError } = await supabase
    .from("tools")
    .update({ availability: false })
    .eq("id", maintenance.tool_id);
  
  if (updateError) throw new Error(updateError.message);
  
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

export async function markToolAsFixed(toolId, maintenanceId) {
  // Update tool availability
  const { error: toolError } = await supabase
    .from("tools")
    .update({ availability: true })
    .eq("id", toolId);
  
  if (toolError) throw new Error(toolError.message);
  
  // Record fixed date in maintenance record
  const { error: maintenanceError } = await supabase
    .from("maintenance")
    .update({ fixed_date: new Date().toISOString().split('T')[0] })
    .eq("id", maintenanceId);
  
  if (maintenanceError) throw new Error(maintenanceError.message);
}