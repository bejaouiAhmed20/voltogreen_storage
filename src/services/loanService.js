import { supabase } from "./supabaseClient";

export async function getLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      users(name),
      tools(name, picture),
      projects(name, address)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createLoan(loan) {
  // Check tool availability first
  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("quantity, availability")
    .eq("id", loan.tool_id)
    .single();
  
  if (toolError) throw new Error(toolError.message);
  
  if (!tool.availability) {
    throw new Error("Outil indisponible (en maintenance)");
  }
  
  if (tool.quantity < loan.quantity) {
    throw new Error(`Quantité insuffisante. Disponible: ${tool.quantity}`);
  }
  
  // Create loan
  const { data, error } = await supabase
    .from("loans")
    .insert([loan])
    .select();
  
  if (error) throw new Error(error.message);
  
  // Reduce tool quantity
  const { error: updateError } = await supabase
    .from("tools")
    .update({ quantity: tool.quantity - loan.quantity })
    .eq("id", loan.tool_id);
  
  if (updateError) throw new Error(updateError.message);
  
  return data[0];
}

export async function updateLoan(id, loan) {
  const { data, error } = await supabase
    .from("loans")
    .update(loan)
    .eq("id", id)
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteLoan(id) {
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
}

export async function getToolLoanHistory(toolId) {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      users(name),
      projects(name, address)
    `)
    .eq("tool_id", toolId)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}