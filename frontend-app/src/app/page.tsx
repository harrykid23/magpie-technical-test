import LoginForm from "@/component/login/loginForm.tsx";
import { Card, Text } from "@radix-ui/themes";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Login Card */}
      <Card
        size="4"
        className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg border border-blue-100 relative z-10"
      >
        {/* App Logo or Name */}
        <div className="flex items-center justify-center mb-2">
          <Text
            as="div"
            size="6"
            weight="bold"
            className="text-blue-600"
            align="center"
            // style={{ fontFamily: "monospace" }}
          >
            Library Management System
          </Text>
        </div>

        {/* Login Title */}
        <Text
          as="div"
          size="4"
          weight="bold"
          align="center"
          className="mb-4 text-blue-600"
        >
          Welcome Back
        </Text>

        {/* Login Form */}
        <LoginForm />
      </Card>
    </div>
  );
}
