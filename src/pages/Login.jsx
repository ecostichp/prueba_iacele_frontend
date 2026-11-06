import logo from "@/assets/brand/Logo2021.png";
import inverseLogo from "@/assets/brand/LogoNegativo2021.png";
import { LoginForm } from "@/components/LoginForm";

export default function Login() {
    return (

        <div className="flex justify-center items-center p-6 md:p-10 w-full min-h-svh">

            <div className="w-full max-w-sm">
                <div className="dark:bg-neutral-900 p-4 rounded-lg">
                    <img
                        className="dark:hidden block mx-auto w-auto max-h-24"
                        src={logo}
                        alt="La Casa Del Carpintero"
                    />
                    <img
                        className="hidden dark:block mx-auto w-auto max-h-24"
                        src={inverseLogo}
                        alt="La Casa Del Carpintero"
                    />
                </div>
                <LoginForm />
            </div>
        </div>
    )
}
