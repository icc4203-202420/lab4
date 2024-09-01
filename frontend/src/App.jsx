import React, { useReducer, useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import Home from './components/Home';
import Search from './components/Search';
import LoginForm from './components/Login';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Definir el reducer para manejar la lista de favoritos
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_FAVORITES':
      return action.payload || [];
    case 'ADD_FAVORITE':
      return state.includes(action.payload) ? state : [...state, action.payload];
    case 'REMOVE_FAVORITE':
      return state.filter(favorite => favorite !== action.payload);
    case 'CLEAR_FAVORITES':
      return [];  // Limpia la lista de favoritos, útil al hacer logout
    default:
      return state;
  }
};

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const [token, setToken] = useLocalStorageState('WeatherApp/token', {
    defaultValue: '',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [initialFavorites, setInitialFavorites] = useLocalStorageState('WeatherApp/App/Favorites', {
    defaultValue: [],
  });
  const [favorites, dispatchFavorites] = useReducer(favoritesReducer, initialFavorites);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  });

  // Verifica la validez del token y carga favoritos desde el backend
  useEffect(() => {
    if (token) {
      axios.get('/verify-token', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIsAuthenticated(true);
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.name);

        // Cargar favoritos desde el backend
        return axios.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(response => {
        const backendFavorites = response.data.favorites || [];
        dispatchFavorites({ type: 'INIT_FAVORITES', payload: backendFavorites });
        setLoading(false);
        navigate('/');
      })
      .catch(error => {
        console.error('Error during authentication:', error);
        setToken('');
        setIsAuthenticated(false);
        setLoading(false);
      });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [token]);

  const handleJWT = (token) => {
    setToken(token);
  }

  // Sincronizar cambios en `favorites` con localStorage y backend
  useEffect(() => {
    if (!loading) {
      // Sincronizar con localStorage
      setInitialFavorites(favorites);

      // Sincronizar con el backend si está autenticado y hay un token válido
      if (isAuthenticated && token) {
        axios.post('/favorites', { favorites: favorites }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          console.log('Favorites synchronized successfully:', response.data);
        })
        .catch(error => {
          console.error('Error synchronizing favorites:', error);
        });
      }
    }
  }, [favorites, isAuthenticated, token, loading]);

  const handleAddFavorite = (cityName) => {
    dispatchFavorites({ type: 'ADD_FAVORITE', payload: cityName });
  };

  const handleRemoveFavorite = (cityName) => {
    dispatchFavorites({ type: 'REMOVE_FAVORITE', payload: cityName });
  };

  const handleLogout = () => {
    dispatchFavorites({ type: 'CLEAR_FAVORITES' });
    setToken('');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login');
  };

  const isFavorite = (location) => {
    return favorites.some(favorite => favorite === location);
  };  

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Weather App
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
      <List>
        {!isAuthenticated ? (
          <ListItem button component={Link} to="/login" onClick={toggleDrawer}>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Iniciar Sesión" />
          </ListItem>
        ) : (
          <>
            <ListItem>
              <ListItemText primary={`Usuario: ${username}`} />
            </ListItem>
            <ListItem button onClick={() => { handleLogout(); toggleDrawer(); }}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          </>
        )}
        <ListItem button component={Link} to="/" onClick={toggleDrawer}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItem>
        <ListItem button component={Link} to="/search" onClick={toggleDrawer}>
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Buscar" />
        </ListItem>
      </List>
      </Drawer>
      <Toolbar /> {/* This empty toolbar is necessary to offset the content below the AppBar */}
      <Routes>
        <Route path="/" element={<Home favorites={favorites} removeFavorite={handleRemoveFavorite} />} />
        <Route path="/login" element={<LoginForm tokenHandler={handleJWT} />} />
        <Route path="/search" element={<Search isFavorite={isFavorite} onAddFavorite={handleAddFavorite} />} />
      </Routes>
    </>    
  );
}

export default App;
