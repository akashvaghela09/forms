const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const formsFilePath = path.join(__dirname, '../data/forms.json');
const usersFilePath = path.join(__dirname, '../data/users.json');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const createForm = (req, res) => {
    try {
      const { title, description, visibility, questions } = req.body;
      const ownerEmail = req.user.email;
  
      // Generate a unique form ID (you can use a package like uuid for this)
      const formId = Date.now().toString();
  
      // Create a new form object
      const newForm = {
        formId,
        ownerEmail,
        title,
        description,
        visibility,
        questions,
        responses: [],
        active: true,
        allowedUsers: visibility === 'private' ? [] : null,
      };
  
      // Read the existing forms data
      const formsData = JSON.parse(fs.readFileSync(formsFilePath));
  
      // Add the new form to the forms data
      formsData.push(newForm);
  
      // Write the updated forms data back to the file
      fs.writeFileSync(formsFilePath, JSON.stringify(formsData, null, 2));
  
      // Return the form ID in the response
      res.status(201).json({ message: 'Form created successfully', formId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

const submitForm = (req, res) => {
  try {
    // Your logic to submit a form response
    // Ensure to validate the form ID, check form status, and validate user permissions based on form visibility settings
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleFormStatus = (req, res) => {
  try {
    // Your logic to toggle the active status of a form
    // Ensure to validate the form ID and check if the user is the owner of the form
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFormResponses = (req, res) => {
  try {
    // Your logic to get all responses for a form
    // Ensure to validate the form ID and check if the user is the owner of the form
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteForm = (req, res) => {
  try {
    // Your logic to delete a form
    // Ensure to validate the form ID and check if the user is the owner of the form
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editAllowedUsers = (req, res) => {
  try {
    // Your logic to edit the list of allowed users for a form
    // Ensure to validate the form ID and check if the user is the owner of the form
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  authenticate,
  createForm,
  submitForm,
  toggleFormStatus,
  getFormResponses,
  deleteForm,
  editAllowedUsers,
};
