"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  return (
    <main className="flex flex-col  px-[10rem] justify-center gap-4xl">
      <h1 className="font-instrument-serif text-4xl">Welcome to Brokwise</h1>
      <p>Access your account and continue your journey with us</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size={"lg"}>
            Login
          </Button>
        </form>
      </Form>

      <div className="text-right">
        <Link href="/forgot-password">Forgot Password?</Link>
      </div>
      <div className="flex items-center gap-2 flex-col w-full relative">
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 left-0"></div>
        <span className="text-gray-500 z-10">Or continue with</span>
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 right-0"></div>
      </div>
      <Button size={"lg"} variant="outline" className="w-full">
        Google
      </Button>
      <div>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </div>
    </main>
  );
};

export default LoginPage;
