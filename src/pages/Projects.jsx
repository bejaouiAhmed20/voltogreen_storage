import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Search, Work, Visibility, Assignment } from "@mui/icons-material";
import { getProjects, createProject, updateProject, deleteProject, getProjectDetails } from "../services/projectService";
import { formatDate, formatCurrency } from "../utils/helpers";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLoans, setProjectLoans] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    address: "",
    start_date: "",
    end_date: "",
    status: "planifié",
  });

  const statuses = ["planifié", "actif", "terminé", "annulé"];

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const handleSubmit = async () => {
    try {
      if (editProject) {
        await updateProject(editProject.id, formData);
      } else {
        await createProject(formData);
      }
      loadProjects();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du projet:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      try {
        await deleteProject(id);
        loadProjects();
      } catch (error) {
        console.error("Erreur lors de la suppression du projet:", error);
      }
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setFormData({
      name: project.client_name || "",
      client_name: project.client_name || "",
      address: project.address || "",
      start_date: project.start_date ? project.start_date.split('T')[0] : "",
      end_date: project.end_date ? project.end_date.split('T')[0] : "",
      status: project.status || "planifié",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProject(null);
    setFormData({
      name: "",
      client_name: "",
      address: "",
      start_date: "",
      end_date: "",
      status: "planifié",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      planifié: "#3b82f6",
      actif: "#10b981",
      terminé: "#22c55e",
      annulé: "#ef4444"
    };
    return colors[status] || "#6b7280";
  };

  const handleViewDetails = async (project) => {
    try {
      setDetailsLoading(true);
      setSelectedProject(project);
      const loans = await getProjectDetails(project.id);
      setProjectLoans(loans);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getProjectStats = (loans) => {
    const totalLoaned = loans.reduce((sum, loan) => sum + (loan.quantity || 0), 0);
    const totalReturned = loans.reduce((sum, loan) => sum + (loan.returned_quantity || 0), 0);
    const totalDamaged = loans.reduce((sum, loan) => sum + (loan.dameged_quantity || 0), 0);
    const totalLost = loans.reduce((sum, loan) => sum + (loan.lost_quantity || 0), 0);
    const totalInstalled = loans.reduce((sum, loan) => sum + (loan.installed_quantity || 0), 0);
    
    return { totalLoaned, totalReturned, totalDamaged, totalLost, totalInstalled };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement des projets...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Gestion des Projets
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {filteredProjects.length} projet(s) trouvé(s)
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            },
          }}
        >
          Nouveau Projet
        </Button>
      </div>

      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher par nom, client ou adresse..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "white",
            }
          }}
        />
      </Box>

      <div className="flex justify-center">
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            width: "100%",
          }}
        >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Client</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Adresse</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Date de début</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-12 text-gray-500">
                  <Work sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    {searchTerm ? "Aucun projet trouvé" : "Aucun projet"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? "Ajustez vos critères de recherche" : "Créez votre premier projet"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Typography 
                      variant="body1" 
                      className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleViewDetails(project)}
                      sx={{ textDecoration: 'underline', fontSize: "15px" }}
                    >
                      {project.client_name || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Typography variant="body2" className="text-gray-700" sx={{ fontSize: "15px" }}>
                      {project.address || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Typography variant="body2" className="text-gray-700" sx={{ fontSize: "15px" }}>
                      {formatDate(project.start_date)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(project.status) + "20",
                        color: getStatusColor(project.status),
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <div className="flex justify-center space-x-1">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(project)}
                        sx={{
                          color: "#6b7280",
                          fontSize: "12px",
                          textTransform: "none",
                          minWidth: "auto",
                          padding: "4px 8px",
                          "&:hover": {
                            backgroundColor: "#f0f9ff",
                            color: "#0ea5e9",
                          },
                        }}
                      >
                        Voir
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(project)}
                        sx={{
                          color: "#6b7280",
                          fontSize: "12px",
                          textTransform: "none",
                          minWidth: "auto",
                          padding: "4px 8px",
                          "&:hover": {
                            backgroundColor: "#eff6ff",
                            color: "#3b82f6",
                          },
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(project.id)}
                        sx={{
                          color: "#6b7280",
                          fontSize: "12px",
                          textTransform: "none",
                          minWidth: "auto",
                          padding: "4px 8px",
                          "&:hover": {
                            backgroundColor: "#fef2f2",
                            color: "#ef4444",
                          },
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: "600"
        }}>
          {editProject ? "Modifier le projet" : "Nouveau projet"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
            fullWidth
            label="Nom du client"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value, name: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <TextField
            fullWidth
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
          <div className="grid grid-cols-3 gap-4">
            <TextField
              fullWidth
              label="Date de début"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{ borderRadius: "8px" }}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "20px 24px", gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
              borderRadius: "8px",
            }}
          >
            {editProject ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "90vh"
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: "600"
        }}>
          <Box className="flex items-center gap-2">
            <Work sx={{ color: "#3b82f6" }} />
            Détails du Projet: {selectedProject?.client_name}
          </Box>
        </DialogTitle>
        <DialogContent className="pt-4">
          {detailsLoading ? (
            <Box className="flex justify-center items-center py-8">
              <CircularProgress />
              <Typography variant="body2" className="ml-2 text-gray-500">
                Chargement des détails...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Project Information */}
              <Box className="mb-6">
                <Typography variant="h6" className="font-bold text-gray-900 mb-3">
                  Informations du Projet
                </Typography>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Box>
                    <Typography variant="body2" className="text-gray-600">Client:</Typography>
                    <Typography variant="body1" className="font-medium">{selectedProject?.client_name || "N/A"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600">Statut:</Typography>
                    <Chip
                      label={selectedProject?.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selectedProject?.status) + "20",
                        color: getStatusColor(selectedProject?.status),
                        fontWeight: "500",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600">Adresse:</Typography>
                    <Typography variant="body1" className="font-medium">{selectedProject?.address || "N/A"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600">Date de début:</Typography>
                    <Typography variant="body1" className="font-medium">{formatDate(selectedProject?.start_date)}</Typography>
                  </Box>
                </div>
              </Box>

              {/* Statistics */}
              {projectLoans.length > 0 && (
                <Box className="mb-6">
                  <Typography variant="h6" className="font-bold text-gray-900 mb-3">
                    Statistiques des Outils
                  </Typography>
                  <div className="grid grid-cols-5 gap-3">
                    {(() => {
                      const stats = getProjectStats(projectLoans);
                      return (
                        <>
                          <Box className="text-center p-3 bg-blue-50 rounded-lg">
                            <Typography variant="h6" className="font-bold text-blue-600">{stats.totalLoaned}</Typography>
                            <Typography variant="caption" className="text-blue-600">Prêtés</Typography>
                          </Box>
                          <Box className="text-center p-3 bg-green-50 rounded-lg">
                            <Typography variant="h6" className="font-bold text-green-600">{stats.totalReturned}</Typography>
                            <Typography variant="caption" className="text-green-600">Retournés</Typography>
                          </Box>
                          <Box className="text-center p-3 bg-emerald-50 rounded-lg">
                            <Typography variant="h6" className="font-bold text-emerald-600">{stats.totalInstalled}</Typography>
                            <Typography variant="caption" className="text-emerald-600">Installés</Typography>
                          </Box>
                          <Box className="text-center p-3 bg-red-50 rounded-lg">
                            <Typography variant="h6" className="font-bold text-red-600">{stats.totalDamaged}</Typography>
                            <Typography variant="caption" className="text-red-600">Endommagés</Typography>
                          </Box>
                          <Box className="text-center p-3 bg-orange-50 rounded-lg">
                            <Typography variant="h6" className="font-bold text-orange-600">{stats.totalLost}</Typography>
                            <Typography variant="caption" className="text-orange-600">Perdus</Typography>
                          </Box>
                        </>
                      );
                    })()}
                  </div>
                </Box>
              )}

              {/* Tools Loans */}
              <Box>
                <Typography variant="h6" className="font-bold text-gray-900 mb-3">
                  Outils Prêtés ({projectLoans.length})
                </Typography>
                {projectLoans.length === 0 ? (
                  <Box className="text-center py-8 text-gray-500">
                    <Assignment sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                    <Typography variant="h6" className="mb-2">
                      Aucun outil prêté
                    </Typography>
                    <Typography variant="body2">
                      Aucun outil n'a encore été prêté pour ce projet
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                          <TableCell sx={{ fontWeight: "600" }}>Outil</TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>Utilisateur</TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>Dates</TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>Quantités</TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projectLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>
                              <Typography variant="body2" className="font-medium">
                                {loan.tools?.name || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {loan.users?.name || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" className="block">
                                Début: {formatDate(loan.start_date)}
                              </Typography>
                              <Typography variant="caption" className="block">
                                Retour: {formatDate(loan.return_date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box className="flex flex-wrap gap-1">
                                <Chip label={`Donné: ${loan.quantity || 0}`} size="small" color="primary" variant="outlined" />
                                {loan.returned_quantity > 0 && <Chip label={`Retourné: ${loan.returned_quantity}`} size="small" sx={{ bgcolor: "#dcfce7", color: "#166534" }} />}
                                {loan.installed_quantity > 0 && <Chip label={`Installé: ${loan.installed_quantity}`} size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46" }} />}
                                {loan.dameged_quantity > 0 && <Chip label={`Endommagé: ${loan.dameged_quantity}`} size="small" sx={{ bgcolor: "#fee2e2", color: "#991b1b" }} />}
                                {loan.lost_quantity > 0 && <Chip label={`Perdu: ${loan.lost_quantity}`} size="small" sx={{ bgcolor: "#fed7aa", color: "#9a3412" }} />}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={loan.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(loan.status) + "20",
                                  color: getStatusColor(loan.status),
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "20px 24px" }}>
          <Button
            onClick={() => setDetailsOpen(false)}
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
