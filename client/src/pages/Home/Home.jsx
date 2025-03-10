import Message from "../../components/Message/Message"
import Sidebar from "../../components/Sidebar/Sidebar"
import HeroImage from "./components/HeroImage/HeroImage"
import './home.less'
import hero from "../../img/hero.png"
import { Link } from "react-router-dom"

const Home = () => {
    return (
        <section className="section-hero">
            {/* <HeroImage /> */}
            <div className="hero-textbox">
                <div className="title-box">
                    <h2 className="title">Chat with your friends - anywhere, anytime</h2>
                    <p className="text">Your best place to chat, chill and gather memories with your friends</p>
                </div>

                <Link to='/login' className="btn">Chat now</Link>
            </div>

            <img className="hero-image" src={hero} alt="" />
        </section>
    )
}

export default Home