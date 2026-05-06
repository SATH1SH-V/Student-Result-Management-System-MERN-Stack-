const adminRoutes = require('./routes/adminRoutes');
console.log('Routes stack length:', adminRoutes.stack.length);
adminRoutes.stack.forEach(r => {
    if (r.route) {
        console.log('Route path:', r.route.path, 'Methods:', Object.keys(r.route.methods));
    }
});
