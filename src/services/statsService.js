import { supabase } from "./supabaseClient";

export async function getStats() {
  try {
    const [usersResult, toolsResult, loansResult, maintenanceResult, projectsResult] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("tools").select("*"),
      supabase.from("loans").select("*"),
      supabase.from("maintenance").select("*"),
      supabase.from("projects").select("*")
    ]);

    const users = usersResult.data || [];
    const tools = toolsResult.data || [];
    const loans = loansResult.data || [];
    const maintenance = maintenanceResult.data || [];
    const projects = projectsResult.data || [];

    const damagedTools = tools.filter(tool => tool.condition === "nécessite_réparation").length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPurchases = tools
      .filter(tool => {
        const toolDate = new Date(tool.created_at);
        return toolDate.getMonth() === currentMonth && toolDate.getFullYear() === currentYear;
      })
      .reduce((sum, tool) => sum + (tool.price || 0), 0);
    const maintenanceCost = maintenance.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    const totalDamaged = loans.reduce((sum, loan) => sum + (loan.damaged_quantity || 0), 0);
    const totalLost = loans.reduce((sum, loan) => sum + (loan.lost_quantity || 0), 0);
    const totalInstalled = loans.reduce((sum, loan) => sum + (loan.installed_quantity || 0), 0);

    return {
      totalUsers: users.length,
      totalTools: tools.length,
      totalLoans: loans.length,
      totalMaintenance: maintenance.length,
      totalProjects: projects.length,
      damagedTools,
      monthlyPurchases,
      maintenanceCost,
      totalDamaged,
      totalLost,
      totalInstalled,
      utilizationRate: tools.length > 0 ? (loans.length / tools.length) * 100 : 0,
      maintenanceRate: monthlyPurchases > 0 ? (maintenanceCost / monthlyPurchases) * 100 : 0
    };
  } catch (error) {
    throw new Error(error.message);
  }
}