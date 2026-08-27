const express = require('express');
const router = express.Router();
const printController = require('../controllers/printController');

router.post('/', printController.createPrintJob);
router.get('/queue', printController.listPrintJobs);
router.get('/:id', printController.getPrintJob);
router.put('/:id', printController.updatePrintJob);
router.get('/:id/image', printController.getPrintJobImage);

module.exports = router;
