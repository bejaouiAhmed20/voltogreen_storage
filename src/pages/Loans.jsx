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
  const [formData, setFormData] = useState({
    user_id: "",
    start_date: "",
    project_id: "",
    tools: [{ tool_id: "", quantity: 1 }],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = loans.filter(loan =>
      loan.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.tools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLoans(filtered);
  }, [searchTerm, loans]);

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

  const handleSubmit = async () => {
    try {
      setError("");
      if (editLoan) {
        const loanData = {
          user_id: formData.user_id,
          start_date: formData.start_date,
          location: formData.location,
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
      tools: [{ tool_id: loan.tool_id || "", quantity: loan.quantity || 1 }],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLoan(null);
    setError("");
    setFormData({
      user_id: "",
      start_date: "",
      project_id: "",
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Ajouter Prêt
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image Outil</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Outil</TableCell>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Retour</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Projet</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>
                  <Avatar
                    src={loan.tools?.picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    <Build />
                  </Avatar>
                </TableCell>
                <TableCell>{loan.users?.name || "N/A"}</TableCell>
                <TableCell>{loan.tools?.name || "N/A"}</TableCell>
                <TableCell>{formatDate(loan.start_date)}</TableCell>
                <TableCell>{formatDate(loan.return_date)}</TableCell>
                <TableCell>
                  <Chip label={loan.status} color={getStatusColor(loan.status)} size="small" />
                </TableCell>
                <TableCell>{loan.quantity}</TableCell>
                <TableCell>{loan.projects?.name || "N/A"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(loan)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(loan.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          <FormControl fullWidth margin="normal">
            <InputLabel>Projet</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} - {project.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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