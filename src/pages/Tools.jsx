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
} from "@mui/material";
import { Add, Edit, Delete, Search, Build, Image } from "@mui/icons-material";
import { getTools, createTool, updateTool, deleteTool, uploadToolImage } from "../services/toolService";

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
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

  const toolTypes = ["Basic Hand Tools", "Electrical Tools", "Power Tools", "Installation & Mounting Tools", "Safety & Protective Equipment", "Specialized Solar Tools"];
  const conditions = ["new", "excellent", "good", "fair", "poor", "needs_repair"];

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, searchTerm]);

  const loadTools = async () => {
    try {
      const data = await getTools();
      setTools(data);
    } catch (error) {
      console.error("Erreur lors du chargement des outils:", error);
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

  const handleSubmit = async () => {
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

  const getConditionColor = (condition) => {
    const colors = {
      "new": "#10b981",
      "excellent": "#22c55e",
      "good": "#84cc16",
      "fair": "#eab308",
      "poor": "#f97316",
      "needs_repair": "#ef4444"
    };
    return colors[condition] || "#6b7280";
  };

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
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Image</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>État</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantité</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Prix</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Disponible</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", textAlign: "center" }}>Actions</TableCell>
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
                  <TableCell>
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
                  <TableCell>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {tool.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tool.type}
                      size="small"
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        fontWeight: "500",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tool.condition}
                      size="small"
                      sx={{
                        backgroundColor: getConditionColor(tool.condition) + "20",
                        color: getConditionColor(tool.condition),
                        fontWeight: "500",
                        border: `1px solid ${getConditionColor(tool.condition)}30`,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="text-center">
                      <Typography 
                        variant="body1" 
                        className={`font-bold ${
                          tool.quantity === 0 ? "text-red-600" : 
                          tool.quantity < 5 ? "text-amber-600" : "text-green-600"
                        }`}
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
                  <TableCell>
                    <Typography variant="body1" className="font-semibold text-gray-900">
                      {tool.price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tool.availability ? "Oui" : "Non"}
                      size="small"
                      sx={{
                        backgroundColor: tool.availability ? "#ecfdf5" : "#fef2f2",
                        color: tool.availability ? "#065f46" : "#991b1b",
                        fontWeight: "500",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <IconButton 
                        onClick={() => handleEdit(tool)}
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
                        onClick={() => handleDelete(tool.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
              {toolTypes.map(type => (
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
              {conditions.map(condition => (
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
    </div>
  );
}