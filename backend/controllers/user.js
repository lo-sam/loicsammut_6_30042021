const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const hmac = require('crypto-js/hmac-sha256');
const emailRegex = /^(?=.+[a-zA-Z])(?=.+[0-9]).{8,}[^&"()!$*€£`+=;?#\/]$/g;
const key = "tokenMail";

exports.signup = (req, res, next) => {
    if (emailRegex.test(req.body.password)) {
        let encrypted = CryptoJS.SHA256(req.body.email, key).toString();
        bcrypt.hash(req.body.password, 10)
            .then(hash => {

                const user = new User({
                    email: encrypted,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error: 'L\'utilisateur n\'a pu être créé !' }));
            })
            .catch(error => res.status(500).json({ error: 'Impossible d\'enregister un utilisateur!' }));
    } else {
        return res.status(400).json({ 'error': 'Mot de passe doit contenir au moins 1 minuscule, 1 majuscule, 1 chiffre et contenir au minimum 8 caractères !' });
    }
};

exports.login = (req, res, next) => {

    let encrypted = CryptoJS.SHA256(req.body.email, key).toString();
    User.findOne({ email: encrypted })

    .then(user => {

            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id },
                            'RANDOM_TOKEN_SECRET', { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error: 'Impossible de vérifier si le mot de pass!' }));
        })
        .catch(error => res.status(500).json({ error: 'Impossible de vérifier si l\'utilisateur existe!' }));

};