const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// Create a new form
router.post('/create', formController.authenticate, formController.createForm);

// Submit a form response
router.post('/submit/:formId', formController.authenticate, formController.submitForm);

// Get all forms of a user
router.get('/getAllForms', formController.authenticate, formController.getAllForms);

// Get form by id
router.get('/:formId', formController.authenticate, formController.getForm);

// Toggle form status (active/inactive)
router.patch('/status/:formId', formController.authenticate, formController.toggleFormActiveStatus);

// Toggle form visibility (public/private)
router.patch('/visibility/:formId', formController.authenticate, formController.toggleFormVisibility);

// Get form responses
router.get('/responses/:formId', formController.authenticate, formController.getFormResponses);

// Get form submit status
router.get('/status/:formId', formController.authenticate, formController.getFormStatus);

// Delete a form
router.delete('/delete/:formId', formController.authenticate, formController.deleteForm);

// Get allowed users
router.get('/allowed-users/:formId', formController.authenticate, formController.getAllowedUsers);

// Edit allowed users
router.patch('/allowed-users/:formId', formController.authenticate, formController.editAllowedUsers);

module.exports = router;
