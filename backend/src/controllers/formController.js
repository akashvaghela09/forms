const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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

const getFormDetails = (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to view the details of this form' });
        }

        // Create a copy of the form data excluding the responses
        const formDataWithoutResponses = { ...form };
        delete formDataWithoutResponses.responses;

        // Return all the details of the form except the responses in the response
        res.status(200).json({ formDetails: formDataWithoutResponses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createForm = (req, res) => {
    try {
        const { title, description, visibility, questions } = req.body;
        const ownerEmail = req.user.email;

        // Generate a unique form ID by trimming the UUID to 6 characters
        const formId = uuidv4().substr(0, 6);

        // Add incremental numbers as IDs to each question
        const questionsWithIds = questions.map((question, index) => ({
            questionId: index + 1, // Start question IDs from 1
            ...question,
        }));

        // Create a new form object
        const newForm = {
            formId,
            ownerEmail,
            title,
            description,
            visibility,
            questions: questionsWithIds,
            responses: [],
            active: true,
            allowedUsers: visibility === 'private' ? [] : null,
        };

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Add the new form to the forms data
        formsData.push(newForm);

        // Save the updated forms data back to the file
        fs.writeFileSync(formsFilePath, JSON.stringify(formsData, null, 2));

        // Return a success message in the response
        res.status(200).json({ message: 'Form created successfully', formId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitForm = (req, res) => {
    console.log(req.body);
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;
        const userResponses = req.body.responses; // Expecting an array of response objects with questionId and answer

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the form is active
        if (!form.active) {
            return res.status(400).json({ error: 'Form is not active' });
        }

        // Check the form visibility settings and user permissions
        if (form.visibility === 'private' && !form.allowedUsers.includes(userEmail)) {
            return res.status(403).json({ error: 'You are not allowed to submit this form' });
        }

        // Check if the user has already submitted a response
        if (form.responses.some(response => response.userEmail === userEmail)) {
            return res.status(400).json({ error: 'You have already submitted a response' });
        }

        // Validate that all required questions have been answered
        const answeredQuestionIds = userResponses.map(r => r.questionId);
        const unansweredRequiredQuestions = form.questions.filter(q => q.required && !answeredQuestionIds.includes(q.questionId));

        if (unansweredRequiredQuestions.length > 0) {
            return res.status(400).json({ error: 'All required questions must be answered', unansweredRequiredQuestions });
        }

        // Add the user's response to the form's responses array
        form.responses.push({ userEmail, responses: userResponses });

        // Save the updated form data back to the file
        formsData[formIndex] = form;
        fs.writeFileSync(formsFilePath, JSON.stringify(formsData, null, 2));

        // Return a success message in the response
        res.status(200).json({ message: 'Form response submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleFormStatus = (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to modify this form' });
        }

        // Toggle the active status of the form
        form.active = !form.active;

        // Save the updated form data back to the file
        formsData[formIndex] = form;
        fs.writeFileSync(formsFilePath, JSON.stringify(formsData, null, 2));

        // Return a success message in the response
        res.status(200).json({ message: 'Form status toggled successfully', activeStatus: form.active });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFormResponses = (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to view the responses for this form' });
        }

        // Return all the responses for the form in the response
        res.status(200).json({ responses: form.responses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteForm = (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to delete this form' });
        }

        // Remove the form from the forms data
        formsData.splice(formIndex, 1);

        // Save the updated forms data back to the file
        fs.writeFileSync(formsFilePath, JSON.stringify(formsData, null, 2));

        // Return a success message in the response
        res.status(200).json({ message: 'Form deleted successfully' });
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

const getAllowedUsers = (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        const formsData = JSON.parse(fs.readFileSync(formsFilePath));

        // Find the form by ID
        const formIndex = formsData.findIndex(form => form.formId === formId);
        if (formIndex === -1) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = formsData[formIndex];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to view the allowed users list for this form' });
        }

        // Check if the form is private
        if (form.visibility !== 'private') {
            return res.status(400).json({ error: 'This form is not private, so there is no allowed users list' });
        }

        // Return the list of allowed users for the private form
        res.status(200).json({ allowedUsers: form.allowedUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    authenticate,
    getFormDetails,
    createForm,
    submitForm,
    toggleFormStatus,
    getFormResponses,
    deleteForm,
    getAllowedUsers,
    editAllowedUsers,
};
