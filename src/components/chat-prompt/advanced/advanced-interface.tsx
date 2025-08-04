import React, { useState } from 'react';
import { VersionCompareView } from './compare/version-compare-view';
import { MessageDatasetView } from './dataset/message-dataset-view';
import { AdvancedSidebar } from './advanced-sidebar';
import { RatingScaleView } from "./rating/rating-scale-view";
import { AnalyticsOverview } from "./analytics/analytics-overview";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronRight, GitCompare, MessageCircle, Star, ChartLine, LogOut, Undo2 } from 'lucide-react';
import Link from "next/link";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { usePromptStore } from '@/lib/store/prompt';
import { useAdvancedStore } from '@/lib/store/advanced';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const sidebarItems = [
	{
		item: "版本比對",
		title: "版本比較對話框",
		key: "version",
		icon: () => <GitCompare />,
		component: <VersionCompareView />
	},
	{
		item: "訊息測試集",
		title: "訊息測試集設定介面",
		key: "messages",
		icon: () => <MessageCircle />,
		component: <MessageDatasetView />
	},
	{
		item: "量表設定",
		title: "量表設定內容",
		key: "rating",
		icon: () => <Star />,
		component: <RatingScaleView />
	},
	{
		item: "數據分析",
		title: "數據分析內容",
		key: "analytics",
		icon: () => <ChartLine />,
		dropdown: [
			{ item: "總覽", title: "數據分析總覽內容", key: "overview", component: <AnalyticsOverview /> },
			{ item: "量表", title: "數據分析總覽內容", key: "scale", component: <div>訊息量表內容</div>},
			{ item: "報表", title: "數據分析圖表內容", key: "charts", component: <div>訊息報表內容</div>},
		],
	},
];

export const AdvancedInterface = () => {
  const [analyticsDropdown, setAnalyticsDropdown] = useState('overview');
  const { setIsInCompareView, setIsCompareMode, clearCompareSelectedVersions, clearCompareModelMessages, setCompareVersions, setInitialVersionOrder, setShowVersionHistory } = usePromptStore();
	const { isRatingInProgress, setIsRatingInProgress, selectedView, setSelectedView } = useAdvancedStore();

	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

	const handleExitCompare = () => {
		setIsInCompareView(false);
		setIsCompareMode(false);
		clearCompareSelectedVersions();
		clearCompareModelMessages();
		setCompareVersions([]);
		setInitialVersionOrder([]);
		setShowVersionHistory(false);
	}

	const handleNavigation = (navigationAction: () => void) => {
		if (isRatingInProgress) {
			setPendingNavigation(() => navigationAction);
			setIsAlertOpen(true);
		}
		else {
			navigationAction();
		}
	};

	const confirmNavigation = () => {
		if (pendingNavigation) {
			pendingNavigation();
		}
		setIsAlertOpen(false);
		setPendingNavigation(null);
		setIsRatingInProgress(false); // Forcefully reset the state
	};

	const cancelNavigation = () => {
		setIsAlertOpen(false);
		setPendingNavigation(null);
	};

  const sidebarMenu = (
    <SidebarGroup className="mt-[65px]">
      <SidebarGroupLabel>QC 區項目選單</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarItems.map((item) =>
            item.dropdown ? (
              <SidebarMenuItem key={item.key} className="-ml-3 -mt-2">
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarGroup>
                    <SidebarGroupLabel asChild>
                      <CollapsibleTrigger>
                        <span className="flex items-center justify-between text-base font-medium w-full">
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center text-white ml-1 pb-1" style={{ transform: 'scale(0.95)' }}>{item.icon()}</div>
                            <span className="text-white ml-1">{item.item}</span>
                          </span>
                          <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </span>
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent className="mt-2">
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {item.dropdown.map((sub) => (
                            <SidebarMenuItem key={sub.key}>
                              <SidebarMenuButton
                                onClick={() => handleNavigation(() => {
                                  setSelectedView(item.key);
                                  setAnalyticsDropdown(sub.key);
                                })}
                                className={`pl-8 text-md h-7 ${selectedView === item.key && analyticsDropdown === sub.key ? 'bg-muted font-semibold' : ''}`}
                              >
                                <span>{sub.item}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  onClick={() => {
                    if (item.key === 'version') {
                      setSelectedView(item.key);
                    }
					else {
                      handleNavigation(() => setSelectedView(item.key));
                    }
                  }}
                  className={`text-base font-medium ${selectedView === item.key ? 'bg-muted' : ''}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-white" style={{ transform: 'scale(0.9)' }}>{item.icon()}</div>
                  <span className="ml-1">{item.item}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <AdvancedSidebar sidebar={sidebarMenu}>
      <div className="flex flex-row items-center w-full h-16 px-2">
        <SidebarTrigger className="w-12 h-12" />
        <div className="flex items-center h-full text-xl font-semibold ml-2">
          {selectedView === "analytics"
            ? sidebarItems.find(v => v.key === "analytics")?.dropdown?.find(sub => sub.key === analyticsDropdown)?.title
            : sidebarItems.find(v => v.key === selectedView)?.title}
        </div>
		{/* 退出按鈕 */}
		<div className="pt-1 flex-shrink-0 ml-auto mr-3">
			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.2 }}
				>
					<Button onClick={() => handleNavigation(handleExitCompare)} className="w-26 h-9 text-xs">
						<Undo2  className="w-4 h-4 pb-[2px]" />
						返回 RD 區
					</Button>
				</motion.div>
			</AnimatePresence>
		</div>
      </div>

      <div className="w-full border-b border-2 border-gray-900" />

	  {/* 顯示內容 */}
      <div className="flex-1 w-full h-full">
		  {(() => {
			  const selectedItem = sidebarItems.find(v => v.key === selectedView);
			  if (!selectedItem) return null;

			  if (selectedItem.dropdown) {
				  const subItem = selectedItem.dropdown.find(sub => sub.key === analyticsDropdown);
				  return subItem ? subItem.component : null;
			  } else {
				  return selectedItem.component;
			  }
		  })()}
      </div>

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="bg-black border-gray-800">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-white">警告：評分正在進行中</AlertDialogTitle>
						<AlertDialogDescription className="text-gray-300">
							您正在對一個或多個版本進行評分。<br />如果現在離開，所有未儲存的評分資料將會遺失，你確定要離開嗎？
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={confirmNavigation} className="bg-red-600 hover:bg-red-700">
							離開
						</AlertDialogAction>
						<AlertDialogCancel onClick={cancelNavigation} className="text-gray-300 border-gray-800 hover:bg-gray-900">
							取消
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
    </AdvancedSidebar>
  );
};
