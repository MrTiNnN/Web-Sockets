import "./nav.less"
import { useState } from "react"

const Nav = () => {

    const [sticky, setSticky] = useState(false);

    // STICKY
    const handleSticky = () => {
        if (!sticky && window.scrollY > 50) setSticky(true)
        if (sticky && window.scrollY < 50) setSticky(false)
    }

    window.addEventListener('scroll', handleSticky)

    return (
        <>
            <div className="nav">
                <div className="logo">Logo</div>
                <div>

                </div>
            </div>
        </>
    )
}

export default Nav

