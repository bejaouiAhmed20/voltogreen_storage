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
  Box,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, Search, Person } from "@mui/icons-material";
import { getUsers, createUser, updateUser, deleteUser } from "../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    role: "",
    password: "",
    is_admin: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSubmit = async () => {
    try {
      if (editUser) {
        await updateUser(editUser.id, formData);
      } else {
        await createUser(formData);
      }
      loadUsers();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
      }
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setFormData({ name: "", cin: "", role: "", password: "", is_admin: false });
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 ">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {filteredUsers.length} utilisateur(s) trouvé(s)
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
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Search Bar */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher un utilisateur par nom, CIN ou rôle..."
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

      {/* Users Table */}
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
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>CIN</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Rôle</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8 text-gray-500">
                  <Person sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="body1">
                    {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <TableCell className="text-gray-600 font-mono">{user.id}</TableCell>
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
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                      <div>
                        <Typography variant="body1" className="font-medium text-gray-900">
                          {user.name}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 font-mono">{user.cin}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || "Non défini"}
                      size="small"
                      sx={{
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_admin ? "Administrateur" : "Utilisateur"}
                      size="small"
                      sx={{
                        backgroundColor: user.is_admin ? "#fef3c7" : "#ecfdf5",
                        color: user.is_admin ? "#92400e" : "#065f46",
                        fontWeight: "500",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-1">
                      <IconButton 
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDelete(user.id)}
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

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
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
          {editUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
            fullWidth
            label="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              }
            }}
          />
          <TextField
            fullWidth
            label="CIN"
            value={formData.cin}
            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              }
            }}
          />
          <TextField
            fullWidth
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              }
            }}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            helperText={editUser ? "Laisser vide pour ne pas modifier" : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                sx={{
                  color: "#059669",
                  "&.Mui-checked": {
                    color: "#059669",
                  },
                }}
              />
            }
            label="Accès administrateur"
          />
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
            {editUser ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// Avatar component (add this if not already imported)
const Avatar = ({ children, ...props }) => (
  <Box
    {...props}
    className="flex items-center justify-center rounded-full"
  >
    {children}
  </Box>
);