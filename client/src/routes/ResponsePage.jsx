import { MdFileDownload, MdOutlineKeyboardBackspace } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner
} from '@chakra-ui/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { config } from '../configs/config';

const ResponsePage = () => {
    const { id } = useParams();
    let token = Cookies.get('jwt');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFormResponse = async () => {
        setLoading(true);

        try {
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
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
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

    const handleDownload = () => {
        // Convert the transformedData to CSV format
        let csvContent = "";
        csvContent += ["User"].concat(questions.map(q => q.questionText)).join(",") + "\n"; // headers

        transformedData.forEach(userRow => {
            const row = [userRow.userEmail].concat(questions.map(question => {
                const answer = userRow[`question${question.questionId}`] || '';
                // If the answer is a URL, wrap it in double quotes to ensure it's treated as a single value in CSV
                return answer.startsWith('http') ? `"${answer}"` : answer;
            }));
            csvContent += row.join(",") + "\n";
        });

        // Create a blob from the CSV content and create a URL for it
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        // Create a hidden anchor element, set its href to the blob URL, and trigger a click
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "responses.csv";
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };


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
                <div onClick={handleDownload} className='flex gap-2 p-2 h-fit bg-slate-50 border-[1px] border-slate-300 rounded-md cursor-pointer hover:drop-shadow-md'>
                    <MdFileDownload className='text-xl' />
                    Download
                </div>
            </div>

            <div className='m-10'>
                <p className='text-3xl text-left font-bold'>Total Response : {responses.length}</p>
            </div>

            {
                loading === true ? <Spinner size='xl' />
                    :
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
            }
        </div>
    );
};

export default ResponsePage;