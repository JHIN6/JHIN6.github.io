import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Typography,
  Tooltip,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useAxios, useAlert } from '../../hooks';
import { useNavigate } from 'react-router-dom';

type UserRow = {
  id: number | string;
  username: string;
  email?: string;
  status: 'active' | 'inactive' | string;
  createdAt?: string;
};

export default function UsersPage() {
  const axios = useAxios();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      };
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (sortModel?.[0]) {
        params.orderBy = sortModel[0].field;
        params.orderDir = sortModel[0].sort ?? 'asc';
      }

      const res = await axios.get('/users', { params });
      const payload = res.data;
      const data = payload.data ?? payload;
      setUsers(data || []);
      setRowCount(payload.total ?? (Array.isArray(data) ? data.length : 0));
    } catch (error) {
      showAlert('Error al obtener usuarios', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, sortModel, search, statusFilter]);

  // Eliminar usuario
  const handleDelete = async (id: number | string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    try {
      await axios.delete(`/users/${id}`);
      showAlert('Usuario eliminado', 'success');
      fetchUsers();
    } catch (err) {
      showAlert('Error al eliminar', 'error');
    }
  };

  // Activar/Inactivar usuario usando PATCH /users/:id
  const handleToggleStatus = async (id: number | string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.patch(`/users/${id}`, { status: newStatus });
      showAlert(`Usuario ${newStatus}`, 'success');
      fetchUsers();
    } catch (err) {
      showAlert('Error al actualizar estado', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Usuario', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === 'active' ? 'Activo' : 'Inactivo'}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction={'row'} spacing={1}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => navigate(`/userRegister?id=${params.row.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={params.row.status === 'active' ? 'Inactivar' : 'Activar'}>
            <IconButton
              size="small"
              color={params.row.status === 'active' ? 'warning' : 'success'}
              onClick={() => handleToggleStatus(params.row.id, params.row.status)}
            >
              {params.row.status === 'active' ? <ToggleOffIcon /> : <ToggleOnIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Gestión de Usuarios
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
          </Select>

          <Box sx={{ flex: 1 }} />

          <Button variant="contained" onClick={() => navigate('/userRegister')}>
            Nuevo usuario
          </Button>
        </Toolbar>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 540 }}>
            <DataGrid
              rows={users}
              columns={columns}
              rowCount={rowCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              getRowId={(r) => r.id}
              disableColumnFilter
            />
          </div>
        )}
      </Paper>
    </Box>
  );
}
