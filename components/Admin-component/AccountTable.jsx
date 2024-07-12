'use client'

import axios from "axios"
import { useState,useEffect, useRef, useContext } from "react"
import { AdminDashboardContext } from "@/app/admin-dashboard/page"
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
import CountCard from "./CountCard"
import { BiPlus } from "react-icons/bi"
export default function AccountTable() {

    const [account, setaccount] = useState([])
    const [accountMemo, setaccountMemo] = useState([])
    const [EditaccountId, setEditaccountId] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const passwordInput = useRef(null)
    const passwordverifyInput = useRef(null)

    function handleShowPassword() {
        setShowPassword(!showPassword)
    }   

    const {sidebarHide, setSidebarHide, updateCard, setUpdateCard, changeTable, setChangeTable,  userData, dataDashboard} = useContext(AdminDashboardContext)

    const addModal = useRef(null)
    const [modeModal, setModeModal] = useState("add")

    // validasi form
    const [values, setValues] = useState({name: '', email: '', password: '', passwordverify: '', client:'', platform:  ''})
    const [error, setError] = useState({
        name: '',
        email: '',
        password: '',
        passwordverify: '',
        client : '',
        platform: '',
    })
    const [isvalid, setIsvalid] = useState(false)

    function validateForm(){
        let errors = {}
        if(values.name == ''){
            errors.name = 'Username is required'
        }
        if(!values.email.includes("@")){
            errors.email = "Email must contain @"
        }
        if(values.email == ''){
            errors.email = 'Email is required'
        }
        if(values.password != values.passwordverify){
            errors.password = 'Password not match'
            errors.passwordverify = 'Password not match'
        }
        if(values.password == ''){
            errors.password = 'Password is required'
        }
        if(values.passwordverify == ''){
            errors.passwordverify = 'Password verify is required'
        }   
        if(values.client == ''){
            errors.client = 'Client is required'
        }
        if(values.platform == ''){
            errors.platform = 'Platform is required'    
        }
        setError(errors)
        setIsvalid(Object.keys(errors).length === 0)
    }

    useEffect(() => {
        validateForm()
    }, [values])


    function showModal(mode, account_id = null ){
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
        }
        addModal.current.classList.remove("hidden")
    }
    function closeModal(){
        addModal.current.classList.add("hidden")
    }
    
    function handleDelete(account_id){
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          }).then((result) => {
            if (result.isConfirmed) {
            deleteaccount(account_id)
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            })
            }
          });
    }

    const deleteaccount = async (account_id) => {
        closeModal()
        try {
            const response = await axios.delete(`https://umaxxxxx-1-r8435045.deta.app/account-delete?account_id=${account_id}`, {
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
            title: "Are you sure?",
            text: "Are you sure want to download excel file?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, download it!"
          }).then((result) => {
            if (result.isConfirmed) {
                const backupLastPage = lastPage;
                const backupFirstPage = firstPage;
                setFirstPage(0);
                setLastPage(account.length);
                setTimeout(() => {
                    onDownload();
                    setFirstPage(backupFirstPage);
                    setLastPage(backupLastPage);
                }, 100);
              Swal.fire({
                title: "Downloaded!",
                text: "Your file has been downloaded.",
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
            title: "Are you sure?",
            text: "Are you sure want to download pdf file?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, download it!"
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
                title: "Downloaded!",
                text: "Your file has been downloaded.",
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
        const response = await axios.get('https://umaxxxxx-1-r8435045.deta.app/account-by-tenant', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        })
        setaccount(response.data.Data)
        setaccountMemo(response.data.Data)
        setTotalPages(Math.ceil(account.length / itemsPerPage));
        setFirstPage(0);
        setLastPage(itemsPerPage);
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

            const formData = new FormData();
            formData.append('username', name);
            formData.append('client_id', client);
            formData.append('email', email);
            formData.append('platform', platform);
            formData.append('password', password);
            formData.append('confirm_password', passwordverify);
            formData.append('status', status);
            formData.append('notes', "notes");
    
            let url = ""
    
            if(userData.roles == "sadmin"){
                url = `https://umaxxxxx-1-r8435045.deta.app/account-create?tenantId=${tenant_id}`
            }else if(userData.roles == "admin"){
                url = `https://umaxxxxx-1-r8435045.deta.app/account-create`
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

                const formData = new FormData();
                formData.append('name', name);
                formData.append('client', client);
                formData.append('email', email);
                formData.append('platform', platform);
                formData.append('password', password);
                formData.append('confirm_password', passwordverify);
                formData.append('status', status);
                formData.append('notes', "notes");
            
                    const response = await axios.put(`https://umaxxxxx-1-r8435045.deta.app/account-edit?account_id=${EditaccountId}`, formData, {
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
        await axios.get('https://umaxxxxx-1-r8435045.deta.app/timezone').then((response) => {
            setTimezone(response.data)
        })

        await axios.get('https://umaxxxxx-1-r8435045.deta.app/currency').then((response) => {
            setCurrency(response.data)
        })

        await axios.get('https://umaxxxxx-1-r8435045.deta.app/culture').then((response) => {
            setCulture(response.data)
        })

        await axios.get('https://umaxxxxx-1-r8435045.deta.app/client-by-tenant', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            }
        }).then((response) => {
            setClient(response.data.Data)
        })
        if(userData.roles ==  "sadmin"){
            await axios.get('https://umaxxxxx-1-r8435045.deta.app/tenant-get-all', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                }
            }).then((response) => {
                setTenant(response.data.Data)
            })
        }

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


    // Pagination

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [firstPage, setFirstPage] = useState(0);
    const [lastPage, setLastPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
        setTotalPages(Math.ceil(account.length / itemsPerPage));
        setFirstPage(0);
        setLastPage(itemsPerPage);
    }, [account, itemsPerPage]);

    const firstPageButton = useRef(null);
    const previousButton = useRef(null);
    const nextButton = useRef(null);
    const lastPageButton = useRef(null);

    useEffect(() => {
        setFirstPage((currentPage - 1) * itemsPerPage);
        setLastPage(currentPage * itemsPerPage);
        if(currentPage == 1){
            firstPageButton.current.classList.add("paginDisable");
            previousButton.current.classList.add("paginDisable");
            nextButton.current.classList.remove("paginDisable");
            lastPageButton.current.classList.remove("paginDisable");
        }else if(currentPage == totalPages){
            nextButton.current.classList.add("paginDisable");
            lastPageButton.current.classList.add("paginDisable");
            firstPageButton.current.classList.remove("paginDisable");
            previousButton.current.classList.remove("paginDisable");
        }else{
            firstPageButton.current.classList.remove("paginDisable");
            previousButton.current.classList.remove("paginDisable");
            nextButton.current.classList.remove("paginDisable");
            lastPageButton.current.classList.remove("paginDisable");
        }
    }, [currentPage]);

    function handleNextButton(){
        if(currentPage < totalPages){
            setCurrentPage(currentPage + 1);
        }
    }

    function handlePreviousButton(){
        if(currentPage > 1){
            setCurrentPage(currentPage - 1);
        }
    }

    function handleFristPageButton(){
        if(currentPage > 1){
            setCurrentPage(1);
        }
    }

    function handleLastPageButton(){
        if(currentPage < totalPages){
            setCurrentPage(totalPages);
        }
    }

    const handlePlatformChange = (event) => {
        setSelectedPlatform(event.target.value);
    };

    function LoadingCircle() {
        return (
          <div className="flex justify-center items-center h-20">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-[#1C2434] rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        );
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredData = account.filter((data) => {
        return (
            (!selectedPlatform || data.platform === Number(selectedPlatform)) &&
            (!selectedStatus || data.status === Number(selectedStatus)) &&
            (!searchTerm ||
                data.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <>
            <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                    <h1 className="text-2xl font-bold uppercase flex dark:text-white gap-2"><RiIdCardLine/> Accounts</h1>
                    <p className="dark:text-white"><a className="hover:cursor-pointer dark:text-white hover:text-blue-400 hover:underline" href="#" onClick={() => setChangeTable("dashboard")}>Dashboard</a>  / Accounts</p>
                </div>

                {/* {'Statistic Card'} */}
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-7 w-full mb-3">
                    {
                        userData.roles == "sadmin" ? <CountCard title="Tenants" value={dataDashboard.tenants ? dataDashboard.tenants : <div>Loading...</div>} handleClick={'tenants'} /> : 
                        userData.roles == "admin" ? <CountCard title="Tenants" value={userData.company_name ? userData.company_name : <div>Loading...</div>} handleClick={'company'} /> :
                        <CountCard title="Tenants" value={<div>Loading...</div>} />
                    }
                    
                    <CountCard title="Users" value={dataDashboard.users ? dataDashboard.users : <div> Loading...</div>} handleClick={'users'} />
                    <CountCard title="Campaigns" value={dataDashboard.campaigns ? dataDashboard.campaigns : <div>Loading...</div>} handleClick={'campaigns'} />
                    <CountCard title="Clients" value={dataDashboard.clients ? dataDashboard.clients : <div>Loading...</div>} handleClick={'clients'} />
                </div>
                {/* {'Statistic Card end'} */}

                <div className="w-full h-fit mb-5 rounded-md shadow-md">
                    {/* Header */}
                    <div className="w-full h-12 bg-[#3c50e0] flex items-center rounded-t-md">
                        <h1 className="flex gap-2 p-4 items-center text">
                            <FaTable  className="text-blue-200" size={18}/><p className="text-white text-md font-semibold">Account Table</p>
                        </h1>
                    </div>
                    {/* Header end */}

                    {/* Body */}
                    <div className="w-full h-fit bg-white dark:bg-slate-800  rounded-b-md p-4">
                        <div className=" flex flex-col-reverse md:flex-row justify-between items-center w-full ">
                            <div className="flex">
                                {/* Button */}
                                <button className="bg-white dark:bg-slate-800 dark:text-white mb-4 border hover:bg-gray-100 font-bold px-3 rounded-s-md" onClick={generatePDF}>
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <AiOutlineFilePdf />
                                    </IconContext.Provider>
                                </button>
                                <button className="bg-white mb-4 dark:bg-slate-800 dark:text-white border-b border-t border-e hover:bg-gray-100 font-bold px-3" onClick={generateExcel}>
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <RiFileExcel2Line />
                                    </IconContext.Provider>
                                </button>
                                <button className="bg-white mb-4 dark:bg-slate-800 dark:text-white border-b border-t border-e hover:bg-gray-100 font-bold px-3 " onClick={() => showModal("Create")} >
                                    <IconContext.Provider value={{ className: "text-xl" }}>
                                        <BiPlus className="text-thin"/>
                                    </IconContext.Provider>
                                </button>
                                {/* Button end */}

                                {/* Filter by select */}
                                <div className="mb-4">
                                    <label htmlFor="rolefilter" className="text-sm font-medium text-gray-900 hidden">Role</label>
                                    <select id="rolefilter" className="md:w-[150px] h-10 bg-white dark:bg-slate-800 dark:text-white border-b border-t border-e text-gray-900 text-sm block w-full px-3 py-2 select-no-arrow" defaultValue={0}
                                    value={selectedStatus} onChange={handleStatusChange}
                                    >
                                        <option value="">Status</option>
                                        <option value="1">Active</option>
                                        <option value="2">Inactive</option>
                                    </select>  
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="rolefilter" className="text-sm font-medium text-gray-900 hidden">Role</label>
                                    <select id="rolefilter" className="md:w-[150px] h-10 bg-white dark:bg-slate-800 dark:text-white border-b border-t border-e rounded-e-md text-gray-900 text-sm block w-full px-3 py-2 select-no-arrow" defaultValue={0}
                                        value={selectedPlatform}
                                        onChange={handlePlatformChange}
                                    >
                                        <option value="">Platform</option>
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
                                    <input type="text" id="search" name="search" className="w-full px-4 py-2 dark:bg-slate-800 dark:text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Search"
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
                                    <th scope="col" className="px-5 border dark:border-none py-3">No</th>
                                    <th scope="col" className="px-5 border dark:border-none py-3">Username</th>
                                    <th scope="col" className="px-5 border dark:border-none py-3">Client</th>
                                    <th scope="col" className="px-5 border dark:border-none py-3">Platform</th>
                                    <th scope="col" className="px-5 border dark:border-none py-3">Email</th>
                                    <th scope="col" className="px-5 border dark:border-none py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 dark:text-white">
                                    {
                                        filteredData.length > 0 ? filteredData.map((account, index) => {
                                            return (
                                                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-slate-400 hover:cursor-pointer dark:odd:bg-slate-600 dark:even:bg-slate-700 transition-colors duration-300" onClick={() => showModal("Edit", account._id)}>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{index + 1}</td>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap" onClick={() => showModal("Edit", account._id)}>{account.username}</td>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{account.client_name}</td>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{account.platform == 1 ? "Meta Ads" : account.platform == 2 ? "Google Ads" : "Tiktok Ads"}</td>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap"><a href={`mailto:${account.email
                                                    }`} className="text-blue-500 dark:text-blue-300">{account.email}</a></td>
                                                    <td scope="row" className="px-5 border dark:border-none py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{account.status == 1 ? "Active" : "Inactive"}</td>
                                                </tr>
                                            )
                                    }).slice(firstPage, lastPage) : (
                                        // Check user yang sudah difilter
                                        account.length > 0 ? (
                                            // Jika data tida ditemukan
                                            <tr className="text-center border">
                                                <td colSpan={8} className=" py-4">
                                                    Data not found
                                                </td>
                                            </tr>
                                        ) :
                                        (
                                            // Jika data ditemukan tapi masih loading
                                            <tr className="text-center py-3">
                                                <td colSpan={8}>
                                                    <LoadingCircle />
                                                </td>
                                            </tr>
                                        )
                                    )
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* Pagin */}
                        <style jsx>
                            {
                                `
                                    .paginDisable{
                                        opacity:0.5;
                                    }
                                `
                            }

                        </style>
                        <div className="w-full flex justify-between items-center mb-4">
                            <div className="mt-5 flex  gap-3 items-center w-full justify-end">
                                <button className="bg-white hover:bg-gray-100 border py-1.5 px-3 rounded inline-flex items-center" onClick={handleFristPageButton} ref={firstPageButton}>
                                    {"<<"}
                                </button>
                                <button className="bg-white hover:bg-gray-100 border py-1.5 px-3 rounded inline-flex items-center" onClick={handlePreviousButton} ref={previousButton}>
                                    {"<"}   
                                </button>
                                <div>
                                    <p>Page {currentPage} / {totalPages}</p>
                                </div>
                                <button className="bg-white hover:bg-gray-100 border py-1.5 px-3 rounded inline-flex items-center" onClick={handleNextButton} ref={nextButton}>
                                    {">"}
                                </button>
                                <button className="bg-white hover:bg-gray-100 border py-1.5 px-3 rounded inline-flex items-center" onClick={handleLastPageButton} ref={lastPageButton}>
                                {">>"}
                                </button>
                            </div>
                        </div>
                        {/* Pagin end */}
                    </div>
                    {/* Body end */}

                </div>
                {/* Main Card end */}
            </div>

            {/* <!-- Main modal --> */}
            <div id="crud-modal" ref={addModal} className="fixed inset-0 flex hidden items-center justify-center bg-gray-500 bg-opacity-75 z-50">

                <div className="relative p-4 w-full max-w-2xl max-h-full ">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-white rounded-lg shadow">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t bg-blue-500 text-white">
                            <h3 className="text-lg font-semibold ">
                                {`${modeModal} Account`}
                            </h3>
                            <button type="button" className="text-xl bg-transparent hover:bg-blue-400 rounded-lg  w-8 h-8 ms-auto inline-flex justify-center items-center " data-modal-toggle="crud-modal" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <div className="p-4 md:p-5">
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                <div className={`${userData.roles == "sadmin" ? "col-span-2" : "col-span-1"}`}>
                                    <label htmlFor="name" className="flex mb-2 text-sm font-medium text-gray-900 ">Account Name <div className="text-red-500">*</div> </label>
                                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Type account name here"
                                    required onChange={(e) => setValues({...values, name: e.target.value})}/>
                                    {
                                        error.name ? <p className="text-red-500 text-sm">{error.name}</p> : ""
                                    }
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="email" className="flex mb-2 text-sm font-medium text-gray-900 ">Email <div className="text-red-500">*</div></label>
                                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="example@gmail.com" required onChange={(e) => setValues({...values, email: e.target.value})}/>
                                    {
                                        error.email ? <p className="text-red-500 text-sm">{error.email}</p> : ""
                                    }
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="client" className="flex mb-2 text-sm font-medium text-gray-900">Client <div className="text-red-500">*</div> </label>
                                    <select id="client" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" defaultValue={""} onChange={(e) => setValues({...values, client: e.target.value})}>
                                        <option value="" disabled hidden>Select Client</option>
                                        {
                                            client.length > 0 ? client.map((client, index) => {
                                                return <option key={index} value={client._id}>{client.name}</option>
                                            }) : <option key={0} value={0}>Loading...</option>
                                        }
                                    </select>
                                    {
                                        error.client ? <p className="text-red-500 text-sm">{error.client}</p> : ""
                                    }
                                </div>

                                <div className="col-span-1" ref={tenantInput}>
                                    <label htmlFor="tenant" className="block mb-2 text-sm font-medium text-gray-900">Tenant</label>
                                    <select id="tenant" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5  ">
                                        {
                                            tenant.length > 0 ? tenant.map((tenant, index) => {
                                                return <option key={index} value={tenant._id}>{tenant.company}</option>
                                            }) : <option key={0} value={0}>Loading...</option>
                                        }
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label htmlFor="platform" className="flex mb-2 text-sm font-medium text-gray-900">Platform <div classname="text-red-500">*</div> </label>
                                    <select id="platform" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" defaultValue={""} onChange={(e) => setValues({...values, platform: e.target.value})}>
                                        <option value="" disabled hidden>Select platform</option>
                                        <option value="1">Meta Ads</option>z
                                        <option value="2">Google Ads</option>
                                        <option value="3">Tiktok Ads</option>
                                    </select>
                                    {
                                        error.platform ? <p className="text-red-500 text-sm">{error.platform}</p> : ""
                                    }
                                </div>
                                <div className="col-span-1" ref={passwordInput}>
                                    <label htmlFor="password" className="flex mb-2 text-sm font-medium text-gray-900 ">Password <div className="text-red-500">*</div></label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Type password here" required onChange={(e) => setValues({...values, password: e.target.value})}/>
                                        <button onClick={handleShowPassword} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" type="button">
                                            {showPassword ? <IoMdEye/> : <IoMdEyeOff/>}
                                        </button>
                                    </div>
                                    {
                                        error.password ? <p className="text-red-500 text-sm">{error.password}</p> : ""
                                    }
                                </div>
                                <div className="col-span-1" ref={passwordverifyInput}>
                                    <label htmlFor="passwordverify" className="flex mb-2 text-sm font-medium text-gray-900 ">Confirm Password <div className="text-red-500">*</div></label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="passwordverify" id="passwordverify" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Type password here" required onChange={(e) => setValues({...values, passwordverify: e.target.value})}/>
                                        <button onClick={handleShowPassword} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" type="button">
                                            {showPassword ? <IoMdEye/> : <IoMdEyeOff/>}
                                        </button>
                                    </div>
                                    {
                                        error.passwordverify ? <p className="text-red-500 text-sm">{error.passwordverify}</p> : ""
                                    }
                                </div>

                            </div>
                                <div className="flex justify-between items-end">
                                <div>
                                <label htmlFor="status" className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" id="status" name="status" className="sr-only peer"/>
                                <span className="me-3 text-sm font-medium text-gray-900">Status</span>
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                                    </div>
                                        
                                        {
                                            modeModal === 'Edit' ? <div className="flex gap-3">
                                                <button className="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-bold py-2 px-4 rounded text-nowrap" onClick={updateAccount}>Save Change</button>
                                                <button className="bg-red-500 hover:bg-red-700 mt-5 text-white font-bold py-2 px-4 rounded text-nowrap" onClick={() => handleDelete(EditaccountId)}><FaTrash/></button>
                                            </div>  : <button className="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-bold py-2 px-4 rounded" onClick={createAccount}>Submit</button>
                                                
                                        }
                                        
                                </div>  
                        </div>
                    </div>
                </div>
            </div> 
                                        
        </>
    )
}