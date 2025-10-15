import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  People,
  Build,
  Assignment,
  Settings,
  TrendingUp,
  Warning,
  Refresh,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { getStats } from "../services/statsService";

// Custom hook for stats data
const useStats = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    stats: null,
    lastUpdated: null,
  });

  const loadStats = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await getStats();
      setState({
        loading: false,
        error: null,
        stats: data,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        stats: null,
      }));
    }
  }, []);

  return { ...state, loadStats };
};

// StatCard component extracted for better reusability and performance
const StatCard = React.memo(({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  loading = false,
  trend 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Card sx={{ 
        height: "100%", 
        borderRadius: 3, 
        boxShadow: 2,
        opacity: 0.7 
      }}>
        <CardContent>
          <Box className="flex items-center justify-between">
            <Box sx={{ flex: 1 }}>
              <Box sx={{ height: 32, width: '60%', bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
              <Box sx={{ height: 20, width: '80%', bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
            <Box
              sx={{
                backgroundColor: 'grey.200',
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: 32, height: 32, bgcolor: 'grey.300', borderRadius: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      height: "100%", 
      borderRadius: 3, 
      boxShadow: 2,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      }
    }}>
      <CardContent>
        <Box className="flex items-center justify-between">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: "bold", 
                color: color,
                mb: 0.5 
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                color: "text.primary",
                fontWeight: "medium",
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ color: "text.secondary" }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trend.value > 0 ? 'success.main' : trend.value < 0 ? 'error.main' : 'text.secondary',
                  fontWeight: 'medium',
                  display: 'block',
                  mt: 0.5
                }}
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: isMobile ? 1.5 : 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ml: 2
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                fontSize: isMobile ? 24 : 32, 
                color 
              } 
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

// Skeleton loader for initial loading state
const StatsSkeleton = () => (
  <Grid container spacing={3}>
    {[...Array(8)].map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <StatCard loading />
      </Grid>
    ))}
  </Grid>
);

export default function Stats() {
  const { loading, error, stats, lastUpdated, loadStats } = useStats();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    loadStats();
  };

  if (error) {
    return (
      <Box>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
            Statistiques
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="outlined"
          >
            Actualiser
          </Button>
        </Box>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Réessayer
            </Button>
          }
        >
          Erreur lors du chargement des statistiques: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
            Tableau de Bord
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          variant="outlined"
          disabled={loading}
          size={isMobile ? "small" : "medium"}
        >
          {loading ? "Actualisation..." : "Actualiser"}
        </Button>
      </Box>

      {/* Loading State */}
      {loading && !stats && <StatsSkeleton />}

      {/* Stats Grid */}
      {stats && (
        <Grid container spacing={3}>
          {/* Main Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Utilisateurs"
              value={stats.totalUsers?.toLocaleString() || "0"}
              icon={<People />}
              color="#3b82f6"
              subtitle="Total des utilisateurs"
              trend={{ value: 5 }} // Example trend data
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Outils"
              value={stats.totalTools?.toLocaleString() || "0"}
              icon={<Build />}
              color="#10b981"
              subtitle="Total des outils"
              trend={{ value: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Prêts"
              value={stats.totalLoans?.toLocaleString() || "0"}
              icon={<Assignment />}
              color="#f59e0b"
              subtitle="Total des prêts"
              trend={{ value: -1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Maintenances"
              value={stats.totalMaintenance?.toLocaleString() || "0"}
              icon={<Settings />}
              color="#8b5cf6"
              subtitle="Total des interventions"
              trend={{ value: 3 }}
            />
          </Grid>

          {/* Secondary Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Prêts Actifs"
              value={stats.activeLoans?.toLocaleString() || "0"}
              icon={<TrendingUp />}
              color="#059669"
              subtitle="En cours"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Stock Faible"
              value={stats.lowStockTools?.toLocaleString() || "0"}
              icon={<Warning />}
              color="#ef4444"
              subtitle="< 5 unités"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valeur Totale"
              value={`${(stats.totalValue || 0).toLocaleString()} TND`}
              icon={<Build />}
              color="#06b6d4"
              subtitle="Inventaire"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Coût Maintenance"
              value={`${(stats.maintenanceCost || 0).toLocaleString()} TND`}
              icon={<Settings />}
              color="#f97316"
              subtitle="Total dépensé"
            />
          </Grid>

          {/* Charts Section */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              mt: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
            }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
                Aperçu Général
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ textAlign: "center", p: 3, borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main", mb: 1 }}>
                      {(stats.utilizationRate || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      Taux d'utilisation des outils
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ textAlign: "center", p: 3, borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "info.main", mb: 1 }}>
                      {(stats.maintenanceRate || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      Coût maintenance / Valeur totale
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}