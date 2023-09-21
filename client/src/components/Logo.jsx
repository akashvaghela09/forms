import { SiGoogleforms  } from "react-icons/si";

const Logo = () => {
    return (
        <div className="flex justify-center items-baseline gap-2 p-4 w-fit">
            <SiGoogleforms className="text-indigo-500 text-4xl"/>
            <h1 className="text-4xl font-bold text-indigo-500">Forms</h1>
        </div>
    )
}

export default Logo;