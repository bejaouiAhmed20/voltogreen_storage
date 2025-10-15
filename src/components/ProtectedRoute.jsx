import React from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Typography, Box } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box className="flex flex-col items-center justify-center h-64">
          <Typography variant="h6" className="text-red-600 mb-2">
            Une erreur est survenue
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Veuillez rafraîchir la page
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}