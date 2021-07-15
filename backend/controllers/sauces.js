const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    sauceObject.likes = 0;
    sauceObject.dislikes = 0;
    sauceObject.usersLiked = [];
    sauceObject.usersDisliked = [];
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {...req.body };
    if (req.file) { // On supprime l ancienne image
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            });
    } else {
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));

    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error: error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.postLike = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            let userSauceL = sauce.usersLiked;
            let indexL = userSauceL.indexOf(userId);
            let userSauceD = sauce.usersDisliked;
            let indexD = userSauceD.indexOf(userId);
            switch (like) {
                //Si le user like la sauce
                case +1:
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: userId }, $inc: { likes: +1 } },
                            console.log('Sauce Likée')
                        )
                        .then(() => res.status(200).json({ message: "Sauce Likée" }))
                        .catch(error => res.status(400).json({ error }));
                    break;
                    //Si le user dislike la sauce
                case -1:
                    Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } },
                            console.log('Sauce Dislikée')
                        )
                        .then(() => res.status(200).json({ message: "Sauce Dislikée" }))
                        .catch(error => res.status(400).json({ error }));
                    break;
                    //Si le user annule son choix
                case 0:
                    if (indexL > -1) { //Si il avait liké
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } },
                                console.log('La sauce n\'est plus Likée')
                            )
                            .then(() => res.status(200).json({ message: "Supprime like" }))
                            .catch(error => res.status(400).json({ error }));
                        break;
                    } else if (indexD > -1) { //Si il avait disliké
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } },
                                console.log('la sauce n\'est plus Dislikée')
                            )
                            .then(() => res.status(200).json({ message: "Supprime Dislike" }))
                            .catch(error => res.status(400).json({ error }));
                        break;
                    }
            }
        });
};