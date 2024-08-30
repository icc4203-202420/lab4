import { useState } from 'react';
import { Tabs, Tab, Box, Button } from '@mui/material';
import Weather from './Weather';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';

function Home({ favorites, removeFavorite }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="city tabs">
        {favorites.map((location, index) => (
          <Tab key={index} label={location} />
        ))}
      </Tabs>
      {favorites.map((location, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={selectedTab !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          sx={{ p: 3 }}
        >
          {selectedTab === index && (
            <Box>
              <Weather location={location} />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => removeFavorite(location)}
                sx={{ mt: 2 }}
                startIcon={<DeleteIcon />}
              >
                Quitar
              </Button>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

Home.propTypes = {
  favorites: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeFavorite: PropTypes.func.isRequired,
};

export default Home;
