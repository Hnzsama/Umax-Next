'use client'

import axios from "axios"
import { useState,useEffect, useRef, useContext, useCallback } from "react"
import { AdminDashboardContext } from "@/app/[locale]/admin-dashboard/page"
import Swal from "sweetalert2"
import { useDownloadExcel } from "react-export-table-to-excel"
import jsPDF from "jspdf"
import 'jspdf-autotable'
import { IconContext } from "react-icons"
import { AiOutlineFilePdf } from "react-icons/ai"
import { FaFileExcel, FaTable, FaTrash } from "react-icons/fa"
import { FaPlus } from "react-icons/fa"
import { FaTimes } from "react-icons/fa"
import { IoMdEye } from "react-icons/io"
import { IoMdEyeOff } from "react-icons/io"
import { RiFileExcel2Fill, RiFileExcel2Line, RiIdCardLine } from "react-icons/ri"
import CountCard from "../CountCard"
import { BiPlus } from "react-icons/bi"
import { useTranslations } from "next-intl"
export default function AccountTable() {

    const [account, setaccount] = useState([])
    const [accountMemo, setaccountMemo] = useState([])
    const [EditaccountId, setEditaccountId] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dataPerPage, setDataPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [selectLoading, setSelectLoading] = useState(true)
    const passwordInput = useRef(null)
    const passwordverifyInput = useRef(null)
    const t = useTranslations('admin-accounts')
    const tfile = useTranslations('swal-file')
    const tdel = useTranslations('swal-delete')

    function handleShowPassword() {
        setShowPassword(!showPassword)
    }   

    const {sidebarHide, setSidebarHide, updateCard, setUpdateCard, changeTable, setChangeTable,  userData, dataDashboard} = useContext(AdminDashboardContext)

    const addModal = useRef(null)
    const [modeModal, setModeModal] = useState("add")

    // validasi form
    const [values, setValues] = useState({
        name: '', 
        email: '', 
        password: '', 
        passwordverify: '', 
        client: '', 
        platform: ''
    });

    const [error, setError] = useState({
        name: '',
        email: '',
        password: '',
        passwordverify: '',
        client: '',
        platform: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        passwordverify: false,
        client: false,
        platform: false,
    });

    const [isvalid, setIsvalid] = useState(false);

    // Form Validation
    const validateForm = useCallback(() => {
        let errors = {};
        
        if (touched.name && values.name === '') {
            errors.name = t('name-error');
        }
        
        if (touched.email && !values.email.includes("@")) {
            errors.email = t('email-error2');
        }
        
        if (touched.email && values.email === '') {
            errors.email = t('email-error');
        }
        
        if (touched.password && values.password !== values.passwordverify) {
            errors.password = t('password-error2');
            errors.passwordverify = t('password-error2');
        }
        
        if (touched.password && values.password === '') {
            errors.password = t('password-error');
        }
        
        if (touched.passwordverify && values.passwordverify === '') {
            errors.passwordverify = t('confirm-error');
        }
        
        if (touched.client && values.client === '') {
            errors.client = t('client-error');
        }
        
        if (touched.platform && values.platform === '') {
            errors.platform = t('platform-error');
        }
        
        setError(errors);
        setIsvalid(Object.keys(errors).length === 0);
    }, [values, touched, t]);

    useEffect(() => {
        validateForm();
    }, [values, touched, validateForm]);

    // Handle input change and touch
    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
        validateForm();
    };

    function showModal(mode, account_id = null ){
        document.body.style.overflow = 'hidden'
        setModeModal(mode)
        if(mode == "Edit"){
            const filteredaccount = account.filter(account => account._id === account_id);
            if(filteredaccount.length > 0){
                // console.log(filteredCampaing[0])
                setEditaccountId(account_id)
                setValues({name: filteredaccount[0].username, email: filteredaccount[0].email, client: filteredaccount[0].client_id, platform: filteredaccount[0].platform})
                setError({name: '', email: '', client:'', platform: ''})
                document.getElementById('name').value = filteredaccount[0].username
                document.getElementById('client').value = filteredaccount[0].client_id
                document.getElementById('platform').value = filteredaccount[0].platform
                document.getElementById('email').value = filteredaccount[0].email
                document.getElementById('status').checked = filteredaccount[0].status == 1 ? true : false
                passwordInput.current.classList.add("hidden")
                passwordverifyInput.current.classList.add("hidden")
                if(filteredaccount[0].notes == "empty"){
                    document.getElementById("notes").value = ""
                }else{
                    document.getElementById('notes').value = filteredaccount[0].notes 
                }
            } else{
                Swal.fire("Campaing not found");
            }
        }else if(mode == "Create") {
            setValues({name: "", email: "", password: "", passwordverify: "", client: "", platform: ""})
            setError({name: '', email: '', password: '', passwordverify: '', client: '', platform: ''})
            document.getElementById('name').value = null
            document.getElementById('email').value = null
            document.getElementById('password').value = null
            document.getElementById('passwordverify').value = null
            document.getElementById("client").value = ""
            document.getElementById("platform").value = ""
            passwordInput.current.classList.remove("hidden")
            passwordverifyInput.current.classList.remove("hidden")
            document.getElementById('notes').value = ""
        }
        addModal.current.classList.remove("hidden")
    }
    function closeModal() {
        document.body.style.overflow = 'auto'
        // Reset input values, errors, and touched states
        setValues({
            name: '', 
            email: '', 
            password: '', 
            passwordverify: '', 
            client: '', 
            platform: ''
        });
        setError({
            name: '',
            email: '',
            password: '',
            passwordverify: '',
            client: '',
            platform: '',
        });
        setTouched({
            name: false,
            email: false,
            password: false,
            passwordverify: false,
            client: false,
            platform: false,
        });
    
        // Close the modal
        addModal.current.classList.add("hidden");
    }
    
    
    function handleDelete(account_id){
        Swal.fire({
            title: tdel('warn'),
            text: tdel('msg'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: tdel('yes'),
            cancelButtonText: tdel('no'),
          }).then((result) => {
            if (result.isConfirmed) {
            deleteaccount(account_id)
            Swal.fire({
                title: tdel('success'),
                text: tdel('suc-msg'),
                icon: "success"
            })
            }
          });
    }

    const deleteaccount = async (account_id) => {
        closeModal()
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/account-delete?account_id=${account_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            })
            getaccount()
            setUpdateCard(true)
            
        } catch (error) {
            console.log(error)
        }
    }

    const tableRef = useRef(null);

    function generateExcel(){
        Swal.fire({
            title: `${tfile('warn')}`,
            text: `${tfile('msg2')}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `${tfile('yes')}`,
            cancelButtonText: `${tfile('no')}`
          }).then((result) => {
            if (result.isConfirmed) {
                onDownload();
              Swal.fire({
                title: `${tfile('success')}`,
                text: `${tfile('suc-msg')}`,
                icon: "success"
              });
            }
          });
    }

    const { onDownload } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: "Dataaccount",
        sheet: "Dataaccount",
      });

    const generatePDF = () => {
        Swal.fire({
            title: `${tfile('warn')}`,
            text: `${tfile('msg1')}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `${tfile('yes')}`,
            cancelButtonText: `${tfile('no')}`
          }).then((result) => {
            if (result.isConfirmed) {
                const doc = new jsPDF();
                doc.text('Data Account Umax Dashboard', 10, 10);
                doc.autoTable({
                    head: [['Name', 'Client', 'Platorm', "Email", "Status", "Notes", "Company"]],
                    body: account.map((account) => [account.username, account.client_name, account.platform, account.email, account.status, account.notes, account.company_name]),
                });
                doc.save('DataAccount.pdf');
              Swal.fire({
                title: `${tfile('success')}`,
                text: `${tfile('suc-msg')}`,
                icon: "success"
              });
            }
          });
    };

    function handleDetail(account_id){
        const filteredaccount = account.filter(account => account._id === account_id);
        if(filteredaccount.length > 0) {
            const [account] = filteredaccount;
            Swal.fire(`<p>
                ${account.username}\n ${account.client_name} \n ${account.platform}\n ${account.email}\n ${account.status}
                </p>`);
        } else {
            Swal.fire("account not found");
        }
    }

    async function getaccount(){
        setIsLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/account-by-tenant`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        })
        setaccount(response.data.Data)
        setaccountMemo(response.data.Data)
        setIsLoading(false)
    }

    useEffect(() => {
        getaccount()
    }, [])

    useEffect(() => {
    }, [account])

    async function createAccount(){
        if(isvalid){
            const name = document.getElementById('name').value
            const client = document.getElementById('client').value
            const email = document.getElementById('email').value
            const platform = document.getElementById('platform').value
            const password = document.getElementById('password').value
            const passwordverify = document.getElementById('passwordverify').value
            const status = document.getElementById('status').checked ? 1 : 2
            const tenant_id = document.getElementById('tenant').value
            let notes = document.getElementById('notes').value
            if(notes == ""){
                notes = "empty"
            }

            const formData = new FormData();
            formData.append('username', name);
            formData.append('client_id', client);
            formData.append('email', email);
            formData.append('platform', platform);
            formData.append('password', password);
            formData.append('confirm_password', passwordverify);
            formData.append('status', status);
            formData.append('notes', notes);
    
            let url = ""
    
            if(userData.roles == "sadmin"){
                url = `${process.env.NEXT_PUBLIC_API_URL}/account-create?tenantId=${tenant_id}`
            }else if(userData.roles == "admin"){
                url = `${process.env.NEXT_PUBLIC_API_URL}/account-create`
            }
    
            const response = await axios.post(url, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            })
    
            if(response.data.Output == "Create Account Successfully"){
                getaccount()
                closeModal()
                setUpdateCard(true)
                document.getElementById('name').value = null
                document.getElementById('email').value = null
                document.getElementById('password').value = null
                document.getElementById('passwordverify').value = null
                document.getElementById('notes').value = null
                Swal.fire("Success", "Account created successfully", "success")
            }else{
                Swal.fire("Error", response.detail, "error")
            }
        }else{
            Swal.fire({
                title: "Failed!",
                text: "Please Fill The Blank!",
                icon: "error"
              });
        }
    }

    async function updateAccount(){
        if(EditaccountId !== null) {
            if(isvalid){
                const name = document.getElementById('name').value
                const client = document.getElementById('client').value
                const email = document.getElementById('email').value
                const platform = document.getElementById('platform').value
                const password = document.getElementById('password').value
                const passwordverify = document.getElementById('passwordverify').value
                const status = document.getElementById('status').checked ? 1 : 2
                let notes = document.getElementById('notes').value
                if(notes == ""){
                    notes = "empty"
                }

                const formData = new FormData();
                formData.append('username', name);
                formData.append('client_id', client);
                formData.append('email', email);
                formData.append('platform', platform);
                formData.append('password', password);
                formData.append('confirm_password', passwordverify);
                formData.append('status', status);
                formData.append('notes', notes);
            
                    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/account-edit?account_id=${EditaccountId}`, formData, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        }
                    })
            
                    if(response.data.Output == "Data Updated Successfully"){
                        getaccount()
                        closeModal()
                        document.getElementById('name').value = null
                        document.getElementById('email').value = null
                        document.getElementById('password').value = null
                        document.getElementById('passwordverify').value = null
                        document.getElementById('notes').value = null
                        Swal.fire("Success", "Campaing Updated", "success")
                    }else{
                        Swal.fire("Error", response.detail.ErrMsg, "error")
                    }
            }else{
                Swal.fire({
                    title: "Failed!",
                    text: "Please Fill The Blank!",
                    icon: "error"
                  });
            
            }
        }
    }


    const [timezone, setTimezone] = useState([])
    const [currency, setCurrency] = useState([])
    const [culture, setCulture] = useState([])
    const [client, setClient] = useState([])
    const [tenant, setTenant] = useState([])

    async function getSelectFrontend(){
        setSelectLoading(true)
        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/timezone`).then((response) => {
            setTimezone(response.data)
        })

        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/currency`).then((response) => {
            setCurrency(response.data)
        })

        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/culture`).then((response) => {
            setCulture(response.data)
        })

        await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client-by-tenant`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        }).then((response) => {
            setClient(response.data.Data)
        })
        if(userData.roles ==  "sadmin"){
            await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant-get-all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            }).then((response) => {
                setTenant(response.data.Data)
            })
        }
        setSelectLoading(false)
    }

    const tenantInput = useRef(null)

    useEffect(() => {
        getSelectFrontend()
        if(userData.roles == "sadmin"){
            tenantInput.current.classList.remove("hidden")
        }
        if(userData.roles == "admin"){
            tenantInput.current.classList.add("hidden")
        }
    }, [])

    const handlePlatformChange = (event) => {
        setSelectedPlatform(event.target.value);
    };

    function LoadingCircle() {
        return (
          <div className="flex justify-center items-center h-20">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-[#1C2434] dark:border-white rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
            </div>
          </div>
        );
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredData = account.filter((data) => {
        return (
            (!selectedPlatform || data.platform === Number(selectedPlatform)) &&
            (!selectedStatus || data.status === Number(selectedStatus)) &&
            (!searchTerm ||
                data.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });


    // Calculate total number of pages
    const totalPages = Math.ceil(filteredData.length / dataPerPage);

    // Function to change current page
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pageButtons = [];
        const maxButtons = 3; // Maximum number of buttons to show
    
        // First page button
        pageButtons.push(
            <button
                key="first"
                className={`px-1 sm:px-3 md:px-3 lg:px-3 xl:px-3 py-1 dark:text-white ${
                    currentPage === 1 ? "cursor-not-allowed" : ""
                } rounded-md`}
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
            >
                {'<<'}
            </button>
        );
    
        // Previous page button
        pageButtons.push(
            <button
                key="prev"
                className={`px-1 sm:px-3 md:px-3 lg:px-3 xl:px-3 py-1 dark:text-white ${
                    currentPage === 1 ? "cursor-not-allowed" : ""
                } rounded-md`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                {'<'}
            </button>
        );
    
        // Info page
        pageButtons.push(
            <span key="info" className="px-1 sm:px-3 md:px-3 lg:px-3 xl:px-3 py-1 dark:text-white rounded-md">
                {`${t('page')} ${currentPage} / ${totalPages}`}
            </span>
        );
    
        // Next page button
        pageButtons.push(
            <button
                key="next"
                className={`px-1 sm:px-3 md:px-3 lg:px-3 xl:px-3 py-1 dark:text-white ${
                    currentPage === totalPages ? "cursor-not-allowed" : ""
                } rounded-md`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                {'>'}
            </button>
        );
    
        // Last page button
        pageButtons.push(
            <button
                key="last"
                className={`px-1 sm:px-3 md:px-3 lg:px-3 xl:px-3 py-1 dark:text-white ${
                    currentPage === totalPages ? "cursor-not-allowed" : ""
                } rounded-md`}
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
            >
                {'>>'}
            </button>
        );
    
        return (
            <div className="flex justify-center gap-2 mt-4">
                {pageButtons}
            </div>
        );
    };
       
    const indexOfLastaccount = currentPage * dataPerPage;
    const indexOfFirstaccount = indexOfLastaccount - dataPerPage;
    const currentaccounts = filteredData.slice(indexOfFirstaccount, indexOfLastaccount);

    return (
        <>
            <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold uppercase flex dark:text-white gap-2"><RiIdCardLine size={35}/> {t('title')}</h1>
                    <p className="dark:text-white"><a className="hover:cursor-pointer dark:text-white hover:text-blue-400 hover:underline" href="#" onClick={() => setChangeTable("dashboard")}>{t('dashboard')}</a>  / {t('accounts')}</p>
                </div>

                <div className="w-full h-fit mb-5 rounded-md shadow-md">
                    {/* Header */}
                    <div className="w-full h-12 bg-[#3c50e0] flex items-center rounded-t-md">
                        <h1 className="flex gap-2 p-4 items-center text">
                            <FaTable  className="text-blue-200" size={18}/>
                        </h1>
                    </div>
                    {/* Header end */}

                    {/* Body */}
                    <div className="w-full h-fit bg-white dark:bg-slate-800  rounded-b-md p-4">
                        <div className=" flex flex-col-reverse md:flex-row justify-between items-center w-full ">
                            <div className="flex">
                                {/* Button */}
                                <button className="bg-white dark:bg-slate-800 dark:text-white mb-4 border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-slate-500 font-bold px-3 rounded-s-md" onClick={generatePDF}>
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <AiOutlineFilePdf />
                                    </IconContext.Provider>
                                </button>
                                <button className="bg-white mb-4 dark:bg-slate-800 dark:text-white border-b border-t border-e dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-slate-500 font-bold px-3" onClick={generateExcel}>
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <RiFileExcel2Line />
                                    </IconContext.Provider>
                                </button>
                                <button className="bg-white mb-4 dark:bg-slate-800 dark:text-white border-b border-t border-e dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-slate-500 font-bold px-3 " onClick={() => showModal("Create")} >
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <BiPlus className="text-thin"/>
                                    </IconContext.Provider>
                                </button>
                                {/* Button end */}

                                {/* Filter by select */}
                                <div className="mb-4">
                                    <label htmlFor="rolefilter" className="text-sm font-medium  hidden">Role</label>
                                    <select id="rolefilter" className="md:w-[150px] h-10 bg-white dark:bg-slate-800 dark:text-white border-b border-t border-e dark:border-gray-500  text-sm block w-full px-3 py-2 select-no-arrow" defaultValue={0}
                                    value={selectedStatus} onChange={handleStatusChange}
                                    >
                                        <option value="" hidden disabled>Status</option>
                                        <option value="">{t('all-status')}</option>
                                        <option value="1">{t('active')}</option>
                                        <option value="2">{t('deactive')}</option>
                                    </select>  
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="rolefilter" className="text-sm font-medium  hidden">Role</label>
                                    <select id="rolefilter" className="md:w-[150px] h-10 bg-white dark:bg-slate-800 dark:text-white border-b border-t border-e dark:border-gray-500 rounded-e-md  text-sm block w-full px-3 py-2 select-no-arrow" defaultValue={0}
                                        value={selectedPlatform}
                                        onChange={handlePlatformChange}
                                    >
                                        <option value="" disabled hidden>Platform</option>
                                        <option value="">{t('all-platform')}</option>
                                        <option value="1">Meta Ads</option>
                                        <option value="2">Google Ads</option>
                                        <option value="3">Tiktok Ads</option>
                                    </select>  
                                </div>
                                {/* Filter by select end */}
                            </div>

                            {/* Search */}
                            <div className="flex gap-5">
                                <div className="relative mb-4">
                                    <label htmlFor="search" className="hidden"></label>
                                    <input type="text" id="search" name="search" className="w-full px-4 py-2 dark:bg-slate-800 dark:text-white border dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t('search')}
                                    defaultValue="" 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </span>
                                </div>
                            </div>
                            {/* Search */}
                        </div>

                        <div className="bg-white h-fit overflow-auto">
                            <table className="w-full text-sm text-left" ref={tableRef}>
                                <thead className="text-md text-left uppercase bg-white dark:bg-slate-700 dark:text-white">
                                    <tr>
                                        <th scope="col" className="px-5 border dark:border-gray-500 py-3">{t('username')}</th>
                                        <th scope="col" className="px-5 border dark:border-gray-500 py-3">{t('client')}</th>
                                        <th scope="col" className="px-5 border dark:border-gray-500 py-3">Platform</th>
                                        <th scope="col" className="px-5 border dark:border-gray-500 py-3">Email</th>
                                        <th scope="col" className="px-5 border dark:border-gray-500 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 dark:text-white">
                                    {
                                        isLoading ? (
                                            // Jika data sedang loading
                                            <tr className="text-center py-3 border dark:border-gray-500">
                                                <td colSpan={8}>
                                                    <LoadingCircle />
                                                </td>
                                            </tr>
                                        ) : (
                                            currentaccounts.length > 0 ? (
                                                // Jika data ditemukan
                                                currentaccounts.map((account, index) => (
                                                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-slate-400 hover:cursor-pointer dark:odd:bg-slate-600 dark:even:bg-slate-700 transition-colors duration-300">
                                                        <td scope="row" className="px-5 border dark:border-gray-500 py-3 dark:text-white whitespace-nowrap underline font-semibold" title="Click to edit" onClick={() => showModal("Edit", account._id)}>{account.username}</td>
                                                        <td scope="row" className="px-5 border dark:border-gray-500 py-3 font-medium dark:text-white whitespace-nowrap">{account.client_name}</td>
                                                        <td scope="row" className="px-5 border dark:border-gray-500 py-3 font-medium dark:text-white whitespace-nowrap">{account.platform == 1 ? "Meta Ads" : account.platform == 2 ? "Google Ads" : "Tiktok Ads"}</td>
                                                        <td scope="row" className="px-5 border dark:border-gray-500 py-3 font-medium dark:text-white whitespace-nowrap"><a href={`mailto:${account.email}`} className="text-blue-500 dark:text-blue-300">{account.email}</a></td>
                                                        <td scope="row" className="px-5 border dark:border-gray-500 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{account.status == 1 ? t('active') : t('deactive')}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                // Jika tidak ada data setelah loading
                                                <tr className="text-center border dark:border-gray-500">
                                                    <td colSpan={8} className="py-4">
                                                        {t('not-found')}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-center sm:justify-end md:justify-end lg:justify-end xl:justify-end items-center">
                                {renderPagination()}
                        </div>
                    </div>
                    {/* Body end */}

                </div>
                {/* Main Card end */}
            </div>

            {/* <!-- Main modal --> */}
            <div id="crud-modal" ref={addModal} className="fixed inset-0 dark:text-white flex hidden items-center justify-center bg-gray-500 bg-opacity-75 z-50">

                <div className="relative p-4 w-full max-w-2xl max-h-full ">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white dark:bg-[#243040] rounded-[3px] shadow max-h-[100vh] overflow-auto pb-3">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t bg-white dark:bg-[#243040] dark:border-[#314051] text-black dark:text-white">
                            <h3 className="text-2xl font-semibold">
                                {`${modeModal} ${t('accounts')}`}
                            </h3>
                            <button type="button" className="text-xl bg-transparent w-8 h-8 ms-auto inline-flex justify-center items-center " data-modal-toggle="crud-modal" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div className="p-4 md:p-5">
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                <div className="col-span-2">
                                    <label htmlFor="name" className="flex mb-2 text-sm font-normal font-sans">{t('account_name')} <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div> </label>
                                    <input type="text" name="name" id="name" className="bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-[#3c54d9] focus:border-[#3c54d9] outline-none block w-full p-2.5 " placeholder={t('holder-name')}
                                    required onChange={handleChange} onBlur={handleBlur}/>
                                    {
                                        touched.name && error.name ? <p className="text-red-500 dark:text-red-600 text-sm">{error.name}</p> : ""
                                    }
                                </div>
                                <div className={`${userData.roles == "sadmin" ? "col-span-1" : "col-span-2"}`}>
                                    <label htmlFor="email" className="flex mb-2 text-sm font-normal">Email <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div></label>
                                    <input type="email" name="email" id="email" className="bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96] text-sm rounded-[3px] focus:ring-[#3c54d9] focus:border-[#3c54d9] outline-none block w-full p-3" placeholder={t('holder-email')} required onChange={handleChange} onBlur={handleBlur}/>
                                    {
                                        touched.email && error.email ? <p className="text-red-500 dark:text-red-600 text-sm">{error.email}</p> : ""
                                    }
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="client" className="flex mb-2 text-sm font-normal ">{t('client')} <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div> </label>
                                    <select id="client" name="client" className={`bg-white ${values.client ? "text-white" : "text-[#858c96]"} dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-primary-500 focus:border-[#3c54d9] outline-none block w-full p-2.5`} defaultValue={""} onChange={handleChange} onBlur={handleBlur}>
                                        <option value="" disabled hidden>{t('select-client')}</option>
                                        {
                                            selectLoading ? (
                                                // Jika data sedang loading
                                                <option disabled key={0} value={0}>Loading clients list...</option>
                                            ) : client.length > 0 ? (
                                                // Jika data ditemukan
                                                client.map((client, index) => (
                                                    <option key={index} value={client._id}>{client.name}</option>
                                                ))
                                            ) : (
                                                // Jika tidak ada data
                                                <option disabled key={0} value={0}>No clients found</option>
                                            )
                                        }
                                    </select>
                                    {
                                        touched.client && error.client ? <p className="text-red-500 dark:text-red-600 text-sm">{error.client}</p> : ""
                                    }
                                </div>

                                <div className="col-span-1" ref={tenantInput}>
                                    <label htmlFor="tenant" className="block mb-2 text-sm font-normal ">Tenant</label>
                                    <select id="tenant" className="bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-primary-500 focus:border-[#3c54d9] outline-none block w-full p-2.5  ">
                                        {
                                            tenant.length > 0 ? tenant.map((tenant, index) => {
                                                return <option key={index} value={tenant._id}>{tenant.company}</option>
                                            }) : <option key={0} value={0}>Loading...</option>
                                        }
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="platform" className="flex mb-2 text-sm font-normal ">Platform <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div> </label>
                                    <select id="platform" name="platform" className={`bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-primary-500 focus:border-[#3c54d9] outline-none block w-full p-2.5 ${values.platform ? "text-white" : "text-[#858c96]"}`} defaultValue={""} onChange={handleChange} onBlur={handleBlur}>
                                        <option value="" disabled hidden className="">{t('select-platform')}</option>
                                        <option value="1">Meta Ads</option>z
                                        <option value="2">Google Ads</option>
                                        <option value="3">Tiktok Ads</option>
                                    </select>
                                    {
                                        touched.platform && error.platform ? <p className="text-red-500 dark:text-red-600 text-sm">{error.platform}</p> : ""
                                    }
                                </div>
                                <div className="col-span-2 md:col-span-1" ref={passwordInput}>
                                    <label htmlFor="password" className="flex mb-2 text-sm font-normal  ">Password <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div></label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" id="password" className="bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-[#3c54d9] focus:border-[#3c54d9] outline-none block w-full p-2.5 " placeholder={t('holder-password')} required onChange={handleChange} onBlur={handleBlur}/>
                                        <button onClick={handleShowPassword} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" type="button">
                                            {showPassword ? <IoMdEye/> : <IoMdEyeOff/>}
                                        </button>
                                    </div>
                                    {
                                        touched.password && error.password ? <p className="text-red-500 dark:text-red-600 text-sm">{error.password}</p> : ""
                                    }
                                </div>
                                <div className="col-span-2 md:col-span-1" ref={passwordverifyInput}>
                                    <label htmlFor="passwordverify" className="flex mb-2 text-sm font-normal  ">{t('confirm_password')} <div className="text-red-500 dark:text-red-600 ml-[1.5px]">*</div></label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="passwordverify" id="passwordverify" className="bg-white dark:bg-[#1d2a3a] border border-gray-200 dark:border-[#314051] placeholder-[#858c96]  text-sm rounded-[3px] focus:ring-[#3c54d9] focus:border-[#3c54d9] outline-none block w-full p-2.5 " placeholder={t('holder-confirm')} required onChange={handleChange} onBlur={handleBlur}/>
                                        <button onClick={handleShowPassword} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" type="button">
                                            {showPassword ? <IoMdEye/> : <IoMdEyeOff/>}
                                        </button>
                                    </div>
                                    {
                                        touched.passwordverify && error.passwordverify ? <p className="text-red-500 dark:text-red-600 text-sm">{error.passwordverify}</p> : ""
                                    }
                                </div>

                                <div className="col-span-2">
                                    <label htmlFor="notes" className="mb-2 text-sm font-normal">Notes</label>
                                    <textarea id="notes" name="notes" className="bg-white border dark:bg-[#1d2a3a] dark:border-[#314051] placeholder-[#858c96] border-gray-200 text-sm rounded-[3px] focus:ring-[#3c54d9] focus:border-[#3c54d9] outline-none block w-full p-2.5" placeholder="Enter notes here" onChange={handleChange} onBlur={handleBlur}></textarea>
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="status" className="flex flex-col md:flex-row gap-2 items-center cursor-pointer">
                                        <input type="checkbox" value="" id="status" name="status" className="sr-only peer"/>
                                        <span className="text-sm font-normal ">Status</span>
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 dark:border-none after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#3b50df]"></div>
                                    </label>
                                </div>

                            </div>
                                {
                                    modeModal === 'Edit' ? (
                                        <div className="flex gap-3">
                                            <button className="w-full bg-[#3b50df] hover:bg-blue-600 border border-indigo-700 text-white py-2 px-4 rounded text-nowrap" onClick={updateAccount}>
                                                {t('save')}
                                            </button>
                                            <button className="w-full bg-indigo-700 hover:bg-indigo-600 border border-indigo-800 text-white py-2 px-4 rounded text-nowrap" onClick={() => handleDelete(EditaccountId)}>
                                                {t('delete')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="w-full bg-[#3b50df] hover:bg-blue-700 border border-indigo-700 mt-5 text-white py-2 px-4 rounded-[3px]" onClick={createAccount}>
                                            {t('submit')}
                                        </button>
                                    )
                                    
                                }
                        </div>
                    </div>
                </div>
            </div> 
                                        
        </>
    )
}