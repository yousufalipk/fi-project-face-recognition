"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from "react-toastify";

// Icons Import from react-icons
import { CiSearch } from "react-icons/ci";
import { FaInstagramSquare } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import ClipLoader from "react-spinners/ClipLoader";

const SearchPeoplePage = () => {

    const [fileName, setFileName] = useState("");
    const [file, setFile] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const handleSearchAccount = async () => {
        try {
            console.log("/////////////////*****=> Search started.");
            setLoading(true);

            let accounts = [];
            setResults([]);

            if (!searchTerm && !file) {
                console.log("/////////////////*****=> Missing search term & file.");
                toast.error('Username & Image is required!');
                setProgress(100);
                return;
            }

            console.log("/////////////////*****=> Searching by username:", searchTerm);
            const response = await fetch(`/api/search?query=${searchTerm}`);
            const result = await response.json();

            if (!response.ok) {
                console.error("/////////////////*****=> Error searching accounts!");
                toast.error('Error searching accounts!');
                return;
            }

            console.log("/////////////////*****=> Accounts found from search:", result);
            accounts = [...result.facebookUsers, ...result.instagramUsers];

            const formData = new FormData();
            formData.append("file", file);
            formData.append("accounts", JSON.stringify(accounts));

            console.log("/////////////////*****=> Sending data to /api/match...");
            const res = await fetch("/api/match", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                console.error("/////////////////*****=> Error matching faces!");
                toast.error('Error Matching Faces!');
                setProgress(100);
                return;
            }

            const data = await res.json();
            console.log("/////////////////*****=> Match API response:", data);

            if (!data.success) {
                try {
                    console.log("/////////////////*****=> No match found, starting reverse face search...");

                    const formDataFile = new FormData();
                    formDataFile.append('file', file);

                    const faceSearchResponse = await fetch('/api/reverse-face-search', {
                        method: 'POST',
                        body: formDataFile,
                    });

                    if (!faceSearchResponse.ok) {
                        console.error("/////////////////*****=> Error searching accounts with reverse face search.");
                        toast.error('Error searching accounts!');
                        return;
                    }

                    const result = await faceSearchResponse.json();
                    console.log("/////////////////*****=> Reverse face search result:", result);

                    accounts = result.accounts;

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("accounts", JSON.stringify(accounts));

                    console.log("/////////////////*****=> Sending reverse search results to /api/match...");
                    const res = await fetch("/api/match", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        console.error("/////////////////*****=> No match found after reverse search!");
                        toast.error('No match found!');
                        return;
                    }

                    const data = await res.json();
                    console.log("/////////////////*****=> Final match response:", data);

                    if (data.success) {
                        console.log("/////////////////*****=> Match found!");
                        toast.success('Match found!');
                        const parsedIndex = parseInt(data.file_name, 10);
                        setResults((prevResults) => [...prevResults, accounts[parsedIndex]]);
                    } else {
                        console.error("/////////////////*****=> Match not found!");
                        toast.error('Match not found!');
                    }
                } catch (error) {
                    console.error("/////////////////*****=> Error in reverse face search request:", error);
                    toast.error('An unexpected error occurred!');
                }
                return;
            } else {
                console.log("/////////////////*****=> Match found!");
                toast.success('Match found!');
                const parsedIndex = parseInt(data.file_name, 10);
                setResults((prevResults) => [...prevResults, accounts[parsedIndex]]);
            }
        } catch (error) {
            console.error("/////////////////*****=> Internal Server Error!", error);
            toast.error('Internal Server Error!');
        } finally {
            console.log("/////////////////*****=> Search process completed.");
            setLoading(false);
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    };


    return (
        <div className='w-full h-[100vh] bg-[#111827] flex flex-col justify-start items-center text-[#D1D5DB] overflow-x-hidden overflow-y-scroll gap-5'>
            <div className='w-full h-[10vh]'>
                <Navbar />
            </div>

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
                        className='w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-300 placeholder-gray-500'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={handleSearchAccount}
                        className="absolute inset-y-0 right-3 flex items-center justify-center hover:scale-110 transition-all duration-300 ease-out"
                    >
                        <CiSearch size={25} color='#14B8A6' />
                    </button>
                </div>
                <p className='text-neutral-700'>
                    and
                </p>
                <div className='flex justify-center items-center'>
                    <label className="flex items-center justify-center cursor-pointer text-white">
                        <div className='w-full h-full flex justify-center items-center gap-2'>
                            <FaUpload color='D1D5DB' size={25} />
                            {fileName ? `${fileName}` : 'No file chosen'}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} disabled={loading} />
                    </label>
                </div>
            </div>

            {/* Current Searches */}
            {
                !loading && results.length > 0 ? (
                    <>
                        <div className='w-[70%] flex flex-col justify-start items-start gap-2'>
                            <h1 className='w-full text-start font-semibold text-xl'>
                                Search Results
                            </h1>
                            <div className='w-full h-full overflow-x-hidden overflow-y-scroll flex flex-col justify-start items-start gap-2'>
                                {results.length > 0 ? (
                                    <>
                                        {results.map((user, index) => {
                                            let UserImage;
                                            if (user?.image?.uri) {
                                                UserImage = user?.image?.uri;
                                            } else {
                                                if (user?.profile_pic_url) {
                                                    UserImage = user?.profile_pic_url;
                                                } else {
                                                    const parts = user.image.split(",");
                                                    if (parts.length > 2) {
                                                        UserImage = parts[0] + "," + parts[parts.length - 1];
                                                    }
                                                }
                                            }
                                            return (
                                                <div
                                                    key={index}
                                                    className='w-full h-12 flex justify-between items-center my-1'
                                                >
                                                    <div className='w-1/2 h-full flex justify-start items-center gap-5'>
                                                        <Image
                                                            src={UserImage}
                                                            alt="profile_pic"
                                                            width={50}
                                                            height={50}
                                                            className="rounded-full overflow-hidden"
                                                        />
                                                        <div className='w-[20vw] flex flex-col justify-center items-start'>
                                                            <h1 className='text-start font-semibold'>
                                                                {user?.name || user.full_name || ''}
                                                            </h1>
                                                            <p className='text-start text-neutral-500 flex justify-start items-center gap-1'>
                                                                rank {index + 1}, type {user?.image ? <FaFacebookSquare size={20} /> : <FaInstagramSquare size={20} />}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='w-1/2 h-full flex justify-end items-center mr-5'>
                                                        <button
                                                            onClick={() => {
                                                                const url = user?.profile_url || (user?.username ? `https://www.instagram.com/${user.username}` : user?.url);
                                                                if (url) {
                                                                    window.open(url, "_blank");
                                                                } else {
                                                                    console.error("No valid URL found for user.");
                                                                }
                                                            }}
                                                            className='py-1 px-5 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-md hover:opacity-90 text-sm font-semibold'
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
                                        <div className='w-full flex justify-center items-center text-center py-2 italic'>
                                            No search results!
                                        </div>
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
                                            let UserImage;
                                            if (user?.image?.uri) {
                                                UserImage = user?.image?.uri;
                                            } else {
                                                if (user?.profile_pic_url) {
                                                    UserImage = user?.profile_pic_url;
                                                } else {
                                                    const parts = user.image.split(",");
                                                    if (parts.length > 2) {
                                                        UserImage = parts[0] + "," + parts[parts.length - 1];
                                                    }
                                                }
                                            }
                                            return (
                                                <div
                                                    key={index}
                                                    className='w-full h-12 flex justify-between items-center my-1'
                                                >
                                                    <div className='w-1/2 h-full flex justify-start items-center gap-5'>
                                                        <Image
                                                            src={UserImage}
                                                            alt="profile_pic"
                                                            width={50}
                                                            height={50}
                                                            className="rounded-full overflow-hidden"
                                                        />
                                                        <div className='w-[20vw] flex flex-col justify-center items-start'>
                                                            <h1 className='text-start font-semibold'>
                                                                {user?.name || user.full_name || ''}
                                                            </h1>
                                                            <p className='text-start text-neutral-500'>
                                                                rank {index + 1}, type {user?.image ? <FaFacebookSquare /> : <FaInstagramSquare />}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='w-1/2 h-full flex justify-end items-center mr-5'>
                                                        <button
                                                            onClick={() => {
                                                                const url = user?.profile_url || (user?.username ? `https://www.instagram.com/${user.username}` : user?.url);
                                                                if (url) {
                                                                    window.open(url, "_blank");
                                                                } else {
                                                                    console.error("No valid URL found for user.");
                                                                }
                                                            }}
                                                            className='py-1 px-5 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-md hover:opacity-90 text-sm font-semibold'
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
                    </>
                ) : (
                    <>
                        {loading && (
                            <div>
                                <ClipLoader size={60} color="#2DD4BF" />
                            </div>
                        )}
                    </>
                )
            }
            <Footer />
        </div >
    )
}

export default SearchPeoplePage;
