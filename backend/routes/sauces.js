const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');

router.post('/', auth, saucesCtrl.createThing);
router.put('/:_id', auth, saucesCtrl.modifyThing);
router.delete('/:_id', auth, saucesCtrl.deleteThing);
router.get('/:_id', auth, saucesCtrl.getOneThing);
router.get('/', auth, saucesCtrl.getAllThings);

module.exports = router;