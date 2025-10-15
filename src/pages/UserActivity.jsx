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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search, Assessment, Warning, CheckCircle, Cancel } from "@mui/icons-material";
import { getLoans } from "../services/loanService";
import { getStats } from "../services/statsService";
import { getStatusColor, formatDate } from "../utils/helpers";

export default function UserActivity() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalDamaged: 0,
    totalLost: 0,
    totalInstalled: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, statsData] = await Promise.all([
        getLoans(),
        getStats()
      ]);
      setLoans(loansData);
      setSummary({
        totalDamaged: statsData.totalDamaged,
        totalLost: statsData.totalLost,
        totalInstalled: statsData.totalInstalled,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };



  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(
        (loan) =>
          loan.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.tools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLoans(filtered);
  };



  const getQuantityChip = (label, value, color) => {
    if (!value || value === 0) return null;
    return (
      <Chip
        label={`${label}: ${value}`}
        size="small"
        sx={{
          backgroundColor: color + "20",
          color: color,
          fontWeight: "500",
          margin: "2px",
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
        <Typography variant="body2" className="ml-2 text-gray-500">
          Chargement de l'activité utilisateur...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="font-bold text-gray-900 mb-6">
        Activité Utilisateur
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ef4444" }}>
                    {summary.totalDamaged}
                  </Typography>
                  <Typography variant="h6" className="text-gray-700 font-medium">
                    Outils Endommagés
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 32, color: "#ef4444" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f97316" }}>
                    {summary.totalLost}
                  </Typography>
                  <Typography variant="h6" className="text-gray-700 font-medium">
                    Outils Perdus
                  </Typography>
                </Box>
                <Cancel sx={{ fontSize: 32, color: "#f97316" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#10b981" }}>
                    {summary.totalInstalled}
                  </Typography>
                  <Typography variant="h6" className="text-gray-700 font-medium">
                    Outils Installés
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 32, color: "#10b981" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box className="mb-6">
        <TextField
          fullWidth
          placeholder="Rechercher par utilisateur, outil ou projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="text-gray-400" />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        />
      </Box>

      {/* Activity Table */}
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
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Dates</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Projet</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Quantités</TableCell>
              <TableCell sx={{ fontWeight: "600", color: "#374151" }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-12 text-gray-500">
                  <Assessment sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                  <Typography variant="h6" className="mb-2">
                    Aucune activité trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans.map((loan) => (
                <TableRow
                  key={loan.id}
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafb" },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {loan.users?.name || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {loan.tools?.name || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-gray-700">
                      Début: {formatDate(loan.start_date)}
                    </Typography>
                    <Typography variant="body2" className="text-gray-700">
                      Retour: {formatDate(loan.return_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-gray-700">
                      {loan.projects?.name || "N/A"}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {loan.projects?.address || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex flex-wrap">
                      <Chip
                        label={`Donné: ${loan.quantity || 0}`}
                        size="small"
                        sx={{
                          backgroundColor: "#eff6ff",
                          color: "#1e40af",
                          fontWeight: "500",
                          margin: "2px",
                        }}
                      />
                      {getQuantityChip("Retourné", loan.returned_quantity, "#10b981")}
                      {getQuantityChip("Installé", loan.installed_quantity, "#10b981")}
                      {getQuantityChip("Endommagé", loan.damaged_quantity, "#ef4444")}
                      {getQuantityChip("Perdu", loan.lost_quantity, "#f97316")}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}