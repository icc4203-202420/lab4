import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Container, Typography } from '@mui/material';
import useAxios from 'axios-hooks';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const initialValues = {
  email: '',
  password: '',
};

// Configuración de axios con axios-hooks
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const LoginForm = ({ tokenHandler }) => {
  const [serverError, setServerError] = useState(''); // Estado para manejar el error del servidor
  const navigate = useNavigate(); // Hook para manejar la navegación

  // Definir el hook para la petición POST
  const [{ data, loading, error }, executePost] = useAxios(
    {
      url: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    { manual: true } // No ejecutar automáticamente, lo haremos manualmente al enviar el formulario
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await executePost({ data: qs.stringify(values) });
      const receivedToken = response.data.token;
      tokenHandler(receivedToken);
      setServerError(''); // Limpia el mensaje de error si el login es exitoso
      navigate('/'); // Redirige a la ruta raíz después de un login exitoso
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setServerError('Correo electrónico o contraseña incorrectos.');
      } else {
        setServerError('Error en el servidor. Intenta nuevamente más tarde.');
      }
      console.error('Error en el envío del formulario:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form style={{ width: '100%' }}>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Email"
                  name="email"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Contraseña"
                  name="password"
                  type="password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loading}
                >
                  {loading ? 'Enviando...' : 'Iniciar Sesión'}
                </Button>
              </Box>
              {serverError && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {serverError}
                </Typography>
              )}
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default LoginForm;
