
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import NavbarClient from "./NavbarClient";
import Link from "next/link";

const Navbar =  async () => {
  const { getUser } = getKindeServerSession();
  const  user  =  await getUser();

  return (
    <div >
      {/* Left side: Home */}
    

      {/* Right side: Signup, Login, Create Case */}

      <NavbarClient user={user}/>
        
      
    </div>
  );
};

export default Navbar;
