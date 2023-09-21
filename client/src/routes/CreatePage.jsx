import React, { useState } from 'react';
import { IoMdAdd, IoMdClose, IoMdSave } from 'react-icons/io';
import { MdOutlineFileCopy } from 'react-icons/md';
import {
    Switch, useToast, Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { v4 as uuid } from 'uuid';
import Question from '../components/Question';
import { config } from '../configs/config';
import axios from 'axios';
import Cookies from 'js-cookie';

const CreatePage = () => {
    const toast = useToast()
    const [questions, setQuestions] = useState([{ questionText: '', required: false, answerType: 'text', id: uuid() }]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [email, setEmail] = useState('');
    const [allowedUserList, setAllowedUserList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [formUrl, setFormUrl] = useState('');

    let token = Cookies.get('jwt');

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', required: false, answerType: 'text', id: uuid() }]);
    };

    const handleTextChange = (index, newText) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = newText;
        setQuestions(newQuestions);
    };

    const handleToggle = (index, newValue) => {
        const newQuestions = [...questions];
        newQuestions[index].required = newValue;
        setQuestions(newQuestions);
    }

    const handleAnswerType = (index, para) => {
        console.log("answer type => ", para);
        const newQuestions = [...questions];
        newQuestions[index].answerType = para;
        setQuestions(newQuestions);
    }

    const handleDelete = (index) => {
        const newQuestions = questions.filter((_, idx) => idx !== index);
        setQuestions(newQuestions);
    };

    const handleEmailChange = (newEmail) => {
        setEmail(newEmail);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (email.length === 0) {
                return;
            }

            if (!allowedUserList.includes(email)) {
                let reversedAllowedUserList = [...allowedUserList, email];
                setAllowedUserList([...reversedAllowedUserList.reverse()]);
            } else {
                console.log("Email already exists in the list");
            }
            setEmail('');
        }
    }

    const handleRemoveEmail = (index) => {
        setAllowedUserList(allowedUserList.filter((_, idx) => idx !== index));
    }

    const handleSubmit = async () => {
        if (title.length === 0) {
            toast({
                title: 'Error',
                description: "Title cannot be empty",
                status: 'info',
                duration: 5000,
                isClosable: true,
            })

            return;
        }

        if (questions.length === 0 || questions[0].questionText.length === 0) {
            toast({
                title: 'Error',
                description: "Questions cannot be empty",
                status: 'info',
                duration: 5000,
                isClosable: true,
            })

            return;
        }

        try {
            const res = await axios.post(`${config.baseUrl}/forms/create`, {
                title,
                description,
                visibility: isPrivate ? "private" : "public",
                questions,
                allowedUsers: allowedUserList
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            let url = `https://forms-app3.vercel.app/${res.data.formId}`;

            setTitle('');
            setDescription('');
            setQuestions([{ questionText: '', required: false, answerType: 'text', id: uuid() }]);
            setEmail('');
            setAllowedUserList([]);
            setFormUrl(url);

            setIsOpen(true);

        } catch (error) {
            console.log(error);
        }
    }

    const copyText = (text) => {
        navigator.clipboard.writeText(text);

        toast({
            title: 'Copied',
            status: 'info',
            duration: 1000,
            isClosable: true,
        })
    }

    return (
        <div className='relative h-screen overflow-scroll flex justify-between bg-indigo-300'>
            <div className='relative w-full flex flex-col items-center py-10 pr-72 gap-4'>
                <div className='bg-white rounded-lg p-4 flex flex-col justify-start gap-2 h-fit w-3/5 max-[800px] drop-shadow-lg'>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className='text-xl p-2 border-b-[1px] border-slate-200' placeholder='Untitled Form' />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Form Description' className='p-2 w-full h-16 border-b-[1px] border-slate-200'></textarea>
                </div>

                {questions.map((question, index) => (
                    <Question
                        questionRequired={question.required}
                        key={question.id}
                        questionText={question.questionText}
                        index={index}
                        handleDelete={handleDelete}
                        handleTextChange={handleTextChange}
                        handleToggle={handleToggle}
                        handleAnswerType={handleAnswerType}
                    />
                ))}
            </div>

            <div className='w-72 bg-slate-100 h-screen fixed top-0 right-0 border-l-2 border-slate-200 select-none'>
                <div onClick={handleAddQuestion} className="flex justify-start items-center gap-2 px-4 py-2 m-2 rounded-md cursor-pointer hover:bg-indigo-100 transform transition-all duration-100">
                    <IoMdAdd className="text-xl text-slate-600" />
                    <p className="text-slate-900">Add Question</p>
                </div>
                <div className='border-b-[1px] border-slate-300' />
                <div className=' py-2 m-2'>
                    <p className='text-left font-semibold'>Manage Access</p>
                    <div className='my-1 flex gap-2 items-center'>
                        <p className='font-light'>Private</p>
                        <Switch checked={isPrivate} size="md" colorScheme="purple" onChange={(e) => setIsPrivate(e.target.checked)} />
                    </div>
                    {
                        isPrivate === true &&
                        <div className='mt-3 flex flex-col gap-1'>
                            <input
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e)}
                                className='w-full text-lg p-1 px-2 border-[1px] border-slate-300 rounded-md'
                            />
                            <div className='flex flex-col gap-2 h-fit max-h-40 overflow-scroll hide-scrollbar' style={{ padding: allowedUserList.length > 0 && "8px" }}>
                                {
                                    allowedUserList.map((user, index) => (
                                        <div key={uuid()} className='flex justify-between items-center bg-slate-50 border-[1px] border-slate-300 rounded-md'>
                                            <p className='px-2'>{user}</p>
                                            <div
                                                className='hover:bg-slate-200 cursor-pointer p-1 rounded-full'
                                                onClick={() => handleRemoveEmail(index)}
                                            >
                                                <IoMdClose className='text-xl text-slate-600' />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    }
                </div>
                <div className='border-b-[1px] border-slate-300' />
                <div onClick={handleSubmit} className="flex justify-start items-center gap-2 px-4 py-2 m-2 rounded-md cursor-pointer bg-indigo-500 hover:bg-indigo-600 transform transition-all duration-100">
                    <IoMdSave className="text-xl text-slate-100" />
                    <p className="text-slate-100 mt-1">Create Form</p>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Form created successfully 🎉</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className='flex items-center gap-4'>
                            <a
                                href={formUrl}
                                target='_blank'
                                rel='noreferrer'
                                className='hover:text-blue-800'
                            >{formUrl}</a>
                            <div onClick={() => copyText(formUrl)} className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                <MdOutlineFileCopy className='text-xl' />
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CreatePage;
