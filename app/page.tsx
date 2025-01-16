"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Box, VStack } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useState } from "react";
import { eq } from "drizzle-orm";
import { usersTable } from "@/utlis/schema";
import { db } from "@/utlis/db";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircleIcon } from "lucide-react";
export default function Home() {
  const [name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading ,  setLoading] = useState(false);
  const { toast } = useToast()
  const handalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, Email));

      if (result.length > 0 && result[0].password === Password) {
       console.log("Successfully submitted")
      } else {
        console.log("Invalid password")
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      console.log("not  submitted")
    }
    setLoading(false)
  };

  return (
    <Box className="w-full h-full">
      <Box className=" absolute right-0 p-4">
        <ColorModeButton />
      </Box>
      <VStack h={"100vh"} justifyContent={"center"}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className=" text-2xl">Login to your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handalSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name of your project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Email</Label>
                  <Input
                    type="email"
                    id="name"
                    placeholder="Email of your project"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Password</Label>
                  <Box borderWidth={1} borderRadius={4}>
                    <PasswordInput
                      p={3}
                      value={Password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Box>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handalSubmit} type="submit" variant="default">
                {loading ? <LoaderCircleIcon/>  : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </VStack>
    </Box>
  );
}
