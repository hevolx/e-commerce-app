const { app } = require('./app');

const PORT = process.env.PGPORT || 3000;

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});