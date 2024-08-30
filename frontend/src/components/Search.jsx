import { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import { Autocomplete, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PropTypes from 'prop-types';

const Search = ({ isFavorite, onAddFavorite }) => {
  const [searchKeywords, setSearchKeywords] = useState('');
  const [keywordList, setKeywordList] = useLocalStorageState('WeatherApp/Search/KeywordList', {
    defaultValue: []
  });
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Hook de Axios para realizar la búsqueda cuando se cambian las palabras clave
  const [{ data: searchData, loading, error }, refetch] = useAxios(
    {
      url: `https://api.openweathermap.org/data/2.5/weather`,
      method: 'GET',
      params: {
        q: searchKeywords,
        units: 'metric',
        appid: apiKey
      }
    },
    { manual: true } // Esto evita que se ejecute automáticamente al cargar el componente
  );

  // Efecto para guardar la nueva búsqueda en el localStorage
  useEffect(() => {
    if (searchData && !keywordList.includes(searchKeywords)) {
      setKeywordList([...keywordList, searchKeywords]);
    }
  }, [keywordList, searchData, searchKeywords, setKeywordList]);

  // Función para manejar el cambio en el campo de texto
  const handleInputChange = (event, newInputValue) => {
    setSearchKeywords(newInputValue);
  };

  // Función para manejar la búsqueda
  const handleSearch = () => {
    if (searchKeywords) {
      refetch();
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Búsqueda de Clima
      </Typography>
      <Autocomplete
        freeSolo
        options={keywordList}
        value={searchKeywords}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField {...params} label="Buscar Ciudad" variant="outlined" fullWidth margin="normal" />
        )}
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
        Buscar
      </Button>

      {loading && (
        <Typography variant="body1" margin="normal">
          Cargando datos...
        </Typography>
      )}

      {error && (
        <Typography variant="body1" color="error" margin="normal">
          Error al cargar los datos.
        </Typography>
      )}

      {searchData && (
        <List>
          <ListItem>
            <ListItemText
              primary={`Ciudad: ${searchData.name}`}
              secondary={`Temperatura: ${searchData.main.temp} °C`}
            />
          </ListItem>        
          <ListItem>
            <ListItemText
              primary={`Mínima: ${searchData.main.temp_min} °C`}
              secondary={`Máxima: ${searchData.main.temp_max} °C`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`Humedad: ${searchData.main.humidity}%`}
              secondary={`Viento: ${searchData.wind.speed} m/s`}
            />
          </ListItem>
          <ListItem>
            { !isFavorite(searchData.name) && (
            <Button
                variant="outlined"
                color="secondary"
                onClick={() => onAddFavorite(searchData.name)}
                startIcon={<FavoriteIcon />} 
              >
                Agregar al Inicio
            </Button> )} 
          </ListItem>
        </List>
      )}
    </div>
  );
};

Search.propTypes = {
  isFavorite: PropTypes.func.isRequired,
  onAddFavorite: PropTypes.func.isRequired,
};

export default Search;
