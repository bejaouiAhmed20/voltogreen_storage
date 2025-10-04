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
  Card,
  Grid,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { Person, Save, Logout, Visibility, VisibilityOff, Security } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../services/userService";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    cin: "",
    role: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    cin: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    setFormData({
      name: userData.name || "",
      cin: userData.cin || "",
      password: userData.password || "",
    });
  }, []);

  const handleSave = async () => {
    try {
      const updateData = {
        name: formData.name,
        cin: formData.cin,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser(user.id, updateData);
      
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormData({ ...formData, password: updateData.password || formData.password });
      showSnackbar("Profil mis à jour avec succès!", "success");
    } catch (error) {
      showSnackbar("Erreur lors de la mise à jour du profil", "error");
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("user");
  //   navigate("/");
  // };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleColor = () => {
    return user.role?.toLowerCase() === "admin" ? 
      { bg: "#fef3c7", color: "#92400e" } : 
      { bg: "#ecfdf5", color: "#065f46" };
  };

  const roleInfo = getRoleColor();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card sx={{ 
        borderRadius: "16px", 
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        overflow: "hidden"
      }}>
        <Box className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: "white",
                color: "#059669",
                fontSize: "1.5rem",
                fontWeight: "bold",
                border: "4px solid rgba(255,255,255,0.3)"
              }}
            >
              {user.name?.charAt(0).toUpperCase() || <Person />}
            </Avatar>
            <div className="text-white">
              <Typography variant="h4" className="font-bold mb-2">
                {user.name || "Utilisateur"}
              </Typography>
              <div className="flex items-center space-x-3">
                <Chip
                  label={user.role || "Utilisateur"}
                  sx={{
                    backgroundColor: roleInfo.bg,
                    color: roleInfo.color,
                    fontWeight: "600",
                  }}
                />
                <Typography variant="body2" className="text-white/80">
                  Gestion du profil
                </Typography>
              </div>
            </div>
          </div>
        </Box>
      </Card>

      {/* Profile Form */}
      <Card sx={{ 
        borderRadius: "12px", 
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <Box className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h5" className="font-bold text-gray-900">
              Informations Personnelles
            </Typography>
            <Chip 
              icon={<Security />} 
              label="Profil Sécurisé" 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom Complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CIN"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rôle"
                value={user.role}
                disabled
                helperText="Le rôle ne peut pas être modifié"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mot de Passe"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText="Laissez vide pour ne pas modifier"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#6b7280" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Actions */}
          <Box className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                },
                borderRadius: "8px",
                px: 4,
                py: 1,
              }}
            >
              Sauvegarder les modifications
            </Button>
            {/* <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                borderColor: "#ef4444",
                color: "#ef4444",
                borderRadius: "8px",
                px: 4,
                py: 1,
                "&:hover": {
                  borderColor: "#dc2626",
                  backgroundColor: "#fef2f2",
                },
              }}
            >
              Déconnexion
            </Button> */}
          </Box>
        </Box>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}