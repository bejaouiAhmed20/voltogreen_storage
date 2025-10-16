import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Box,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Person, Save, Logout, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { updateUser, uploadUserImage } from "../services/userService";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    cin: "",
    role: "",
    picture: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    password: "",
    picture: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    setFormData({
      name: userData.name || "",
      cin: userData.cin || "",
      password: userData.password || "",
      picture: userData.picture || "",
    });
  }, []);

  const handleSave = async () => {
    try {
      setUploading(true);
      const updateData = {
        name: formData.name,
        cin: formData.cin,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (selectedFile) {
        const imageUrl = await uploadUserImage(selectedFile);
        updateData.picture = imageUrl;
      }
      
      await updateUser(user.id, updateData);
      
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormData({ ...formData, password: updateData.password || formData.password, picture: updateData.picture || formData.picture });
      setSelectedFile(null);
      alert("Profil mis à jour avec succès!");
    } catch (error) {
      alert("Erreur lors de la mise à jour du profil: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Avatar 
          src={selectedFile ? URL.createObjectURL(selectedFile) : (user.picture || formData.picture)}
          sx={{ width: 80, height: 80, bgcolor: "#16a34a" }}
        >
          {!user.picture && !formData.picture && !selectedFile && <Person sx={{ fontSize: 40 }} />}
        </Avatar>
        <div>
          <Typography variant="h4" className="font-bold text-green-700">
            Profil
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Gérer les informations de votre compte
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            {user.name} • {user.role}
          </Typography>
        </div>
      </div>

      <Paper className="p-6 space-y-6">
        <div>
          <Typography variant="h6" className="mb-4 text-green-700">
            Informations Personnelles
          </Typography>
          <Box sx={{ mb: 3 }}>
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
              <Typography variant="caption" sx={{ color: "#16a34a", mt: 1, display: "block" }}>
                Sélectionné: {selectedFile.name}
              </Typography>
            )}
          </Box>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              label="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="CIN"
              value={formData.cin}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            />
            <TextField
              fullWidth
              label="Rôle"
              value={user.role}
              disabled
              helperText="Le rôle ne peut pas être modifié"
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        <Divider />

        <div className="flex justify-between">
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            color="error"
          >
            Déconnexion
          </Button>
        </div>
      </Paper>
    </div>
  );
}