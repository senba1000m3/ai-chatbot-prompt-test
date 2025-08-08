"use client"

import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, User, Sun, Monitor, RotateCcw, ChevronRight } from "lucide-react"
import { usePromptStore } from "@/lib/store/prompt"
import { useLoginStore } from "@/lib/store/prompt-login"

export function Header() {
	const router = useRouter();
	const params = useParams();
	const assemblyId = params?.id;
	const { isInCompareView } = usePromptStore();
	const { nickname, testAreas } = useLoginStore();

	const currentTestAreaName = testAreas.find(area => area.id === assemblyId)?.name || "未知";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <h1 className="text-xl font-bold text-white"><button onClick={() =>{
			  router.push("/dashboard")
		  }}>TAI 工廠</button></h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
			  <Home className="w-4 h-4" />
			  <button onClick={() =>{
				  router.push(`./${assemblyId}`)
			  }}>{`【${currentTestAreaName}】 產線`}</button>
			  <ChevronRight className="w-4 h-4" />
			  <span> {isInCompareView ? "QC 區" : "RD 區"} </span>
            {/*<span>中文直書作文</span>*/}
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>{nickname}</span>
          </div>
			<ThemeToggle />
        </motion.div>
      </div>
    </motion.header>
  )
}
