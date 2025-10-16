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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Add, Edit, Delete, Person, Search } from "@mui/icons-material";
import { getUsers, createUser, updateUser, deleteUser, uploadUserImage } from "../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    role: "",
    password: "",
    is_admin: false,
    picture: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.cin.trim()) newErrors.cin = "Le CIN est requis";
    if (!formData.role.trim()) newErrors.role = "Le rôle est requis";
    if (!editUser && !formData.password.trim()) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setUploading(true);
      let userData = { ...formData };
      
      if (selectedFile) {
        const imageUrl = await uploadUserImage(selectedFile);
        userData.picture = imageUrl;
      }
      
      if (editUser) {
        await updateUser(editUser.id, userData);
      } else {
        await createUser(userData);
      }
      loadUsers();
      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr ?")) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      cin: user.cin || "",
      role: user.role || "",
      password: user.password || "",
      is_admin: user.is_admin || false,
      picture: user.picture || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setSelectedFile(null);
    setErrors({});
    setFormData({ name: "", cin: "", role: "", password: "", is_admin: false, picture: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement des utilisateurs...
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-green-700">
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
            borderRadius: "8px",
          }}
        >
          Ajouter Utilisateur
        </Button>
      </div>

      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher par nom, CIN ou rôle..."
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

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          width: "100%",
        }}
      >
        <Table sx={{ width: "100%", minWidth: "100%", tableLayout: "auto" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>Photo</TableCell>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>Nom</TableCell>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>CIN</TableCell>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>Rôle</TableCell>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>Admin</TableCell>
              <TableCell sx={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-12 text-gray-500">
                  <Person sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? "Ajustez vos critères de recherche" : "Ajoutez votre premier utilisateur"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={{ padding: '12px 16px' }}>
                  <Avatar
                    src={user.picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    <Person />
                  </Avatar>
                </TableCell>
                <TableCell sx={{ padding: '12px 16px', fontSize: '15px' }}>{user.name}</TableCell>
                <TableCell sx={{ padding: '12px 16px', fontSize: '15px' }}>{user.cin}</TableCell>
                <TableCell sx={{ padding: '12px 16px', fontSize: '15px' }}>{user.role}</TableCell>
                <TableCell sx={{ padding: '12px 16px', fontSize: '15px' }}>{user.is_admin ? "Oui" : "Non"}</TableCell>
                <TableCell sx={{ padding: '12px 16px' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => handleEdit(user)}
                      size="small"
                      sx={{
                        color: "#3b82f6",
                        "&:hover": {
                          backgroundColor: "#eff6ff",
                        },
                        textTransform: 'none',
                        fontSize: '13px'
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      onClick={() => handleDelete(user.id)}
                      size="small"
                      sx={{
                        color: "#ef4444",
                        "&:hover": {
                          backgroundColor: "#fef2f2",
                        },
                        textTransform: 'none',
                        fontSize: '13px'
                      }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? "Modifier Utilisateur" : "Ajouter Utilisateur"}</DialogTitle>
        <DialogContent className="space-y-4">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#374151" }}>
              Photo de Profil
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
                Sélectionné: {selectedFile.name}
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            label="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label="CIN"
            value={formData.cin}
            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            margin="normal"
            error={!!errors.cin}
            helperText={errors.cin}
          />
          <TextField
            fullWidth
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
            error={!!errors.role}
            helperText={errors.role}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              />
            }
            label="Administrateur"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading}>
            {uploading ? "Téléchargement..." : editUser ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}