"use client";
import buildApiCaller from "@/hook/apiHook.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "../general/customToast.tsx";
import { setSession } from "@/store/session/sessionSlice.ts";
import { useDispatch } from "react-redux";
import { redirect } from "next/navigation";
import { LOCALSTORAGE_NAME_IS_LOGGED_IN } from "@/utils/constants.ts";
import { RootState } from "@/store/store.ts";
import { useSelector } from "react-redux";
import { TypeSession } from "@shared/types.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

// Infer the type from the schema
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  // form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // form submission
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session.session);
  const { showToast } = useToast();
  const { isLoading: isLoadingLogin, fetchData: login } = buildApiCaller<
    any,
    TypeAPIBody<TypeSession>
  >("/auth/login");
  const onSubmit = (data: FormData) => {
    login({
      method: "POST",
      body: data,
      callback: (result, isError) => {
        if (isError) {
          showToast("error", result?.displayMessage || "");
        } else {
          dispatch(setSession(result.data));
        }
      },
    });
  };

  // if session is finally set, redirect to dashboard
  useEffect(() => {
    if (session) {
      localStorage.setItem(LOCALSTORAGE_NAME_IS_LOGGED_IN, "true");
      showToast("success", "Login success, redirecting...");
      redirect("/dashboard");
    }
  }, [session]);

  // password hide
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="4">
        {/* Email Input */}
        <Flex direction="column" gap="1">
          <TextField.Root
            {...register("email")}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            required
          />
          {errors.email && (
            <Text color="red" size="2">
              {errors.email.message}
            </Text>
          )}
        </Flex>

        {/* Password Input */}
        <TextField.Root
          {...register("password")}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        >
          <TextField.Slot side="right">
            <Button
              variant="ghost"
              size="1"
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </Button>
          </TextField.Slot>
        </TextField.Root>

        {/* Login Button */}
        <Button
          loading={isLoadingLogin}
          type="submit"
          className="w-full p-3 mt-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Login
        </Button>
      </Flex>
    </form>
  );
}
