import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { schemaUser, type UserFormValues } from '../../models';
import { hanleZodError } from '../../helpers';
import { useActionState, useAlert, useAxios } from '../../hooks';
import type { ActionState } from '../../interfaces';

type UserActionState = ActionState<UserFormValues>;

const initialFormData: UserFormValues = {
  username: '',
  password: '',
  confirmPassword: '',
};

export default function UserPage() {
  const axios = useAxios();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [userFormData, setUserFormData] = useState<UserFormValues>(initialFormData);

  // Hook para submit
  const saveUserApi = async (_: UserActionState | undefined, formData: FormData) => {
    const rawData: UserFormValues = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    try {
      schemaUser.parse(rawData);

      if (userId) {
        // Editar usuario
        await axios.put(`/users/${userId}`, {
          username: rawData.username,
          password: rawData.password || undefined,
        });
        showAlert('Usuario actualizado', 'success');
      } else {
        // Crear usuario
        await axios.post('/users', {
          username: rawData.username,
          password: rawData.password,
        });
        showAlert('Usuario creado', 'success');
      }

      navigate('/users');
    } catch (error) {
      const err = hanleZodError<UserFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const [_, submitAction, isPending] = useActionState(saveUserApi, { formData: initialFormData });

  // Cargar usuario para edición
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/users/${userId}`);
        const user = res.data;
        setUserFormData({
          username: user.username,
          password: '',
          confirmPassword: '',
        });
      } catch {
        showAlert('Error al cargar usuario', 'error');
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Container
      maxWidth={false}
      sx={{ backgroundColor: '#242424', width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Box
        sx={{ maxWidth: 'sm', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', height: '100vh' }}
      >
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component={'h1'} variant="h4" gutterBottom>
            {userId ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>

          <Box component="form" onSubmit={submitAction} sx={{ width: '100%' }}>
            <TextField
              name="username"
              margin="normal"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              type="text"
              disabled={isPending}
              value={userFormData.username}
              onChange={(e) => setUserFormData((prev) => ({ ...prev, username: e.target.value }))}
            />
            <TextField
              name="password"
              margin="normal"
              required={!userId}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              disabled={isPending}
              value={userFormData.password}
              onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
              helperText={userId ? 'Dejar vacío para no cambiar' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="confirmPassword"
              margin="normal"
              required={!userId}
              fullWidth
              label="Repetir password"
              type={showConfirm ? 'text' : 'password'}
              disabled={isPending}
              value={userFormData.confirmPassword}
              onChange={(e) => setUserFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isPending ? 'Cargando...' : userId ? 'Actualizar' : 'Registrar'}
            </Button>
            {!userId && (
              <Button fullWidth onClick={() => navigate('/login')}>
                Ir a login
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
