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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  InputAdornment,
  Avatar,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, Search, Person, Build, CalendarToday } from "@mui/icons-material";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../services/loanService";
import { getUsers } from "../services/userService";
import { getTools } from "../services/toolService";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    loan_id: "",
    tool_id: "",
    user_id: "",
    start_date: "",
    return_date: "",
    status: "active",
    quantity: 1,
    location: "",
    checked_out: false,
    checked_id: "",
    returned_quantity: 0,
  });

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
      const [loansData, usersData, toolsData] = await Promise.all([
        getLoans(),
        getUsers(),
        getTools()
      ]);
      setLoans(loansData);
      setFilteredLoans(loansData);
      setUsers(usersData);
      setTools(toolsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editLoan) {
        await updateLoan(editLoan.id, formData);
      } else {
        await createLoan(formData);
      }
      loadData();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du prêt:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce prêt ?")) {
      try {
        await deleteLoan(id);
        loadData();
      } catch (error) {
        console.error("Erreur lors de la suppression du prêt:", error);
      }
    }
  };

  const handleEdit = (loan) => {
    setEditLoan(loan);
    setFormData({
      loan_id: loan.loan_id || "",
      tool_id: loan.tool_id || "",
      user_id: loan.user_id || "",
      start_date: loan.start_date ? loan.start_date.split('T')[0] : "",
      return_date: loan.return_date ? loan.return_date.split('T')[0] : "",
      status: loan.status || "active",
      quantity: loan.quantity || 1,
      location: loan.location || "",
      checked_out: loan.checked_out || false,
      checked_id: loan.checked_id || "",
      returned_quantity: loan.returned_quantity || 0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLoan(null);
    setFormData({
      loan_id: "",
      tool_id: "",
      user_id: "",
      start_date: "",
      return_date: "",
      status: "active",
      quantity: 1,
      location: "",
      checked_out: false,
      checked_id: "",
      returned_quantity: 0,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": 
        return { bg: "#eff6ff", color: "#1e40af", label: "Actif" };
      case "returned": 
        return { bg: "#ecfdf5", color: "#065f46", label: "Retourné" };
      case "overdue": 
        return { bg: "#fef2f2", color: "#991b1b", label: "En retard" };
      default: 
        return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  const isOverdue = (returnDate) => {
    if (!returnDate) return false;
    return new Date(returnDate) < new Date();
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Gestion des Prêts
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {filteredLoans.length} prêt(s) trouvé(s)
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
          Nouveau prêt
        </Button>
      </div>

      {/* Search Bar */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher par utilisateur, outil, statut ou localisation..."
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

      {/* Loans Table */}
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
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Outil</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date de début</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Date de retour</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantité</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Localisation</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="py-12 text-gray-500">
                  <CalendarToday sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    {searchTerm ? "Aucun prêt trouvé" : "Aucun prêt"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? "Ajustez vos critères de recherche" : "Créez votre premier prêt"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans.map((loan) => {
                const statusInfo = getStatusColor(loan.status);
                const isLoanOverdue = isOverdue(loan.return_date);
                
                return (
                  <TableRow 
                    key={loan.id}
                    sx={{ 
                      "&:hover": { backgroundColor: "#f9fafb" },
                      transition: "background-color 0.2s ease",
                      borderLeft: isLoanOverdue && loan.status === "active" ? "4px solid #ef4444" : "none",
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#ecfdf5",
                            color: "#059669",
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                          }}
                        >
                          {loan.users?.name?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                        <div>
                          <Typography variant="body1" className="font-medium text-gray-900">
                            {loan.users?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {loan.users?.cin || ""}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
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
                            {loan.tools?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {loan.tools?.type || ""}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarToday sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" className="text-gray-900">
                          {loan.start_date ? new Date(loan.start_date).toLocaleDateString('fr-FR') : "N/A"}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarToday sx={{ 
                          fontSize: 16, 
                          color: isLoanOverdue && loan.status === "active" ? "#ef4444" : "#6b7280" 
                        }} />
                        <Typography 
                          variant="body2" 
                          className={isLoanOverdue && loan.status === "active" ? "text-red-600 font-semibold" : "text-gray-900"}
                        >
                          {loan.return_date ? new Date(loan.return_date).toLocaleDateString('fr-FR') : "N/A"}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          fontWeight: "600",
                          border: `1px solid ${statusInfo.color}30`,
                        }}
                      />
                      {isLoanOverdue && loan.status === "active" && (
                        <Typography variant="caption" className="text-red-600 block mt-1">
                          En retard
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box className="text-center">
                        <Typography 
                          variant="body1" 
                          className={`font-bold ${
                            loan.quantity > loan.returned_quantity ? "text-amber-600" : "text-green-600"
                          }`}
                        >
                          {loan.quantity}
                        </Typography>
                        {loan.returned_quantity > 0 && (
                          <Typography variant="caption" className="text-gray-500">
                            Retourné: {loan.returned_quantity}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.location || "Non spécifié"}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#d1d5db",
                          color: "#6b7280",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-1">
                        <IconButton 
                          onClick={() => handleEdit(loan)}
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
                          onClick={() => handleDelete(loan.id)}
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

      {/* Add/Edit Loan Dialog */}
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
          {editLoan ? "Modifier le prêt" : "Nouveau prêt"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID du prêt"
                value={formData.loan_id}
                onChange={(e) => setFormData({ ...formData, loan_id: e.target.value })}
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Utilisateur</InputLabel>
                <Select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#059669' }}>
                          {user.name?.charAt(0)}
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
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
                        <span>{tool.name}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="returned">Retourné</MenuItem>
                  <MenuItem value="overdue">En retard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                label="Date de retour"
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Localisation"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
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
                label="ID de vérification"
                value={formData.checked_id}
                onChange={(e) => setFormData({ ...formData, checked_id: e.target.value })}
                margin="normal"
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
                label="Quantité retournée"
                type="number"
                value={formData.returned_quantity}
                onChange={(e) => setFormData({ ...formData, returned_quantity: parseInt(e.target.value) })}
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.checked_out}
                    onChange={(e) => setFormData({ ...formData, checked_out: e.target.checked })}
                    sx={{
                      color: "#059669",
                      "&.Mui-checked": {
                        color: "#059669",
                      },
                    }}
                  />
                }
                label="Vérifié"
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
            {editLoan ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}