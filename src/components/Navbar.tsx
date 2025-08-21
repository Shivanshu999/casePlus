
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import NavbarClient from "./NavbarClient";

const Navbar =  async () => {
  const { getUser } = getKindeServerSession();
  const  user  =  await getUser();

  return (
    <div >


      <NavbarClient user={user}/>
        
      
    </div>
  );
};

export default Navbar;
