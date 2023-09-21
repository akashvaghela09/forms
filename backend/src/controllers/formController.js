const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../configs.js/config');

const formsFilePath = path.join(__dirname, '../data/forms.json');
const JWT_SECRET = process.env.JWT_SECRET;

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

const createForm = async (req, res) => {
    try {
        const { title, description, visibility, questions, allowedUsers } = req.body;
        const ownerEmail = req.user.email;

        const formId = uuidv4().split('-').join('').slice(0, 10);

        const questionsWithIds = questions.map((question, index) => ({
            questionId: index + 1,
            ...question,
        }));

        const newForm = {
            formId,
            ownerEmail,
            title,
            description,
            visibility: visibility || 'public',
            questions: questionsWithIds,
            active: true,
            allowedUsers: visibility === 'private' ? [...allowedUsers] : null,
        };

        const { data: forms_data, error: writeError } = await supabase
            .from('forms_generated')
            .insert([newForm])
            .select();
        if (writeError) return res.status(400).json({ error: writeError.message });

        res.status(200).json({ message: 'Form created successfully', formId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitForm = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;
        const userResponses = req.body.responses;
        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select("*")
            .eq('formId', formId)

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        if (readError) return res.status(400).json({ error: error.message });

        const form = forms_generated[0];

        if (!form.active) {
            return res.status(400).json({ error: 'Form is not active' });
        }

        if (form.visibility === 'private' && !form.allowedUsers.includes(userEmail)) {
            return res.status(403).json({ error: 'You are not allowed to submit this form' });
        }

        const { data: readData, error: resReadError } = await supabase
            .from('forms_responses')
            .select('*')
            .eq('formId', formId)
            .eq('userEmail', userEmail);

        if (readData.length > 0) {
            return res.status(400).json({ error: 'You have already submitted a response' });
        }

        const answeredQuestionIds = userResponses.map(r => r.questionId);
        const unansweredRequiredQuestions = form.questions.filter(q => q.required && !answeredQuestionIds.includes(q.questionId));

        if (unansweredRequiredQuestions.length > 0) {
            return res.status(400).json({ error: 'All required questions must be answered', unansweredRequiredQuestions });
        }

        const { data, error: writeError } = await supabase
            .from('forms_responses')
            .insert([{ formId, userEmail, responses: userResponses }])
            .select()
        if (writeError) return res.status(400).json({ error: writeError.message });

        res.status(200).json({ message: 'Form response submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllForms = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No Authorization header provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;

        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('ownerEmail', userEmail);

        if (readError) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Forms fetched successfully', forms: forms_generated });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the forms', details: error.message });
    }
}

const getForm = async (req, res) => {
    try {
        const formId = req.params.formId;

        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId);

        if (readError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        res.status(200).json({ formDetails: form });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleFormActiveStatus = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId);

        if (readError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to toggle the status of this form' });
        }

        form.active = !form.active;

        const { data, error: writeError } = await supabase
            .from('forms_generated')
            .update({ active: form.active })
            .eq('formId', formId)
            .select()
        if (writeError) return res.status(400).json({ error: writeError.message });

        // Return a success message in the response
        res.status(200).json({ message: 'Form status toggled successfully', active: form.active });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleFormVisibility = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId);

        if (readError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to toggle the status of this form' });
        }

        form.visibility = form.visibility === 'public' ? 'private' : 'public';

        const { data, error: writeError } = await supabase
            .from('forms_generated')
            .update({ visibility: form.visibility })
            .eq('formId', formId)
            .select()
        if (writeError) return res.status(400).json({ error: writeError.message });

        // Return a success message in the response
        res.status(200).json({ message: 'Form status toggled successfully', visibility: form.visibility });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFormResponses = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        let { data: forms_generated, error: readFormError } = await supabase
            .from('forms_generated')
            .select('ownerEmail')
            .eq('formId', formId);

        if (readFormError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to view the responses for this form' });
        }

        let { data: forms_responses, error: readResponseError } = await supabase
            .from('forms_responses')
            .select('*')
            .eq('formId', formId);

        if (readResponseError) return res.status(400).json({ error: error.message });

        // Return all the responses for the form in the response
        res.status(200).json({ responses: forms_responses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFormStatus = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        let { data: forms_generated, error: readError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId)
            
        if (readError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(400).json({ status: true, message: 'Form not found' });
        }

        let form = forms_generated[0];

        if(form.active === false) {
            return res.status(400).json({ status: true, message: 'Form is not active' });
        }

        let { data: forms_responses, error: readFormError } = await supabase
            .from('forms_responses')
            .select('*')
            .eq('formId', formId)
            .eq('userEmail', userEmail);

        if (readFormError) return res.status(400).json({ error: error.message });

        if (forms_responses.length > 0) {
            return res.status(200).json({ status: true, message: 'Your response has beed recorded' });
        } else {
            return res.status(200).json({ status: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteForm = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        let { data: forms_generated, error: readFormError } = await supabase
            .from('forms_generated')
            .select('ownerEmail')
            .eq('formId', formId);

        if (readFormError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to delete this form' });
        }

        const { data: deleteResponse, error: deleteError } = await supabase
            .from('forms_generated')
            .delete()
            .eq('formId', formId)
            .select()

        if (deleteError) return res.status(400).json({ error: deleteError.message });

        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllowedUsers = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;

        // Read the existing forms data
        let { data: forms_generated, error: readFormError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId);

        if (readFormError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to view the allowed users list for this form' });
        }

        // Check if the form is private
        if (form.visibility !== 'private') {
            return res.status(400).json({ error: 'This form is not private, so the allowed users list cannot be viewed' });
        }

        res.status(200).json({ allowedUsers: form.allowedUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editAllowedUsers = async (req, res) => {
    try {
        const formId = req.params.formId;
        const userEmail = req.user.email;
        const { allowedUsers } = req.body;

        // Read the existing forms data
        let { data: forms_generated, error: readFormError } = await supabase
            .from('forms_generated')
            .select('*')
            .eq('formId', formId);

        if (readFormError) return res.status(400).json({ error: error.message });

        if (forms_generated.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const form = forms_generated[0];

        // Check if the user is the owner of the form
        if (form.ownerEmail !== userEmail) {
            return res.status(403).json({ error: 'You are not authorized to edit the allowed users list for this form' });
        }

        // Check if the form is private
        if (form.visibility !== 'private') {
            return res.status(400).json({ error: 'This form is not private, so the allowed users list cannot be edited' });
        }

        const { data: updateResponse, error: updateError } = await supabase
            .from('forms_generated')
            .update({ allowedUsers })
            .eq('formId', formId)
            .select();

        // Return a success message in the response
        res.status(200).json({ message: 'Access list updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    authenticate,
    getAllForms,
    getForm,
    createForm,
    submitForm,
    toggleFormActiveStatus,
    toggleFormVisibility,
    getFormResponses,
    getFormStatus,
    deleteForm,
    getAllowedUsers,
    editAllowedUsers,
};
