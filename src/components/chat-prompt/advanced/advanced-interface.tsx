import React, { useState } from 'react';
import { VersionCompareView } from './version-compare-view';
import { AdvancedSidebar } from './advanced-sidebar';
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
import { ChevronRight, GitCompare, MessageCircle, ChartLine} from 'lucide-react';
import Link from "next/link";

const items = [
  {
    "title": "版本比對",
    "content": "版本比較對話框",
    "key": "version",
    "icon": () => <GitCompare />,
  },
  {
    "title": "訊息瀏覽",
    "content": "訊息瀏覽內容",
    "key": "messages",
    "icon": () => <MessageCircle />,
  },
  {
    "title": "數據分析",
    "content": "數據分析內容",
    "key": "analytics",
    "icon": () => <ChartLine />,
    "dropdown": [
      { "title": "總覽", "content": "數據分析總覽內容", "key": "overview" },
      { "title": "圖表", "content": "數據分析圖表內容", "key": "charts" },
    ],
  },
];

export const AdvancedInterface = () => {
  const [selected, setSelected] = useState('version');
  const [analyticsDropdown, setAnalyticsDropdown] = useState('overview');

  const sidebarMenu = (
    <SidebarGroup className="mt-[65px]">
      <SidebarGroupLabel>QC 區項目選單</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) =>
            item.dropdown ? (
              <SidebarMenuItem key={item.key} className="-ml-3 -mt-2">
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarGroup>
                    <SidebarGroupLabel asChild>
                      <CollapsibleTrigger>
                        <span className="flex items-center justify-between text-base font-medium w-full">
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center text-white ml-1" style={{ transform: 'scale(0.95)' }}>{item.icon()}</div>
                            <span className="text-white ml-1">{item.title}</span>
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
                                onClick={() => {
                                  setSelected(item.key);
                                  setAnalyticsDropdown(sub.key);
                                }}
                                className={`pl-8 text-md h-7 ${selected === item.key && analyticsDropdown === sub.key ? 'bg-muted font-semibold' : ''}`}
                              >
                                <span>{sub.title}</span>
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
                  onClick={() => setSelected(item.key)}
                  className={`text-base font-medium ${selected === item.key ? 'bg-muted' : ''}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-white" style={{ transform: 'scale(0.9)' }}>{item.icon()}</div>
                  <span className="ml-1">{item.title}</span>
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
          {selected === "analytics"
            ? items.find(v => v.key === "analytics")?.dropdown?.find(sub => sub.key === analyticsDropdown)?.content
            : items.find(v => v.key === selected)?.content}
        </div>
      </div>
      <div className="w-full border-b border-2 border-gray-900" />

	  {/* 顯示內容 */}
      <div className="flex-1 w-full h-full">
        {selected === 'version' && <VersionCompareView />}
        {selected === 'messages' && <div>訊息瀏覽內容</div>}
        {selected === 'analytics' && (
          analyticsDropdown === 'overview' ? <div>數據分析總覽內容</div> : <div>數據分析圖表內容</div>
        )}
      </div>
    </AdvancedSidebar>
  );
};
