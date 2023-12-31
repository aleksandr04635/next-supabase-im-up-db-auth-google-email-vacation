// pages/homes/[id].js
import { useRouter } from "next/router";

import Image from "next/image";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import { prisma } from "@/lib/prisma";

const ListedHome = (home = null) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [ownerEmail, setOwnerEmail] = useState(null); //my
  const [isOwner, setIsOwner] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const deleteHome = async () => {
    let toastId;
    try {
      toastId = toast.loading("Deleting...");
      setDeleting(true);
      // Delete home from DB
      await axios.delete(`/api/homes/${home.id}`);
      // Redirect user
      toast.success("Successfully deleted", { id: toastId });
      router.push("/homes");
    } catch (e) {
      console.log(e);
      toast.error("Unable to delete home", { id: toastId });
      setDeleting(false);
    }
  };

  //checks if the owner of a home record is a current user
  useEffect(() => {
    (async () => {
      if (session?.user) {
        console.log("session?.user:");
        console.log(session?.user);
        console.log("session?.user?.id:");
        console.log(session?.user?.id);
        try {
          const owner = await axios.get(`/api/homes/${home.id}/owner`);
          console.log("owner:");
          console.log(owner);
          console.log("owner?.data?.id:");
          console.log(owner?.data?.id);
          console.log("owner?.id:");
          console.log(owner?.id);
          // setIsOwner(owner?.id === session.user.id);//old version doestn't work
          setIsOwner(owner?.data?.id === session?.user?.id);
          console.log("isOwner:");
          console.log(isOwner);
          setOwnerEmail(owner?.data?.email);
        } catch (e) {
          setIsOwner(false);
        }
      }
    })();
  }, [session?.user]);
  //}, []);

  // Fallback version
  if (router.isFallback) {
    return "Loading...";
  }

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold truncate">
              {home?.title ?? ""}
            </h1>
            <ol className="inline-flex items-center space-x-1 text-gray-500">
              <li>
                <span>{home?.guests ?? 0} guests</span>
                <span aria-hidden="true"> · </span>
              </li>
              <li>
                <span>{home?.beds ?? 0} beds</span>
                <span aria-hidden="true"> · </span>
              </li>
              <li>
                <span>{home?.baths ?? 0} baths</span>
              </li>
            </ol>
          </div>
        </div>
        {/*  <p>ownerEmail={ownerEmail}</p>
         <p>isOswner={isOwner.toString()}</p>*/}
        <p>ownerEmail={ownerEmail}</p>
        <p>isOswner={isOwner.toString()}</p>
        {isOwner ? (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => router.push(`/homes/${home.id}/edit`)}
              className="px-4 py-1 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition rounded-md disabled:text-gray-800 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={deleteHome}
              className="..."
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
        <div className="mt-6 relative aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg shadow-md overflow-hidden">
          {home?.image ? (
            <Image
              src={home.image}
              alt={home.title}
              layout="fill"
              objectFit="cover"
            />
          ) : null}
        </div>
        <p className="mt-8 text-lg">{home?.description ?? ""}</p>
      </div>
    </Layout>
  );
};

export async function getStaticPaths() {
  // Get all the homes IDs from the database
  const homes = await prisma.home.findMany({
    select: { id: true },
  });

  return {
    paths: homes.map((home) => ({
      params: { id: home.id },
    })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  // Get the current home from the database - by id from querry params:
  const home = await prisma.home.findUnique({
    where: { id: params.id },
  });

  if (home) {
    return {
      props: JSON.parse(JSON.stringify(home)),
    };
  }
  //if nothing found:
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

export default ListedHome;
