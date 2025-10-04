import { supabase } from "./supabaseClient";

export async function getLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      users(name),
      tools(name)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createLoan(loan) {
  const { data, error } = await supabase
    .from("loans")
    .insert([loan])
    .select();
  
  if (error) throw new Error(error.message);
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