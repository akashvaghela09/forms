const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/create', formController.authenticate, formController.createForm);
router.post('/submit/:formId', formController.authenticate, formController.submitForm);
router.get('/:formId', formController.authenticate, formController.getFormDetails);
router.patch('/toggle/:formId', formController.authenticate, formController.toggleFormStatus);
router.get('/responses/:formId', formController.authenticate, formController.getFormResponses);
router.delete('/delete/:formId', formController.authenticate, formController.deleteForm);
router.patch('/edit-allowed-users/:formId', formController.authenticate, formController.editAllowedUsers);

module.exports = router;
