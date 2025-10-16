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
  Chip,
  Divider,
  LinearProgress,
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
  Analytics,
  Dashboard,
  Assessment,
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
      borderRadius: 4, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        '& .stat-icon': {
          transform: 'scale(1.1) rotate(5deg)',
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}80)`,
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
            className="stat-icon"
            sx={{
              background: `linear-gradient(135deg, ${color}15, ${color}25)`,
              borderRadius: 3,
              p: isMobile ? 1.5 : 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ml: 2,
              border: `2px solid ${color}20`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                fontSize: isMobile ? 28 : 36, 
                color,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
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
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }
      }}>
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Dashboard sx={{ fontSize: 40 }} />
              <Typography variant="h3" sx={{ fontWeight: "bold", color: "white" }}>
                Tableau de Bord
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}>
              Vue d'ensemble des statistiques système
            </Typography>
            {lastUpdated && (
              <Chip 
                label={`Mis à jour: ${lastUpdated.toLocaleTimeString()}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-label': { fontWeight: 500 }
                }}
              />
            )}
          </Box>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="contained"
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Actualisation...
              </>
            ) : (
              "Actualiser"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && !stats && <StatsSkeleton />}

      {/* Stats Grid */}
      {stats && (
        <>
          {/* Main Overview Stats */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: "#374151" }}>
              Vue d'ensemble générale
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Utilisateurs"
                  value={stats.totalUsers?.toLocaleString() || "0"}
                  icon={<People />}
                  color="#3b82f6"
                  subtitle="Total des utilisateurs"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Outils"
                  value={stats.totalTools?.toLocaleString() || "0"}
                  icon={<Build />}
                  color="#10b981"
                  subtitle="Total des outils"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Prêts"
                  value={stats.totalLoans?.toLocaleString() || "0"}
                  icon={<Assignment />}
                  color="#f59e0b"
                  subtitle="Total des prêts"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Maintenances"
                  value={stats.totalMaintenance?.toLocaleString() || "0"}
                  icon={<Settings />}
                  color="#8b5cf6"
                  subtitle="Total des interventions"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Tool Status Stats */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: "#374151" }}>
              État des outils
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Outils Installés"
                  value={stats.totalInstalled?.toLocaleString() || "0"}
                  icon={<Analytics />}
                  color="#10b981"
                  subtitle="Total installés"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Outils Endommagés"
                  value={stats.totalDamaged?.toLocaleString() || "0"}
                  icon={<Warning />}
                  color="#ef4444"
                  subtitle="Total endommagés"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Outils Perdus"
                  value={stats.totalLost?.toLocaleString() || "0"}
                  icon={<Warning />}
                  color="#f97316"
                  subtitle="Total perdus"
                />
              </Grid>
             
            </Grid>
          </Paper>

          {/* Financial Stats */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3, color: "#374151" }}>
              Statistiques financières
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StatCard
                  title="Achats Mensuels"
                  value={`${(stats.monthlyPurchases || 0).toLocaleString()} TND`}
                  icon={<TrendingUp />}
                  color="#06b6d4"
                  subtitle="Ce mois"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard
                  title="Coût Maintenance"
                  value={`${(stats.maintenanceCost || 0).toLocaleString()} TND`}
                  icon={<Settings />}
                  color="#f97316"
                  subtitle="Total dépensé"
                />
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

          {/* Analytics Section */}
          {stats && (
            <Paper sx={{ 
              p: 4, 
              borderRadius: 4, 
              mt: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Assessment sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
                  Indicateurs de Performance
                </Typography>
              </Box>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    textAlign: "center", 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%'
                    }
                  }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
                        {(stats.utilizationRate || 0).toFixed(1)}%
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                        Taux d'utilisation
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.utilizationRate || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white'
                          }
                        }} 
                      />
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    textAlign: "center", 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%'
                    }
                  }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
                        {(stats.maintenanceRate || 0).toFixed(1)}%
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                        Ratio maintenance
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.maintenanceRate || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white'
                          }
                        }} 
                      />
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    textAlign: "center", 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%'
                    }
                  }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
                        {((stats.damagedTools / stats.totalTools) * 100 || 0).toFixed(1)}%
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                        Outils endommagés
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.damagedTools / stats.totalTools) * 100 || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white'
                          }
                        }} 
                      />
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
    </Box>
  );
}