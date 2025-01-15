import { FC } from "react"
import "./OvalButton.css"

interface IOvalButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onclick: () => void;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    children: React.ReactNode;
}

const OvalButton: FC<IOvalButton> = ({
    onclick,
    backgroundColor,
    borderColor,
    textColor,
    children,
    ...props
}) => {
    return (
        <button
            className="button"
            type="button"
            onClick={onclick}
            style={{
                background: backgroundColor,
                borderColor,
                color: textColor,
            }} 
            {...props}
        >
            {children}
        </button>
    )
}

export default OvalButton