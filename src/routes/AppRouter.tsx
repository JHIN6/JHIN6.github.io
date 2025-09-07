// src/routes/AppRouter.tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import UserPage from '../pages/public/UserPage';
import { PublicRoute } from './PublicRouter';
import { PrivateLayout } from '../layouts/PrivateLayout';
import PerfilPage from '../pages/private/PerfilPage';
import TasksPage from '../pages/private/TasksPage';
import UsersPage from '../pages/private/UsersPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Navigate to="./login" />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/userRegister" element={<UserPage />}></Route>
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/perfil" element={<PerfilPage />}></Route>
          <Route path="/tasks" element={<TasksPage />}></Route>
          <Route path="/users" element={<UsersPage />}></Route>
        </Route>

        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
};
