const authMiddleware = (req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
};

module.exports = authMiddleware;