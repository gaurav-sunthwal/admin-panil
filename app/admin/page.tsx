"use client";

import React from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/appsidebar";
import Navbar from "./_components/Navbar";
import { Home } from "./_components/Home";
export default function page() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full h-full">
          <Navbar />
          <div className="p-3">
            <Home />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
