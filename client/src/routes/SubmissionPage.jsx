import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { config } from '../configs/config';
import { IoMdSave } from 'react-icons/io';
import { MdDone, MdOutlineClose } from 'react-icons/md';
import { Spinner, useToast } from '@chakra-ui/react'
import { GiBreakingChain } from 'react-icons/gi';

const SubmissionPage = () => {
    const toast = useToast()
    const { id } = useParams();
    let token = Cookies.get('jwt');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const [fileName, setFilename] = useState('');
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [uploadProgress, setUploadProgress] = useState(null);

    const checkFormStatus = async () => {
        try {
            let res = await axios.get(`${config.baseUrl}/forms/status/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.status === true) {
                setFormSubmitted(true);
            }

            setLoading(false);
            setIsValid(true);
            return true;
        } catch (error) {
            let errorResponse = error.response.data.status;

            if (errorResponse === true) {
                setIsValid(false);
                setLoading(false);
                setError(error.response.data.message);
                return false;
            }
        }
    };

    const getForm = async () => {
        setLoading(true);
        let formRes = await checkFormStatus();

        if (formRes === false) {
            return;
        }

        let res = await axios.get(`${config.baseUrl}/forms/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        let { description, questions, title } = res.data.formDetails;

        let newQuestions = questions.map((question) => {
            return {
                ...question,
                answer: ''
            }
        });

        setTitle(title);
        setDescription(description);
        setQuestions(newQuestions);

        setLoading(false);
    }

    const handleTextChange = (index, newText) => {
        const newQuestions = [...questions];
        newQuestions[index].answer = newText;
        setQuestions(newQuestions);
    }

    const handleSubmit = async () => {
        let userResponse = questions.map((question) => {
            return {
                answer: question.answer,
                questionId: question.questionId,
                answerType: question.answerType
            }
        });

        try {
            let res = await axios.post(`${config.baseUrl}/forms/submit/${id}`, {
                responses: [...userResponse]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: res.data.message,
                status: 'info',
                duration: 5000,
                isClosable: true,
            })

            setFormSubmitted(true);
        } catch (error) {
            toast({
                title: error.response.data.error,
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })

            if (error.response.data.error === 'You have already submitted a response') {
                setFormSubmitted(true);
            }
        }
    }

    const handleFileUpload = async () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (index) => {
        let serverRes = await axios.get("https://api.gofile.io/getServer");
        let server = serverRes.data.data.server;
        let serverUrl = `https://${server}.gofile.io/uploadFile`;

        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);

        let fileNames = fileInputRef.current.files[0].name;
        setFilename(fileNames);

        try {
            const response = await axios.post(serverUrl, formData, {
                onUploadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            if (response.data.status === 'ok') {
                let fileUrl = response.data.data.downloadPage;

                const newQuestions = [...questions];
                newQuestions[index].answer = fileUrl;
                setQuestions(newQuestions);
                setUploadedFileUrl(fileUrl);
                setUploadProgress(null);
            }
        } catch (error) {
            console.error(error);
            setUploadProgress(null);
        }
    };

    const clearFileSelection = async (index) => {
        setFilename('');
        setUploadedFileUrl('');
    }

    useEffect(() => {
        getForm();
    }, []);

    return (
        <div className='bg-indigo-300 min-h-screen flex flex-col items-center p-12'>

            {
                loading === true && <Spinner size='xl' colorScheme='purple' />
            }

            {
                formSubmitted === false && loading === false && isValid === true &&
                <div className='max-w-11/12 min-w-[800px] flex flex-col bg-slate-100 rounded-lg drop-shadow-md'>
                    <div className='p-6'>
                        <p className='text-left text-3xl font-bold'>{title}</p>
                        <p className='text-left'>{description}</p>
                    </div>
                    <div className='border-b-[1px] border-slate-300 my-1' />
                    <div className='p-6 my-4 flex flex-col gap-8'>
                        {
                            questions.map((question, index) => {
                                return (
                                    <div key={index} className='flex flex-col'>
                                        <span className='flex'>
                                            <p className='text-left text-lg font-bold'>{question.questionText}</p>
                                            {
                                                question.required === true &&
                                                <p className='text-left text-2xl text-red-500 mx-1'>*</p>
                                            }
                                        </span>
                                        {
                                            question.answerType === 'text' &&
                                            <input
                                                className='w-full p-2 border-b-[1px] border-slate-200 rounded-md'
                                                placeholder='Answer'
                                                value={question.answer}
                                                onChange={(e) => handleTextChange(index, e.target.value)}
                                            />
                                        }
                                        {
                                            question.answerType === 'file_upload' &&
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={() => handleFileChange(index)}
                                                />
                                                {
                                                    uploadProgress === null && uploadedFileUrl === '' &&
                                                    <div
                                                        onClick={handleFileUpload}
                                                        className='w-fit p-2 border-b-[1px] border-slate-200 rounded-md bg-white hover:drop-shadow cursor-pointer'>
                                                        Upload file
                                                    </div>
                                                }

                                                {
                                                    uploadProgress === null && uploadedFileUrl !== '' &&
                                                    <div className='flex items-center gap-2 w-fit p-2 border-b-[1px] border-slate-200 rounded-md bg-white hover:drop-shadow cursor-pointer'>
                                                        <a
                                                            href={uploadedFileUrl}
                                                            target='_blank'
                                                            rel="noreferrer"
                                                        >{fileName}</a>
                                                        <div className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                                            <MdOutlineClose onClick={() => clearFileSelection()} />
                                                        </div>
                                                    </div>
                                                }

                                                {
                                                    uploadProgress !== null &&
                                                    <div className='flex items-center gap-2 w-fit p-2 border-b-[1px] border-slate-200 rounded-md bg-white hover:drop-shadow cursor-pointer'>
                                                    {uploadProgress !== null && <p>Uploading: {uploadProgress}%</p>}
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className='flex justify-center p-4'>
                        <div onClick={handleSubmit} className="w-fit flex justify-start items-center gap-2 px-4 py-2 rounded-md cursor-pointer bg-indigo-500 hover:bg-indigo-600 transform transition-all duration-100">
                            <IoMdSave className="text-xl text-slate-100" />
                            <p className="text-slate-100 mt-1">Submit Form</p>
                        </div>
                    </div>
                </div>

            }

            {
                formSubmitted === true && loading === false &&
                <div className='p-10 bg-slate-100 flex flex-col gap-6 justify-center items-center rounded-lg drop-shadow-md'>
                    <div className='w-fit rounded-full bg-green-300'>
                        <MdDone className='text-3xl m-2 font-bold' />
                    </div>
                    <p className='text-3xl font-bold '>Your response has been recorded </p>
                </div>
            }

            {
                isValid === false && loading === false &&
                <div className='p-10 bg-slate-100 flex flex-col gap-6 justify-center items-center rounded-lg drop-shadow-md'>
                    <div className='w-fit rounded-full bg-green-300'>
                        <GiBreakingChain className='text-3xl m-2 font-bold' />
                    </div>
                    <p className='text-3xl font-bold '>{error}</p>
                </div>
            }
        </div>
    )
};

export default SubmissionPage;