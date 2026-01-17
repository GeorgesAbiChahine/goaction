import LoginButton from "@/components/login-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import Link from "next/link";


export default async function Page() {
  // biome-ignore lint/nursery/useAwaitThenable: auth0.getSession() in recent SDKs returns a Promise
  const session = await auth0.getSession();
  const user = session?.user;

  if (!session) {
    return <div>
      <div className="text-4xl pb-5 text-center font-(family-name:--font-instrument-serif)">goAction</div>
      <Card className="max-w-md w-[320px]">
        <CardHeader>
          <CardTitle className="text-center">Welcome, Log in or Sign Up</CardTitle>
          <CardDescription className="text-center">Get ready for your life to get easier.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  }

  return <div>
    <div className="text-4xl pb-5 text-center font-(family-name:--font-instrument-serif)">goAction</div>
    <Card className="max-w-md w-[320px]">
      <CardHeader>
        <CardTitle className="text-center">Welcome, {user?.name}</CardTitle>
        <CardDescription className="text-center">Get ready for your life to get easier.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginButton />
      </CardContent>
    </Card>
  </div>
}