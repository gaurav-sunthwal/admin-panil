import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Box, HStack, Spacer, Link, Text, Button } from "@chakra-ui/react";

export default function Navbar() {
  return (
    <Box
      as="nav"
      className="w-full"
      px={4}
      py={2}
    //   bg="gray.800"
    //   color="white"
      boxShadow="sm"
    >
      <HStack justifyContent={"space-between"} alignItems={"center"} w="100%">
        {/* Left Section: Sidebar Trigger or Logo */}
        <HStack gap={4}>
          <SidebarTrigger />
          <Text fontSize="xl" fontWeight="bold">
            Admin Panel
          </Text>
        </HStack>

        <HStack gap={4}>
          {/* Profile Avatar */}
          <Avatar />
        </HStack>
      </HStack>
    </Box>
  );
}
