import React from "react";
import NewForm from "./components/NewForm";
import RecentForms from "./components/RecentForms";

function Home() {
    return (
        <>
            <NewForm />
            <RecentForms />
        </>
    )
}

export default Home;