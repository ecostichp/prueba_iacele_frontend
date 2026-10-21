import { LoginForm } from "@/components/login-form"
import miLogo from '@/assets/brand/Logo2021.png';
import miLogoNegativo from '@/assets/brand/LogoNegativo2021.png';

export default function Login() {
    return (

        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">

            <div className="w-full max-w-sm">
                <div className="dark:bg-neutral-900 rounded-lg p-4">
                    <img
                        className="mx-auto max-h-24 w-auto block dark:hidden"
                        src={miLogo}
                        alt="La Casa Del Carpintero"
                    />
                    <img
                        className="mx-auto max-h-24 w-auto hidden dark:block"
                        src={miLogoNegativo}
                        alt="La Casa Del Carpintero"
                    />
                </div>
                <LoginForm />
            </div>
        </div>
    )
}
