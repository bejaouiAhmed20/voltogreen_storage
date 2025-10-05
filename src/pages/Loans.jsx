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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../services/loanService";
import { getUsers } from "../services/userService";
import { getTools } from "../services/toolService";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLoan, setEditLoan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tool_id: "",
    user_id: "",
    start_date: "",
    quantity: 1,
    location: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = loans.filter(loan =>
      loan.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.tools?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLoans(filtered);
  }, [searchTerm, loans]);

  const loadData = async () => {
    try {
      const [loansData, usersData, toolsData] = await Promise.all([
        getLoans(),
        getUsers(),
        getTools()
      ]);
      setLoans(loansData);
      setFilteredLoans(loansData);
      setUsers(usersData);
      setTools(toolsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const loanData = {
        ...formData
      };
      
      if (editLoan) {
        await updateLoan(editLoan.id, loanData);
      } else {
        await createLoan(loanData);
      }
      loadData();
      handleClose();
    } catch (error) {
      console.error("Error saving loan:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteLoan(id);
        loadData();
      } catch (error) {
        console.error("Error deleting loan:", error);
      }
    }
  };

  const handleEdit = (loan) => {
    setEditLoan(loan);
    setFormData({
      tool_id: loan.tool_id || "",
      user_id: loan.user_id || "",
      start_date: loan.start_date ? loan.start_date.split('T')[0] : "",
      quantity: loan.quantity || 1,
      location: loan.location || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLoan(null);
    setFormData({
      tool_id: "",
      user_id: "",
      start_date: "",
      quantity: 1,
      location: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "borrowed": return "primary";
      case "returned": return "success";
      case "overdue": return "error";
      default: return "default";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-green-700">
          Loans Management
        </Typography>
        <div className="flex gap-4">
          <TextField
            size="small"
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search className="mr-2 text-gray-400" />
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Add Loan
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Tool</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Return Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.users?.name || "N/A"}</TableCell>
                <TableCell>{loan.tools?.name || "N/A"}</TableCell>
                <TableCell>{loan.start_date ? new Date(loan.start_date).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>{loan.return_date ? new Date(loan.return_date).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <Chip label={loan.status} color={getStatusColor(loan.status)} size="small" />
                </TableCell>
                <TableCell>{loan.quantity}</TableCell>
                <TableCell>{loan.location}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(loan)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(loan.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editLoan ? "Edit Loan" : "Add Loan"}</DialogTitle>
        <DialogContent className="space-y-4">
          <FormControl fullWidth margin="normal">
            <InputLabel>User</InputLabel>
            <Select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tool</InputLabel>
            <Select
              value={formData.tool_id}
              onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
            >
              {tools.map((tool) => (
                <MenuItem key={tool.id} value={tool.id}>
                  {tool.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editLoan ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}