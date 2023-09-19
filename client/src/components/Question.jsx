import React, { useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { Switch, Select } from '@chakra-ui/react'

const Question = ({ questionRequired, questionText, index, handleTextChange, handleDelete, handleToggle, handleAnswerType }) => (
    <div className='bg-white rounded-lg p-4 flex flex-col justify-start gap-2 h-fit w-3/5 max-[800px] drop-shadow-md'>
        <input
            className='w-full p-2 border-b-[1px] border-slate-200 text-xl'
            placeholder='Question'
            value={questionText}
            onChange={(e) => handleTextChange(index, e.target.value)}
        />
        <div className='flex justify-between items-center'>
            <div className=''>
                <Select
                    defaultValue={"text"}
                    onChange={e => handleAnswerType(index, e.target.value)}
                >
                    <option value='text'>Short answer</option>
                    <option value='file'>File upload</option>
                </Select>
            </div>
            <div className='flex items-center'>
                <div
                    className='hover:bg-slate-200 cursor-pointer p-2 rounded-full'
                    onClick={() => handleDelete(index)}
                >
                    <MdDeleteOutline className='text-2xl text-slate-600' />
                </div>
                <div className='h-7 mx-2 bg-slate-300 w-[1px]' />
                <div className='p-2 flex gap-2 items-center'>
                    <p>Required</p>
                    <Switch
                        size="md"
                        colorScheme="purple"
                        isChecked={questionRequired}
                        onChange={(e) => handleToggle(index, e.target.checked)}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default Question;