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
  Chip,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Search, Build } from "@mui/icons-material";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../services/loanService";
import { getUsers } from "../services/userService";
import { getTools } from "../services/toolService";
import { getProjects } from "../services/projectService";
import { getStatusColor, formatDate } from "../utils/helpers";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [formData, setFormData] = useState({
    user_id: "",
    start_date: "",
    project_id: "",
    status: "emprunté",
    tools: [{ tool_id: "", quantity: 1 }],
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = loans.filter(loan =>
      loan.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.tools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateFilter.start) {
      filtered = filtered.filter(loan => 
        new Date(loan.start_date) >= new Date(dateFilter.start)
      );
    }
    if (dateFilter.end) {
      filtered = filtered.filter(loan => 
        new Date(loan.start_date) <= new Date(dateFilter.end)
      );
    }

    setFilteredLoans(filtered);
  }, [searchTerm, dateFilter, loans]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, usersData, toolsData, projectsData] = await Promise.all([
        getLoans(),
        getUsers(),
        getTools(),
        getProjects()
      ]);
      setLoans(loansData);
      setFilteredLoans(loansData);
      setUsers(usersData);
      setTools(toolsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user_id) newErrors.user_id = "L'utilisateur est requis";
    if (!formData.start_date.trim()) newErrors.start_date = "La date de début est requise";
    if (!formData.project_id) newErrors.project_id = "Le projet est requis";
    if (formData.tools.some(tool => !tool.tool_id)) newErrors.tools = "Tous les outils doivent être sélectionnés";
    if (formData.tools.some(tool => !tool.quantity || tool.quantity <= 0)) newErrors.quantity = "La quantité doit être supérieure à 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setError("");
      if (editLoan) {
        const loanData = {
          user_id: formData.user_id,
          start_date: formData.start_date,
          status: formData.status,
          tool_id: formData.tools[0].tool_id,
          quantity: formData.tools[0].quantity
        };
        await updateLoan(editLoan.id, loanData);
      } else {
        // Create multiple loans for each tool
        for (const tool of formData.tools) {
          if (tool.tool_id && tool.quantity > 0) {
            const loanData = {
              user_id: formData.user_id,
              start_date: formData.start_date,
              project_id: formData.project_id,
              status: "emprunté",
              tool_id: tool.tool_id,
              quantity: tool.quantity
            };
            await createLoan(loanData);
          }
        }
      }
      loadData();
      handleClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr ?")) {
      try {
        await deleteLoan(id);
        loadData();
      } catch (error) {
        console.error("Error deleting loan:", error);
      }
    }
  };

  const handleEdit = (loan) => {
    setEditLoan(loan);
    setFormData({
      user_id: loan.user_id || "",
      start_date: loan.start_date ? loan.start_date.split('T')[0] : "",
      project_id: loan.project_id || "",
      status: loan.status || "emprunté",
      tools: [{ tool_id: loan.tool_id || "", quantity: loan.quantity || 1 }],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLoan(null);
    setError("");
    setErrors({});
    setFormData({
      user_id: "",
      start_date: "",
      project_id: "",
      status: "emprunté",
      tools: [{ tool_id: "", quantity: 1 }],
    });
  };

  const addTool = () => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { tool_id: "", quantity: 1 }]
    });
  };

  const removeTool = (index) => {
    if (formData.tools.length > 1) {
      const newTools = formData.tools.filter((_, i) => i !== index);
      setFormData({ ...formData, tools: newTools });
    }
  };

  const updateTool = (index, field, value) => {
    const newTools = [...formData.tools];
    newTools[index][field] = field === 'quantity' ? parseInt(value) : value;
    setFormData({ ...formData, tools: newTools });
  };

  const getSelectedTool = (toolId) => {
    return tools.find(tool => tool.id === toolId);
  };

  const getQuantityError = (toolId, requestedQuantity) => {
    const tool = getSelectedTool(toolId);
    if (tool && requestedQuantity > tool.quantity) {
      return `Seulement ${tool.quantity} disponible`;
    }
    return null;
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement des prêts...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-green-700">
          Gestion des Prêts
        </Typography>
        <div className="flex gap-4">
          <TextField
            size="small"
            placeholder="Rechercher des prêts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search className="mr-2 text-gray-400" />
            }}
          />
          <TextField
            size="small"
            label="Date début"
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="Date fin"
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
              borderRadius: "8px",
            }}
          >
            Ajouter Prêt
          </Button>
        </div>
      </div>

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
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Image</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Outil</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Début</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Retour</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Ret.</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Inst.</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>End.</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Perd.</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px" }}>Projet</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "8px 12px", fontSize: "14px", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id} sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}>
                <TableCell sx={{ padding: "8px 12px" }}>
                  <Avatar
                    src={loan.tools?.picture}
                    sx={{ width: 32, height: 32 }}
                  >
                    <Build sx={{ fontSize: 16 }} />
                  </Avatar>
                </TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{loan.users?.name || "N/A"}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{loan.tools?.name || "N/A"}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{formatDate(loan.start_date)}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{formatDate(loan.return_date)}</TableCell>
                <TableCell sx={{ padding: "8px 12px" }}>
                  <Chip label={loan.status} color={getStatusColor(loan.status)} size="small" sx={{ fontSize: "12px" }} />
                </TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px", textAlign: "center" }}>{loan.quantity}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px", textAlign: "center" }}>{loan.returned_quantity || 0}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px", textAlign: "center" }}>{loan.installed_quantity || 0}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px", textAlign: "center" }}>{loan.dameged_quantity || 0}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px", textAlign: "center" }}>{loan.lost_quantity || 0}</TableCell>
                <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{loan.projects?.name || "N/A"}</TableCell>
                <TableCell sx={{ padding: "8px 12px" }}>
                  <div className="flex justify-center space-x-2">
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(loan)}
                      sx={{
                        color: "#6b7280",
                        fontSize: "13px",
                        textTransform: "none",
                        minWidth: "auto",
                        padding: "6px 12px",
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
                      onClick={() => handleDelete(loan.id)}
                      sx={{
                        color: "#6b7280",
                        fontSize: "13px",
                        textTransform: "none",
                        minWidth: "auto",
                        padding: "6px 12px",
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
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editLoan ? "Modifier Prêt" : "Ajouter Prêt"}</DialogTitle>
        <DialogContent className="space-y-4">
          <FormControl fullWidth margin="normal">
            <InputLabel>Utilisateur</InputLabel>
            <Select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="subtitle1">Outils</Typography>
              {!editLoan && (
                <Button size="small" onClick={addTool} variant="outlined">
                  Ajouter Outil
                </Button>
              )}
            </div>
            {formData.tools.map((tool, index) => {
              const selectedTool = getSelectedTool(tool.tool_id);
              const quantityError = getQuantityError(tool.tool_id, tool.quantity);
              
              return (
                <div key={index} className="border rounded-lg p-3 mb-3">
                  <div className="flex gap-2 items-start">
                    {selectedTool && (
                      <Avatar
                        src={selectedTool.picture}
                        sx={{ width: 50, height: 50 }}
                      >
                        <Build />
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <FormControl fullWidth margin="dense">
                        <InputLabel>Outil</InputLabel>
                        <Select
                          value={tool.tool_id}
                          onChange={(e) => updateTool(index, 'tool_id', e.target.value)}
                        >
                          {tools.map((t) => (
                            <MenuItem 
                              key={t.id} 
                              value={t.id}
                              disabled={!t.availability || t.quantity === 0}
                              sx={{
                                color: !t.availability ? '#f97316' : t.quantity === 0 ? '#ef4444' : 'inherit',
                                backgroundColor: !t.availability ? '#fef3cd' : t.quantity === 0 ? '#fef2f2' : 'inherit'
                              }}
                            >
                              {t.name} 
                              {!t.availability && ' (En maintenance)'}
                              {t.availability && t.quantity === 0 && ' (Rupture de stock)'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <div className="flex gap-2 items-center mt-2">
                        <TextField
                          label="Quantité"
                          type="number"
                          value={tool.quantity}
                          onChange={(e) => updateTool(index, 'quantity', e.target.value)}
                          error={!!quantityError}
                          helperText={quantityError || (selectedTool ? `Disponible: ${selectedTool.quantity}` : '')}
                          sx={{ width: 120 }}
                        />
                        {!editLoan && formData.tools.length > 1 && (
                          <IconButton onClick={() => removeTool(index)} color="error">
                            <Delete />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <TextField
            fullWidth
            label="Date de Début"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormControl fullWidth margin="normal">
              <InputLabel>Projet</InputLabel>
              <Select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                {projects.map((project) => (
                  <MenuItem 
                    key={project.id} 
                    value={project.id}
                    disabled={project.status === "terminé"}
                    sx={{
                      color: project.status === "terminé" ? '#9ca3af' : 'inherit',
                      backgroundColor: project.status === "terminé" ? '#f9fafb' : 'inherit'
                    }}
                  >
                    {project.name} - {project.address}
                    {project.status === "terminé" && " (Terminé)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="emprunté">Emprunté</MenuItem>
                <MenuItem value="retourné">Retourné</MenuItem>
                <MenuItem value="installée">Installée</MenuItem>
              </Select>
            </FormControl>
          </div>
          {error && (
            <Typography color="error" variant="body2" className="mt-2">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editLoan ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}