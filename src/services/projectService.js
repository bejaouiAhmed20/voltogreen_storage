import { supabase } from "./supabaseClient";

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function updateProject(id, project) {
  const { data, error } = await supabase
    .from("projects")
    .update(project)
    .eq("id", id)
    .select();
  
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteProject(id) {
  // First delete related loans
  const { error: loansError } = await supabase
    .from("loans")
    .delete()
    .eq("project_id", id);

  if (loansError) throw new Error(loansError.message);

  // Then delete the project
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
}

export async function getProjectDetails(projectId) {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      *,
      users(name),
      tools(name, picture)
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data;
}