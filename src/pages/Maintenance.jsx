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
  Avatar,
  Chip,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, Search, Build, Engineering, CalendarToday } from "@mui/icons-material";
import { getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from "../services/maintenanceService";
import { getTools } from "../services/toolService";

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [tools, setTools] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMaintenance, setEditMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tool_id: "",
    description: "",
    date: "",
    cost: 0,
    quantity: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = maintenance.filter(item =>
      item.tools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaintenance(filtered);
  }, [searchTerm, maintenance]);

  const loadData = async () => {
    try {
      const [maintenanceData, toolsData] = await Promise.all([
        getMaintenance(),
        getTools()
      ]);
      setMaintenance(maintenanceData);
      setFilteredMaintenance(maintenanceData);
      setTools(toolsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMaintenance) {
        await updateMaintenance(editMaintenance.id, formData);
      } else {
        await createMaintenance(formData);
      }
      loadData();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la maintenance:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement de maintenance ?")) {
      try {
        await deleteMaintenance(id);
        loadData();
      } catch (error) {
        console.error("Erreur lors de la suppression de la maintenance:", error);
      }
    }
  };

  const handleEdit = (item) => {
    setEditMaintenance(item);
    setFormData({
      tool_id: item.tool_id || "",
      description: item.description || "",
      date: item.date ? item.date.split('T')[0] : "",
      cost: item.cost || 0,
      quantity: item.quantity || 1,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMaintenance(null);
    setFormData({
      tool_id: "",
      description: "",
      date: "",
      cost: 0,
      quantity: 1,
    });
  };

  const getCostColor = (cost) => {
    if (cost > 1000) return "#ef4444";
    if (cost > 500) return "#f97316";
    if (cost > 100) return "#eab308";
    return "#22c55e";
  };

  const isRecentMaintenance = (date) => {
    if (!date) return false;
    const maintenanceDate = new Date(date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return maintenanceDate > thirtyDaysAgo;
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Gestion de la Maintenance
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {filteredMaintenance.length} intervention(s) de maintenance
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
          Nouvelle maintenance
        </Button>
      </div>

      {/* Search Bar */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher par outil ou description..."
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

      {/* Maintenance Table */}
      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Outil</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Coût</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantité</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaintenance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-12 text-gray-500">
                  <Engineering sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    {searchTerm ? "Aucune maintenance trouvée" : "Aucune maintenance"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? "Ajustez vos critères de recherche" : "Enregistrez votre première intervention"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMaintenance.map((item) => {
                const isRecent = isRecentMaintenance(item.date);
                
                return (
                  <TableRow 
                    key={item.id}
                    sx={{ 
                      "&:hover": { backgroundColor: "#f9fafb" },
                      transition: "background-color 0.2s ease",
                      borderLeft: isRecent ? "4px solid #10b981" : "none",
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#eff6ff",
                            color: "#1e40af",
                            fontSize: "1.25rem",
                          }}
                        >
                          <Build />
                        </Avatar>
                        <div>
                          <Typography variant="body1" className="font-medium text-gray-900">
                            {item.tools?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {item.tools?.type || ""}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        className="text-gray-700 line-clamp-2"
                        title={item.description}
                      >
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarToday sx={{ fontSize: 16, color: "#6b7280" }} />
                        <div>
                          <Typography variant="body2" className="text-gray-900">
                            {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : "N/A"}
                          </Typography>
                          {isRecent && (
                            <Chip
                              label="Récent"
                              size="small"
                              sx={{
                                backgroundColor: "#ecfdf5",
                                color: "#065f46",
                                fontSize: "0.7rem",
                                height: "20px",
                                marginTop: "2px",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        className="font-semibold"
                        sx={{ color: getCostColor(item.cost) }}
                      >
                        {item.cost?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                      {item.cost > 500 && (
                        <Typography variant="caption" className="text-amber-600 block">
                          Coût élevé
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box className="text-center">
                        <Typography 
                          variant="body1" 
                          className={`font-bold ${
                            item.quantity > 1 ? "text-amber-600" : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                        </Typography>
                        {item.quantity > 1 && (
                          <Typography variant="caption" className="text-gray-500">
                            Multiples
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-1">
                        <IconButton 
                          onClick={() => handleEdit(item)}
                          sx={{
                            color: "#6b7280",
                            "&:hover": {
                              backgroundColor: "#eff6ff",
                              color: "#3b82f6",
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(item.id)}
                          sx={{
                            color: "#6b7280",
                            "&:hover": {
                              backgroundColor: "#fef2f2",
                              color: "#ef4444",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Maintenance Dialog */}
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
          {editMaintenance ? "Modifier la maintenance" : "Nouvelle maintenance"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Outil</InputLabel>
                <Select
                  value={formData.tool_id}
                  onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  {tools.map((tool) => (
                    <MenuItem key={tool.id} value={tool.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#3b82f6' }}>
                          <Build sx={{ fontSize: 14 }} />
                        </Avatar>
                        <div>
                          <Typography variant="body1">{tool.name}</Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {tool.type} • {tool.condition}
                          </Typography>
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description de l'intervention"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                placeholder="Décrivez les travaux de maintenance effectués..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'intervention"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coût"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantité"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
          </Grid>
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
            {editMaintenance ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}