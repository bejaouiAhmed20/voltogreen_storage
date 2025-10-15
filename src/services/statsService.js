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

    const activeLoans = loans.filter(loan => loan.status === "borrowed").length;
    const lowStockTools = tools.filter(tool => tool.quantity < 5).length;
    const totalValue = tools.reduce((sum, tool) => sum + (tool.price * tool.quantity), 0);
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
      activeLoans,
      lowStockTools,
      totalValue,
      maintenanceCost,
      totalDamaged,
      totalLost,
      totalInstalled,
      utilizationRate: loans.length > 0 ? (activeLoans / loans.length) * 100 : 0,
      maintenanceRate: totalValue > 0 ? (maintenanceCost / totalValue) * 100 : 0
    };
  } catch (error) {
    throw new Error(error.message);
  }
}