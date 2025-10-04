import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/voltogreenlogo_withoutbg.png";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginUser(cin, password);
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      if (user.is_admin) {
        navigate("/dashboard/users");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <Fade in={true} timeout={800}>
        <Card className="w-full max-w-md shadow-2xl rounded-3xl backdrop-blur-sm bg-white/90 border border-white/20">
          <CardContent className="p-12 space-y-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-md opacity-30"></div>
                <img
                  src={logo}
                  alt="Voltogreen Logo"
                  className="w-32 h-32 drop-shadow-lg relative z-10 transform transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="text-center space-y-2">
                <Typography
                  variant="h3"
                  className="font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight"
                >
                  Connexion
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-500 font-medium"
                >
                  Accédez à votre espace personnel
                </Typography>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleLogin} className="space-y-8">
              <Box className="space-y-6">
                <TextField
                  fullWidth
                  label="CIN"
                  variant="outlined"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  inputProps={{ maxLength: 8 }}
                  className="bg-white/80 rounded-2xl transition-all duration-300"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      '&:hover fieldset': {
                        borderColor: '#10b981',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#059669',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 rounded-2xl transition-all duration-300"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: 'gray',
                            '&:hover': {
                              color: '#059669',
                              backgroundColor: 'rgba(5, 150, 105, 0.04)'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      '&:hover fieldset': {
                        borderColor: '#10b981',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#059669',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              </Box>

              {error && (
                <Fade in={!!error}>
                  <Typography 
                    align="center" 
                    color="error" 
                    className="text-sm font-medium py-3 px-4 bg-red-50 rounded-xl border border-red-200 transition-all duration-300"
                  >
                    {error}
                  </Typography>
                </Fade>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  textTransform: "none",
                  boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 12px 25px rgba(5, 150, 105, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.5s",
                  },
                  "&:hover::before": {
                    left: "100%",
                  },
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Footer */}
            <Box className="pt-8 border-t border-gray-200/60">
              <Typography
                align="center"
                className="text-sm text-gray-500 font-medium"
              >
                © {new Date().getFullYear()} Voltogreen. Tous droits réservés.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
}