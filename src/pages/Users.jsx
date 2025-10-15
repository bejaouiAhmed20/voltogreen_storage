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

  const handleSubmit = async () => {
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
    <div>
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
          className="bg-green-600 hover:bg-green-700"
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>CIN</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Actions</TableCell>
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
                <TableCell>
                  <Avatar
                    src={user.picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    <Person />
                  </Avatar>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.cin}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.is_admin ? "Oui" : "Non"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
                    <Delete />
                  </IconButton>
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
          />
          <TextField
            fullWidth
            label="CIN"
            value={formData.cin}
            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
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