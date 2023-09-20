const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../configs.js/config');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        let { data: forms_users, error: readError } = await supabase
            .from('forms_users')
            .select('*');
        if (readError) return res.status(400).json({ error: readError.message });

        const existingUser = forms_users.find(u => u.email === email);

        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { email, password: hashedPassword };

        const { data, error: writeError } = await supabase
            .from('forms_users')
            .insert([ newUser ])
            .select()
        if (writeError) return res.status(400).json({ error: writeError.message });

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let { data: forms_users, error: readError } = await supabase
            .from('forms_users')
            .select('*');

        if (readError) return res.status(400).json({ error: readError.message });
        const user = forms_users.find(item => item.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: user.email }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

const test = (req, res) => {
    res.json({ message: 'Authenticated successfully', user: req.user });
};

const verify = (req, res) => {
    // Get the token from the headers
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided', success: false });
    }

    // Split the Bearer token to get the actual token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided', success: false });
    }

    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // If verification is successful, the token is valid
        return res.status(200).json({ message: 'JWT is valid', user: decoded, success: true });
    } catch (error) {
        // If verification fails, the token is invalid
        return res.status(401).json({ message: 'JWT is invalid', error: error.message, success: false });
    }
}

module.exports = {
    register,
    login,
    authenticate,
    test,
    verify
};
