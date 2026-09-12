const { app } = require('./app');
const config = require('./db/config');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});