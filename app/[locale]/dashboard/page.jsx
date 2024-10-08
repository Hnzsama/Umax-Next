'use client'

import { useState, useEffect, useRef, createContext } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"

// Components
import Navbar from "@/components/Client-components/Navbar"
import Sidebar from "@/components/Client-components/Sidebar"

// Dashboard Content
const Performance = dynamic(() => import('@/components/Client-components/Dashboard-content/Performance'))
import Metrics from "@/components/Client-components/Dashboard-content/Metrics"
import History from "@/components/Client-components/Dashboard-content/History"
import Setting from "@/components/Client-components/Dashboard-content/Setting"
import PerformenceNavLoading from "@/components/Client-components/Loading/PerformenceNavLoading"
import Image from "next/image"

export const SidebarContext = createContext()
// export const campaignIDContext = createContext()

function Dashboard() {

    // expanse card start
    const Card = useRef(null)
    const router = useRouter()
    const [campaignID, setCampaignID] = useState('');
    const [name, setName] = useState('');
    const [platform, setPlatform] = useState('');
    const [SidebarHide, setSidebarHide] = useState(false)
    const t = useTranslations('dashboard');

    const handleCampaignIDChange = (id, name, platform) => {
        setCampaignID(id);
        setName(name);
        setPlatform(platform);
    };

    // Dashborad Change Content Start
    const [activeContent, setActiveContent] = useState("performance")
    // Dashborad Change Content End

    // Dashboard Link active start
    function SetActiveLink(Link){
        document.querySelector(".dashboardActive").classList?.remove("dashboardActive");
        document.getElementById(Link).classList?.add("dashboardActive");
        setActiveContent(Link)
    }
    // Dashboard Link active end

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
        Swal.fire('Authentication failed', 'You Must Login First', 'error').then(() => {
            router.push('/en/login');
        });
        }
    }, [router]);

    return (
        <>
        {/* Header */}
        <Navbar />

        {/* Dashboard Container */}
        <div className="flex w-full min-h-full justify-end start bg-gray-100 dark:bg-slate-900">
        <Sidebar onCampaignIDChange={handleCampaignIDChange} sidebarHide={SidebarHide} setSidebarHide={setSidebarHide}/>
        {/* Dashboard Card */}
            <div className={`${SidebarHide ? 'w-full' : 'w-full sm:w-full md:w-full lg:w-full xl:w-[calc(100%-378px)] 2xl:w-[calc(100%-378px)]'} min-h-screen bg-white dark:bg-slate-800 rounded-xl mt-[100px] md:me-3 md:ms-5 text-black dark:text-white transition-transform`} ref={Card}>
                {/* header */}
                <div className="m-10">
                {campaignID === '' ? (
                    <PerformenceNavLoading />
                ) : (
                    <div className="flex gap-3 items-center md:flex-row flex-col">
                    <Image src={`../assets/${platform === 1 ? 'meta.svg' : platform === 2 ? 'google.svg' : platform === 3 ? 'tiktok.svg' : null}`} className="" width={40} height={40} alt="" />
                    <p className="text-2xl font-semibold">{name}</p>
                    </div>
                )}

                {/* Dashboard Nav Link */}
                  <div className="lg:flex hidden gap-7 mt-5 border-b-2 border-gray-300 dark:border-slate-600">
                      <style jsx>
                      {`
                          .dashboardActive {
                          color: rgb(38, 100, 235);
                          padding-bottom: 10px;
                          border-bottom: 3px solid blue;
                          font-weight: 800;
                          transition: background-color 0.5s, color 0.5s;
                          }
                          .DashboardLink:hover {
                          cursor: pointer;
                          }
                      `}
                      </style>
                      <p className={`DashboardLink font-semibold text-gray-500 dark:text-gray-300 text-[15px] ${activeContent === "performance" ? "dashboardActive" : ""}`} id="performance" onClick={() => SetActiveLink("performance")}>{t('performence')}</p>
                      <p className={`DashboardLink font-semibold text-gray-500 dark:text-gray-300 text-[15px] ${activeContent === "metrics" ? "dashboardActive" : ""}`} id="metrics" onClick={() => SetActiveLink("metrics")}>{t('metrics')}</p>
                      <p className={`DashboardLink font-semibold text-gray-500 dark:text-gray-300 text-[15px] ${activeContent === "history" ? "dashboardActive" : ""}`} id="history" onClick={() => SetActiveLink("history")}>{t('history')}</p>
                      <p className={`DashboardLink font-semibold text-gray-500 dark:text-gray-300 text-[15px] ${activeContent === "setting" ? "dashboardActive" : ""}`} id="setting" onClick={() => SetActiveLink("setting")}>{t('setting')}</p>
                  </div>
                </div>

                {/* Nav Select */}
                <div className="flex md:hidden justify-end m-10">
                  <select className="border w-full border-gray-300 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm p-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" onChange={(e) => SetActiveLink(e.target.value)}>
                      <option value="performance" selected={activeContent === "performance"}>{t('performence')}</option>
                      <option value="metrics" selected={activeContent === "metrics"}>{t('metrics')}</option>
                      <option value="history" selected={activeContent === "history"}>{t('history')}</option>
                      <option value="setting" selected={activeContent === "setting"}>{t('setting')}</option>
                  </select>
                </div>

                {/* Content */}
                <div className="m-10">
                  {activeContent === "performance" && <Performance key={campaignID} id={campaignID} />}
                  {activeContent === "metrics" && <Metrics key={campaignID} id={campaignID} />}
                  {activeContent === "history" && <History key={campaignID} id={campaignID} />}
                  {activeContent === "setting" && <Setting key={campaignID} id={campaignID} />}
                </div>
            </div>
        </div>

        </>
    )
}

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
