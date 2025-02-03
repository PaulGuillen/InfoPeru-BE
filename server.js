const express = require('express');
const morgan = require('morgan');

const app = express();

// Configura morgan para registrar las peticiones
app.use(morgan('dev')); // "dev" muestra los logs en la consola

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Otras rutas
app.get('/productos', (req, res) => {
  res.json({ productos: ['producto1', 'producto2', 'producto3'] });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
