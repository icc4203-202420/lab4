import React, { useReducer, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import Home from './components/Home';
import Search from './components/Search';

// Definir el reducer para manejar la lista de favoritos
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FAVORITE':
      if (!state.includes(action.payload)) {
        return [...state, action.payload];
      }
      return state;
    case 'REMOVE_FAVORITE':
      return state.filter(favorite => favorite !== action.payload);
    default:
      return state;
  }
};

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Usar useLocalStorageState para inicializar el estado de favoritos
  const [initialFavorites] = useLocalStorageState('WeatherApp/App/Favorites', {
    defaultValue: ['Santiago de Chile']
  });

  // Usar useReducer para manejar el estado de favoritos
  const [favorites, dispatch] = useReducer(favoritesReducer, initialFavorites);

  // Guardar los cambios en favoritos en localStorage
  const [, setFavoritesInLocalStorage] = useLocalStorageState('WeatherApp/App/Favorites');
  React.useEffect(() => {
    setFavoritesInLocalStorage(favorites);
  }, [favorites, setFavoritesInLocalStorage]);

  const handleAddFavorite = (cityName) => {
    dispatch({ type: 'ADD_FAVORITE', payload: cityName });
  };

  const handleRemoveFavorite = (cityName) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: cityName });
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
        <Route path="/search" element={<Search isFavorite={isFavorite} onAddFavorite={handleAddFavorite} />} />
      </Routes>
    </>
  );
}

export default App;
