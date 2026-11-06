import { useRouteError, Link } from "react-router";
import miLogo from '@/assets/brand/Logo2021.png';
import miLogoNegativo from '@/assets/brand/LogoNegativo2021.png';
import { Button } from "@/components/ui/button";

export default function ErrorPage() {

  const error = useRouteError();


  return (

    <div className="flex flex-col items-center mt-12">

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

      <h2 className="my-12 text-5xl font-bold text-foreground">
        ¡Ups!
      </h2>

      <p className="text-muted-foreground">
        No encontramos la página que buscas
      </p>

      <i className="mt-1 text-xs text-muted-foreground">
        {error.statusText || error.message}
      </i>

      <div className="mt-12">
        <Button render={<Link to="/" />}>
          Sácame de aquí
        </Button>
      </div>

    </div>

  )
}
