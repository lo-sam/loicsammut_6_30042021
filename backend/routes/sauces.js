const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');

router.post('/', saucesCtrl.createThing);
router.put('/:_id', saucesCtrl.modifyThing);
router.delete('/:_id', saucesCtrl.deleteThing);
router.get('/:_id', saucesCtrl.getOneThing);
router.get('/', saucesCtrl.getAllThings);

module.exports = router;