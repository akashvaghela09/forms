import { MdFileDownload, MdOutlineKeyboardBackspace } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import {
    useToast,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { config } from '../configs/config';

const ResponsePage = () => {
    const toast = useToast()
    const { id } = useParams();
    let token = Cookies.get('jwt');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);

    const fetchFormResponse = async () => {
        let res = await axios.get(`${config.baseUrl}/forms/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        let form = res.data.formDetails;

        setTitle(form.title);
        setDescription(form.description);
        setQuestions(form.questions);

        let readRes = await axios.get(`${config.baseUrl}/forms/responses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setResponses(readRes.data.responses);
    };

    const transformedData = responses.map(userResponse => {
        const userAnswers = {};
        questions.forEach(question => {
            const response = userResponse.responses.find(r => r.questionId === question.questionId);
            const key = `question${question.questionId}`;
            userAnswers[key] = response ? response.answer : '';
        });
        return {
            userEmail: userResponse.userEmail,
            ...userAnswers
        };
    });

    useEffect(() => {
        fetchFormResponse();
    }, []);

    return (
        <div>
            <div className='flex justify-between px-10 py-5'>
                <Link to="/">
                    <div className='flex gap-2 p-2 h-fit cursor-pointer'>
                        <MdOutlineKeyboardBackspace className='text-xl' />
                        Go back
                    </div>
                </Link>
                <div className='flex gap-2 p-2 h-fit bg-slate-50 border-[1px] border-slate-300 rounded-md cursor-pointer hover:drop-shadow-md'>
                    <MdFileDownload className='text-xl' />
                    Download
                </div>
            </div>

            <div className='mx-10 border-[1px] border-slate-300 rounded-lg'>
                <div className='p-2'>
                    <p className='text-left px-2 text-2xl font-bold'>{title}</p>
                    <p className='text-left px-2'>{description}</p>
                </div>
                <div className='border-t-[1px] border-slate-300 my-1' />
                <div className='max-w-full overflow-x-auto'>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>User</Th>
                                {questions.map(question => (
                                    <Th key={question.questionId}>{question.questionText}</Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {transformedData.map(userRow => (
                                <Tr key={userRow.userEmail}>
                                    <Td>{userRow.userEmail}</Td>
                                    {questions.map(question => {
                                        const answerKey = `question${question.questionId}`;
                                        const answerValue = userRow[answerKey];
                                        const questionDetails = questions.find(q => q.questionId === question.questionId);
                                        return (
                                            <Td key={question.questionId}>
                                                {questionDetails && questionDetails.answerType === "file_upload" ? (
                                                    <a href={answerValue} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:text-blue-800'>
                                                        {answerValue}
                                                    </a>
                                                ) : (
                                                    answerValue
                                                )}
                                            </Td>
                                        );
                                    })}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default ResponsePage;