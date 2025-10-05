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
    user_id: "",
    start_date: "",
    location: "",
    tools: [{ tool_id: "", quantity: 1 }],
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
      if (editLoan) {
        const loanData = {
          user_id: formData.user_id,
          start_date: formData.start_date,
          location: formData.location,
          tool_id: formData.tools[0].tool_id,
          quantity: formData.tools[0].quantity
        };
        await updateLoan(editLoan.id, loanData);
      } else {
        // Create multiple loans for each tool
        for (const tool of formData.tools) {
          if (tool.tool_id && tool.quantity > 0) {
            const loanData = {
              user_id: formData.user_id,
              start_date: formData.start_date,
              location: formData.location,
              tool_id: tool.tool_id,
              quantity: tool.quantity
            };
            await createLoan(loanData);
          }
        }
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
      user_id: loan.user_id || "",
      start_date: loan.start_date ? loan.start_date.split('T')[0] : "",
      location: loan.location || "",
      tools: [{ tool_id: loan.tool_id || "", quantity: loan.quantity || 1 }],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLoan(null);
    setFormData({
      user_id: "",
      start_date: "",
      location: "",
      tools: [{ tool_id: "", quantity: 1 }],
    });
  };

  const addTool = () => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { tool_id: "", quantity: 1 }]
    });
  };

  const removeTool = (index) => {
    if (formData.tools.length > 1) {
      const newTools = formData.tools.filter((_, i) => i !== index);
      setFormData({ ...formData, tools: newTools });
    }
  };

  const updateTool = (index, field, value) => {
    const newTools = [...formData.tools];
    newTools[index][field] = field === 'quantity' ? parseInt(value) : value;
    setFormData({ ...formData, tools: newTools });
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
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="subtitle1">Tools</Typography>
              {!editLoan && (
                <Button size="small" onClick={addTool} variant="outlined">
                  Add Tool
                </Button>
              )}
            </div>
            {formData.tools.map((tool, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <FormControl fullWidth>
                  <InputLabel>Tool</InputLabel>
                  <Select
                    value={tool.tool_id}
                    onChange={(e) => updateTool(index, 'tool_id', e.target.value)}
                  >
                    {tools.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={tool.quantity}
                  onChange={(e) => updateTool(index, 'quantity', e.target.value)}
                  sx={{ width: 120 }}
                />
                {!editLoan && formData.tools.length > 1 && (
                  <IconButton onClick={() => removeTool(index)} color="error">
                    <Delete />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
          
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