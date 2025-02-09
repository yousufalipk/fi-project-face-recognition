"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from "axios";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";

// Icons Import from react-icons
import { CiSettings } from "react-icons/ci";
import { MdStorage } from "react-icons/md";
import { CiMenuBurger } from "react-icons/ci";
import { FaEarthAmericas } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { FaInstagramSquare } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";

import Loader from '../../components/loader';



const SearchPeoplePage = () => {

    const [fileName, setFileName] = useState("");
    const [file, setFile] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [dots, setDots] = useState('');
    const [buttonLoading, setButtonLoading] = useState(false);


    useEffect(() => {
        let interval;
        if (buttonLoading) {
            interval = setInterval(() => {
                setDots(prev => (prev.length < 4 ? prev + '.' : ''));
            }, 300);
        } else {
            setDots('');
        }
        return () => clearInterval(interval);
    }, [buttonLoading]);

    useEffect(() => {
        const loadModels = async () => {
            console.log('Loading Face Api Models!');
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (results.length > 0 && !searchTerm) {
            setRecentResults(prev => {
                const updatedResults = [...results, ...prev];
                return updatedResults.slice(0, 5);
            });

            setResults([]);
        }
    }, [searchTerm]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
            setFileName(file.name);
        } else {
            setFile("");
            setFileName("");
        }
    };

    const searchByUsername = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/search?query=${searchTerm}`);

            const result = await response.json();

            if (!response.ok) {
                console.log('Error searching accounts!');
                return;
            }

            setResults([...result.facebookUsers, ...result.instagramUsers]);
        } catch (error) {
            console.log('Internal Server Error!', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMatchFaces = async () => {
        try {
            setButtonLoading(true);
            if (!file || results.length === 0) {
                console.log('File not uploaded or no account found in search!');
                return;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("accounts", JSON.stringify(results));

            const res = await fetch("/api/match", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                toast.error('No Match found!');
                return;
            }

            const data = await res.json();

            if (data.message) {
                toast.success('Match found!');
                const parsedIndex = parseInt(data.message.username, 10);
                setResults((prevResults) => prevResults[parsedIndex] ? [prevResults[parsedIndex]] : []);
                return;
                setResults((prevResults) => prevResults.filter((_, i) => i === data.message.username));
            } else {
                toast.error('No match found!');
            }
        } catch (error) {
            toast.error('Internal Server Error!');
            console.log('Internal Server Error!', error);
        } finally {
            setButtonLoading(false);
        }
    }

    return (
        <div className='w-full h-[100vh] bg-black flex flex-col justify-start items-center p-4 text-white overflow-x-hidden overflow-y-scroll gap-5'>
            <div className='w-full h-[10vh] flex justify-between items-center'>
                <div className='w-[10vw] h-full flex justify-center items-center gap-4'>
                    <h1 className='font-bold w-5 h-5 border-4 rounded-full'></h1>
                    <h1
                        className='font-bold text-2xl'
                    >
                        Searcher
                    </h1>
                </div>
                <ul className='w-[50vw] h-full flex justify-end items-center gap-3 text-lg'>
                    <li className='px-5'>
                        People
                    </li>
                    <li className='px-5'>
                        Images
                    </li>
                    <li className='px-5'>
                        Places
                    </li>
                    <li className='px-5'>
                        Videos
                    </li>
                    <li className='rounded-xl bg-neutral-700 p-2'>
                        <CiSettings size={40} />
                    </li>
                    <li className='rounded-xl bg-neutral-700 p-2'>
                        <MdStorage size={40} />
                    </li>
                    <li className='rounded-xl bg-neutral-700 p-2 mr-5'>
                        <CiMenuBurger size={40} />
                    </li>
                    <li className='rounded-full bg-white flex justify-center items-center text-green-500 p-4'>
                        <FaEarthAmericas size={20} />
                    </li>
                </ul>
            </div>
            <hr className='border-[1px] w-full border-neutral-600' />
            <div className='w-full h-[10vh] flex justify-center items-end'>
                <h1 className='text-center font-bold text-4xl'>
                    Find people by name or face
                </h1>
            </div>
            <div className='w-[70%] h-[25vh] flex flex-col justify-start items-start py-3 gap-3'>
                <div className="relative w-[40%]">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full h-12 bg-neutral-700 rounded-lg px-4 pr-12 text-white outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={searchByUsername}
                        className="absolute inset-y-0 right-3 flex items-center justify-center text-white"
                    >
                        <CiSearch size={25} />
                    </button>
                </div>
                <p className='text-neutral-700'>
                    or
                </p>
                <div className='w-[50%] h-12 flex justify-center items-center bg-neutral-700 rounded-lg overflow-hidden'>
                    <label className="flex items-center justify-center gap-2 w-[80%] h-12 px-4 bg-neutral-700 rounded-l-lg cursor-pointer text-white">
                        <div className='w-full h-full flex justify-center items-center gap-2'>
                            <FaImage />
                            <span>{fileName || "Upload Image Here"}</span>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} disabled={loading || results.length === 0} />
                    </label>
                    <button
                        onClick={() => {
                            handleMatchFaces();
                        }}
                        disabled={buttonLoading || loading || results.length === 0}
                        className='w-[20%] h-full flex justify-center items-center bg-neutral-800 transition-all duration-300 ease-out hover:text-neutral-500 rounded-lg'
                    >
                        {buttonLoading ? (
                            <span className="flex justify-center items-center text-5xl font-bold w-full">
                                <p className="absolute -mt-6">
                                    {dots}
                                </p>
                            </span>
                        ) : (
                            <>
                                Compare
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Current Searches */}
            <div className='w-[70%] flex flex-col justify-start items-start gap-2'>
                <h1 className='w-full text-start font-semibold text-xl'>
                    Search Results
                </h1>
                <div className='w-full h-full overflow-x-hidden overflow-y-scroll flex flex-col justify-start items-start gap-2'>
                    {results.length > 0 ? (
                        <>
                            {results.map((user, index) => {
                                return (
                                    <div
                                        key={index}
                                        className='w-full h-12 flex justify-between items-center my-1'
                                    >
                                        <div className='w-1/2 h-full flex justify-start items-center gap-5'>
                                            <Image
                                                src={`${user?.image?.uri || user.user.profile_pic_url}`}
                                                alt='profile_pic'
                                                width={50}
                                                height={50}
                                                className='rounded-full overflow-hidden'
                                            />
                                            <div className='w-[20vw] flex flex-col justify-center items-start'>
                                                <h1 className='text-start font-semibold'>
                                                    {user?.name || user.user.full_name}
                                                </h1>
                                                <p className='text-start text-neutral-500 flex justify-start items-center gap-1'>
                                                    rank {index + 1}, type {user?.image ? <FaFacebookSquare size={20} /> : <FaInstagramSquare size={20} />}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='w-1/2 h-full flex justify-end items-center mr-5'>
                                            <button
                                                onClick={() => {
                                                    window.open(user?.profile_url || user.user.profile_pic_url, "_blank");
                                                }}
                                                className='bg-neutral-700 py-1 px-5 rounded-lg hover:bg-neutral-800 transition-all duration-300 ease-out'
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <>
                            {loading ? (
                                <>
                                    <div className='flex justify-center items-center'>
                                        <Loader size={15} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {results.length === 0 && (
                                        <div className='w-full flex justify-center items-center text-center py-2 italic'>
                                            No search results!
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Recent Searches */}
            <div className='w-[70%] flex flex-col justify-start items-start gap-2'>
                <h1 className='w-full text-start font-semibold text-xl'>
                    Recent Searches
                </h1>
                <div className='w-full h-full flex flex-col justify-start items-start gap-2'>
                    {recentResults.length > 0 ? (
                        <>
                            {recentResults.map((user, index) => {
                                return (
                                    <div
                                        key={index}
                                        className='w-full h-12 flex justify-between items-center my-1'
                                    >
                                        <div className='w-1/2 h-full flex justify-start items-center gap-5'>
                                            <Image
                                                src={`${user?.image?.uri || user.user.profile_pic_url}`}
                                                alt='profile_pic'
                                                width={50}
                                                height={50}
                                                className='rounded-full overflow-hidden'
                                            />
                                            <div className='w-[20vw] flex flex-col justify-center items-start'>
                                                <h1 className='text-start font-semibold'>
                                                    {user?.name || user.user.full_name}
                                                </h1>
                                                <p className='text-start text-neutral-500'>
                                                    rank {index + 1}, type {user?.image ? <FaFacebookSquare /> : <FaInstagramSquare />}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='w-1/2 h-full flex justify-end items-center mr-5'>
                                            <button
                                                onClick={() => {
                                                    window.open(user?.profile_url || user.user.profile_pic_url, "_blank");
                                                }}
                                                className='bg-neutral-700 py-1 px-5 rounded-lg hover:bg-neutral-800 transition-all duration-300 ease-out'
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <>
                            {
                                <div div className='w-full flex justify-center items-center text-center py-2 italic'>
                                    No recent searches!
                                </div>
                            }
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}

export default SearchPeoplePage;
