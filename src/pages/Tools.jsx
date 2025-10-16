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
  Checkbox,
  FormControlLabel,
  Avatar,
  Box,
  InputAdornment,
  Chip,
  Grid,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Search, Build, Image, Assignment } from "@mui/icons-material";
import { getTools, createTool, updateTool, deleteTool, uploadToolImage } from "../services/toolService";
import { getToolLoanHistory } from "../services/loanService";
import { TOOL_TYPES, TOOL_CONDITIONS, LOW_STOCK_THRESHOLD } from "../utils/constants";
import { formatCurrency, getConditionColor, isLowStock, formatDate, getStatusColor } from "../utils/helpers";

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTool, setEditTool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    condition: "",
    quantity: 0,
    price: 0,
    purchase_date: "",
    picture: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errors, setErrors] = useState({});



  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, searchTerm]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await getTools();
      setTools(data);
    } catch (error) {
      console.error("Erreur lors du chargement des outils:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    if (!searchTerm.trim()) {
      setFilteredTools(tools);
      return;
    }

    const filtered = tools.filter(tool =>
      tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.condition?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTools(filtered);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.type.trim()) newErrors.type = "Le type est requis";
    if (!formData.condition.trim()) newErrors.condition = "L'état est requis";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "La quantité doit être supérieure à 0";
    if (!formData.price || formData.price <= 0) newErrors.price = "Le prix doit être supérieur à 0";
    if (!formData.purchase_date.trim()) newErrors.purchase_date = "La date d'achat est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setUploading(true);
      let toolData = { 
        ...formData,
        availability: true
      };
      
      if (selectedFile) {
        const imageUrl = await uploadToolImage(selectedFile);
        toolData.picture = imageUrl;
      }
      
      if (editTool) {
        await updateTool(editTool.id, toolData);
      } else {
        await createTool(toolData);
      }
      loadTools();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'outil:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet outil ?")) {
      try {
        await deleteTool(id);
        loadTools();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'outil:", error);
      }
    }
  };

  const handleEdit = (tool) => {
    setEditTool(tool);
    setFormData({
      name: tool.name || "",
      type: tool.type || "",
      condition: tool.condition || "",
      quantity: tool.quantity || 0,
      price: tool.price || 0,
      purchase_date: tool.purchase_date ? tool.purchase_date.split('T')[0] : "",
      picture: tool.picture || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTool(null);
    setSelectedFile(null);
    setErrors({});
    setFormData({
      name: "",
      type: "",
      condition: "",
      quantity: 0,
      price: 0,
      purchase_date: "",
      picture: "",
    });
  };

  const handleViewHistory = async (tool) => {
    try {
      setHistoryLoading(true);
      setSelectedTool(tool);
      const history = await getToolLoanHistory(tool.id);
      setLoanHistory(history);
      setHistoryOpen(true);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setSelectedTool(null);
    setLoanHistory([]);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement des outils...
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
            Gestion des Outils
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {filteredTools.length} outil(s) trouvé(s)
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
          Ajouter un outil
        </Button>
      </div>

      {/* Search Bar */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher un outil par nom, type ou état..."
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

      {/* Tools Table */}
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
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Image</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>État</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Quantité</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Prix</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px" }}>Disponible</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", padding: "12px 16px", fontSize: "16px", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="py-12 text-gray-500">
                  <Build sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    {searchTerm ? "Aucun outil trouvé" : "Aucun outil"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? "Ajustez vos critères de recherche" : "Ajoutez votre premier outil"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => (
                <TableRow 
                  key={tool.id}
                  sx={{ 
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Avatar
                      src={tool.picture}
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#ecfdf5",
                      }}
                    >
                      <Image sx={{ color: "#059669" }} />
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Typography 
                      variant="body1" 
                      className="font-medium text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
                      onClick={() => handleViewHistory(tool)}
                      title="Cliquer pour voir l'historique"
                      sx={{ fontSize: "15px" }}
                    >
                      {tool.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Chip
                      label={tool.type}
                      size="small"
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Chip
                      label={tool.condition}
                      size="small"
                      sx={{
                        backgroundColor: getConditionColor(tool.condition) + "20",
                        color: getConditionColor(tool.condition),
                        fontWeight: "500",
                        border: `1px solid ${getConditionColor(tool.condition)}30`,
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Box className="text-center">
                      <Typography 
                        variant="body1" 
                        className={`font-bold ${
                          tool.quantity === 0 ? "text-red-600" : 
                          isLowStock(tool.quantity, LOW_STOCK_THRESHOLD) ? "text-amber-600" : "text-green-600"
                        }`}
                        sx={{ fontSize: "15px" }}
                      >
                        {tool.quantity}
                      </Typography>
                      {tool.quantity === 0 && (
                        <Typography variant="caption" className="text-red-500">
                          Rupture
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Typography variant="body1" className="font-semibold text-gray-900" sx={{ fontSize: "15px" }}>
                      {formatCurrency(tool.price)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <Chip
                      label={tool.availability ? "Oui" : "Non"}
                      size="small"
                      sx={{
                        backgroundColor: tool.availability ? "#ecfdf5" : "#fef2f2",
                        color: tool.availability ? "#065f46" : "#991b1b",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px" }}>
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(tool)}
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
                        onClick={() => handleDelete(tool.id)}
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
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
      </div>

      {/* Add/Edit Tool Dialog */}
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
          {editTool ? "Modifier l'outil" : "Ajouter un outil"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Nom de l'outil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            >
              {TOOL_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="État"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            >
              {TOOL_CONDITIONS.map(condition => (
                <MenuItem key={condition} value={condition}>{condition}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Quantité"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            />
            <TextField
              fullWidth
              label="Prix (TND)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">TND</InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            />
            <TextField
              fullWidth
              label="Date d'achat"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                }
              }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#374151" }}>
                Image de l'outil
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  width: "100%",
                  backgroundColor: "#f9fafb"
                }}
              />
              {selectedFile && (
                <Typography variant="caption" sx={{ color: "#059669", mt: 1, display: "block" }}>
                  Fichier sélectionné: {selectedFile.name}
                </Typography>
              )}
            </Box>
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
            disabled={uploading}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
              borderRadius: "8px",
            }}
          >
            {uploading ? "Téléchargement..." : editTool ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tool History Dialog */}
      <Dialog 
        open={historyOpen} 
        onClose={handleCloseHistory} 
        maxWidth="lg" 
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
          Historique des prêts - {selectedTool?.name}
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          {historyLoading ? (
            <Box className="flex justify-center items-center py-8">
              <CircularProgress />
              <Typography variant="body2" className="ml-2 text-gray-500">
                Chargement de l'historique...
              </Typography>
            </Box>
          ) : loanHistory.length === 0 ? (
            <Box className="text-center py-8">
              <Assignment sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
              <Typography variant="h6" className="mb-2 text-gray-500">
                Aucun historique de prêt
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Cet outil n'a jamais été emprunté
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: "12px", mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Utilisateur</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Projet</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date Début</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date Retour</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantité</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanHistory.map((loan) => (
                    <TableRow key={loan.id} sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {loan.users?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {loan.projects?.name || "N/A"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {loan.projects?.address || ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(loan.start_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(loan.return_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {loan.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={loan.status}
                          color={getStatusColor(loan.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "20px 24px" }}>
          <Button 
            onClick={handleCloseHistory}
            variant="outlined"
            sx={{
              borderRadius: "8px",
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}