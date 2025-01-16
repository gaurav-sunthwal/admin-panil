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
import { useState, useEffect } from "react";
import { eq } from "drizzle-orm";
import { usersTable } from "@/utlis/schema";
import { db } from "@/utlis/db";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
        duration: 3000,
      });
      router.push("/dashboard");
    }
  }, [router, toast]);

  const handalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, Email));

      if (result.length > 0 && result[0].password === Password) {
        // Successful login
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
          duration: 3000,
        });

        // Store email and password in localStorage
        localStorage.setItem("email", Email);
        localStorage.setItem("password", Password);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Invalid login
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  return (
    <Box className="w-full h-full">
      <Box className="absolute right-0 p-4">
        <ColorModeButton />
      </Box>
      <VStack h={"100vh"} justifyContent={"center"}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl">Login to your Account</CardTitle>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Email of your project"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Box borderWidth={1} borderRadius={4}>
                    <PasswordInput
                      p={3}
                      id="password"
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
            <Button onClick={handalSubmit} type="submit" variant="default" disabled={loading}>
              {loading ? <LoaderCircleIcon /> : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </VStack>
    </Box>
  );
}