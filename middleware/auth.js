// Middleware for verification authentication JWT
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Acceso denegado');
  
  jwt.verify(token, 'secret', (err, user) => {
      if (err) return res.status(403).send('Token inválido');
      req.user = user;
      next();
  });
});
