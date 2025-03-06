import { useContext, useEffect, useRef, useState } from "react"
import { DataContext } from "../../context/DataContext"
import '../../globalStyling/components.less'
import './friends.less'
import FriendForm from './components/FriendForm/FriendForm'
import PendingList from './components/PendingList/PendingList'
import OutGoingList from './components/OutGoingList/OutGoingList'
import FriendsList from './components/FriendsList/FriendsList'

const Friends = () => {

    return (
        <section className="section-friends">
            <FriendForm />

            <div className="lists-container">
                <PendingList />
                <OutGoingList />
                <FriendsList />
            </div>
        </section>
    )
}
 
export default Friends