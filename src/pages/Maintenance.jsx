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
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Search, Build, Engineering, CalendarToday, CheckCircle } from "@mui/icons-material";
import { getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance, markToolAsFixed } from "../services/maintenanceService";
import { getTools } from "../services/toolService";
import { formatCurrency, formatDate, isRecentDate, calculateMaintenanceDuration } from "../utils/helpers";

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const [maintenanceData, toolsData] = await Promise.all([
        getMaintenance(),
        getTools()
      ]);
      setMaintenance(maintenanceData);
      setFilteredMaintenance(maintenanceData);
      setTools(toolsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
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

  const handleMarkAsFixed = async (toolId, maintenanceId) => {
    if (window.confirm("Marquer cet outil comme réparé ?")) {
      try {
        await markToolAsFixed(toolId, maintenanceId);
        loadData();
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
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



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement des maintenances...
        </Typography>
      </div>
    );
  }

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
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date Début</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date Réparation</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Coût</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantité</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaintenance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" className="py-12 text-gray-500">
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
                const isRecent = isRecentDate(item.date, 30);
                
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
                            {formatDate(item.date)}
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
                      <div className="flex items-center space-x-2">
                        <CalendarToday sx={{ fontSize: 16, color: "#6b7280" }} />
                        <div>
                          <Typography variant="body2" className="text-gray-900">
                            {item.fixed_date ? formatDate(item.fixed_date) : "En cours"}
                          </Typography>
                          {item.fixed_date ? (
                            <Chip
                              label={`${calculateMaintenanceDuration(item.date, item.fixed_date)} jour(s)`}
                              size="small"
                              sx={{
                                backgroundColor: "#ecfdf5",
                                color: "#065f46",
                                fontSize: "0.7rem",
                                height: "20px",
                                marginTop: "2px",
                              }}
                            />
                          ) : (
                            <Chip
                              label={`${calculateMaintenanceDuration(item.date)} jour(s)`}
                              size="small"
                              sx={{
                                backgroundColor: "#fef3cd",
                                color: "#92400e",
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
                        {formatCurrency(item.cost)}
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
                          onClick={() => handleMarkAsFixed(item.tool_id, item.id)}
                          disabled={!!item.fixed_date}
                          sx={{
                            color: item.fixed_date ? "#10b981" : "#6b7280",
                            "&:hover": {
                              backgroundColor: "#ecfdf5",
                              color: "#10b981",
                            },
                          }}
                          title={item.fixed_date ? "Déjà réparé" : "Marquer comme réparé"}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
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
        <DialogContent sx={{ padding: "24px", minHeight: "400px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Tool Selection Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                Sélection de l'outil
              </Typography>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#6b7280" }}>Choisir un outil</InputLabel>
                <Select
                  value={formData.tool_id}
                  onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
                  sx={{
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#10b981",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#059669",
                      borderWidth: "2px",
                    },
                  }}
                >
                  {tools.map((tool) => (
                    <MenuItem key={tool.id} value={tool.id} sx={{ py: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                        <Avatar 
                          src={tool.picture}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: "#ecfdf5",
                            color: "#059669"
                          }}
                        >
                          <Build sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: "#111827" }}>
                            {tool.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6b7280" }}>
                            {tool.type} • État: {tool.condition}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Selected Tool Preview */}
              {formData.tool_id && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "12px",
                    backgroundColor: "#f9fafb"
                  }}
                >
                  {(() => {
                    const selectedTool = tools.find(t => t.id === formData.tool_id);
                    return selectedTool ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar 
                          src={selectedTool.picture}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: "#ecfdf5",
                            color: "#059669"
                          }}
                        >
                          <Build sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                            {selectedTool.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            Type: {selectedTool.type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            État: {selectedTool.condition}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null;
                  })()} 
                </Box>
              )}
            </Box>

            {/* Description Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                Description de l'intervention
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez en détail les travaux de maintenance effectués, les pièces remplacées, les problèmes identifiés..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "#d1d5db",
                    },
                    "&:hover fieldset": {
                      borderColor: "#10b981",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#059669",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
            </Box>

            {/* Details Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#374151" }}>
                Détails de l'intervention
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Date d'intervention"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: "#d1d5db" },
                        "&:hover fieldset": { borderColor: "#10b981" },
                        "&.Mui-focused fieldset": { borderColor: "#059669", borderWidth: "2px" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Coût de l'intervention"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">💰</InputAdornment>,
                      endAdornment: <InputAdornment position="end">TND</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: "#d1d5db" },
                        "&:hover fieldset": { borderColor: "#10b981" },
                        "&.Mui-focused fieldset": { borderColor: "#059669", borderWidth: "2px" },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Quantité d'outils"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🔧</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: "#d1d5db" },
                        "&:hover fieldset": { borderColor: "#10b981" },
                        "&.Mui-focused fieldset": { borderColor: "#059669", borderWidth: "2px" },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            padding: "24px", 
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
            gap: 2,
            justifyContent: "flex-end"
          }}
        >
          <Button 
            onClick={handleClose}
            variant="outlined"
            sx={{
              color: "#6b7280",
              borderColor: "#d1d5db",
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#9ca3af",
              },
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            startIcon={<Engineering />}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {editMaintenance ? "Mettre à jour" : "Créer la maintenance"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}