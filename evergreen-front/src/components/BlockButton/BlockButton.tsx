import { FC } from "react"
import "./BlockButton.css"

interface IBlockButton {
    onclick: () => void;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const BlockButton: FC<IBlockButton> = ({
    onclick,
    backgroundColor,
    borderColor,
    textColor,
    disabled,
    children,
}) => {
    return (
        <button
            type="button"
            className="block-button"
            disabled={disabled}
            onClick={onclick}
            style={{
                background: backgroundColor,
                borderColor,
                color: textColor,
            }} 
        >
            {children}
        </button>
    )
}

export default BlockButton