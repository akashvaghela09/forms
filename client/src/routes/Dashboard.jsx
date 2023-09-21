import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { config } from '../configs/config';
import { Spinner, Switch, useToast, Tooltip } from "@chakra-ui/react";
import { MdOutlineFileCopy, MdDeleteOutline, MdFileDownload, MdOutlineListAlt } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { AiOutlineBarChart } from "react-icons/ai";
import { v4 as uuid } from 'uuid';

const Dashboard = () => {
    let token = Cookies.get('jwt');
    const toast = useToast()
    const [formList, setFormList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getFormList = async () => {
        try {
            let res = await axios.get(`${config.baseUrl}/forms/getAllForms`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let list = res.data.forms;
            // sort list by date
            list.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setFormList(list);
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
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

    const handleFormDelete = async (formId) => {
        try {
            let res = await axios.delete(`${config.baseUrl}/forms/delete/${formId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: res.data.message,
                status: 'success',
                duration: 1000,
                isClosable: true,
            })

            let newList = formList.filter((form) => {
                return form.formId !== formId;
            });

            setFormList(newList);
        } catch (error) {
            console.log(error);
            toast({
                title: 'Error',
                status: 'error',
                duration: 1000,
                isClosable: true,
            })
        }
    }

    const handleVisibilityChange = async (formId) => {
        try {
            let res = await axios.patch(`${config.baseUrl}/forms/visibility/${formId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: res.data.message,
                status: 'success',
                duration: 1000,
                isClosable: true,
            })

            let newList = formList.map((form) => {
                if (form.formId === formId) {
                    form.visibility = form.visibility === "private" ? "public" : "private";
                }
                return form;
            });

            setFormList(newList);
        } catch (error) {
            console.log(error);
        }
    }

    const handleActiveStatusChange = async (formId) => {
        try {
            let res = await axios.patch(`${config.baseUrl}/forms/status/${formId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: res.data.message,
                status: 'success',
                duration: 1000,
                isClosable: true,
            })

            let newList = formList.map((form) => {
                if (form.formId === formId) {
                    form.active = !form.active;
                }
                return form;
            });

            setFormList(newList);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getFormList();
    }, []);

    return (
        <div className="h-full max-h-screen overflow-scroll">
            {
                isLoading === true && <div className="h-full flex justify-center items-center"><Spinner size="xl" /></div>
            }

            {
                isLoading === false && formList.length === 0 && <div className="h-full flex justify-center items-center">Forms not found</div>
            }

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-10">
                {
                    isLoading === false &&
                    formList.length > 0 &&
                    formList.map((form, index) => {
                        return (
                            <div key={uuid()} className="border-slate-200 border-[1px] rounded-lg hover:drop-shadow-md hover:bg-white transform transition-all duration-300 cursor-pointer">
                                <div className="p-4 bg-indigo-300 rounded-t-lg">
                                    <p className="text-left px-2 text-xl font-bold line-clamp-1">{form.title}</p>
                                    <p className="text-left px-2 text-sm line-clamp-1">{form.description}</p>
                                </div>
                                <div className='border-b-[1px] border-slate-200' />
                                <div className="p-2">
                                    <div className='flex justify-between items-center m-2'>
                                        <a
                                            href={`https://forms.app3.in/${form.formId}`}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='hover:text-blue-800'
                                        >{`https://forms.app3.in/${form.formId}`}</a>
                                        <Tooltip label="Copy Form URL">
                                            <div onClick={() => copyText(`https://forms.app3.in/${form.formId}`)} className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                                <MdOutlineFileCopy className='text-xl' />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className='border-b-[1px] border-slate-200' />
                                    <div className="flex justify-between items-center m-2 my-4">
                                        <p>Private</p>
                                        <Switch
                                            defaultChecked={form.visibility === "private" ? true : false}
                                            checked={form.visibility === "private" ? true : false}
                                            onChange={(e) => handleVisibilityChange(form.formId)}
                                        />
                                    </div>
                                    <div className='border-b-[1px] border-slate-200' />
                                    <div className="flex justify-between m-2 my-4">
                                        <p>Active</p>
                                        <Switch 
                                        defaultChecked={form.active}
                                        checked={form.active}
                                        onChange={(e) => handleActiveStatusChange(form.formId)}
                                        />
                                    </div>
                                    <div className='border-b-[1px] border-slate-200' />
                                    <div className="flex justify-start gap-2 m-2 my-4">
                                        <Tooltip label="View Submissions">
                                            <div className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                                <MdOutlineListAlt className='text-2xl' />
                                            </div>
                                        </Tooltip>
                                        <Tooltip label="Graph">
                                            <div className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                                <AiOutlineBarChart className='text-2xl' />
                                            </div>
                                        </Tooltip>
                                        <Tooltip label="Download">
                                            <div className='p-2 rounded-full hover:bg-slate-200 text-slate-700 cursor-pointer active:bg-slate-300 '>
                                                <MdFileDownload className='text-2xl' />
                                            </div>
                                        </Tooltip>
                                        {
                                            form.visibility === 'private' &&
                                            <Tooltip label="Manage Access">
                                                <div className='p-2 rounded-full hover:bg-slate-200 text-slate-600 cursor-pointer active:bg-slate-300 '>
                                                    <FaUserCog className='text-xl' />
                                                </div>
                                            </Tooltip>
                                        }
                                        <div className="grow" />
                                        <Tooltip label="Delete">
                                            <div onClick={() => handleFormDelete(form.formId)} className='p-2 rounded-full hover:bg-red-400 text-slate-700 hover:text-slate-100 cursor-pointer active:bg-red-500 '>
                                                <MdDeleteOutline className='text-2xl' />
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Dashboard;