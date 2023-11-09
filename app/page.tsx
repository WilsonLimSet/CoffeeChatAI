"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import { useChat } from "ai/react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export default function Page() {
  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const bioRef = useRef<null | HTMLDivElement>(null);
  const [coffeeChatsAided, setCoffeeChatsAided] = useState(0);
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: {
        vibe,
        bio,
      },
      onResponse() {
        scrollToBios();
        fetchUpdatedCounter().then(setCoffeeChatsAided);
      },
    });

  async function fetchUpdatedCounter() {
    const response = await fetch("/api/counter-coffee", {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    const data = await response.json();
    return data; // Make sure this is the updated counter value..
  }

  useEffect(() => {
    // Function to fetch the updated counter
    const fetchUpdatedCounter = async () => {
      const response = await fetch('/api/counter-coffee', { cache: 'no-store' } );
      const data = await response.json();
      if (typeof data === 'number') {
        setCoffeeChatsAided(data);
      } else {
        console.error('Expected a number but received:', data);
      }
    };

    if (!isLoading) {
      // When isLoading is false, call the function to fetch the updated counter
      fetchUpdatedCounter();
    }
    // This effect should run every time isLoading changes.
  }, [isLoading]);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setBio(input);
    console.log("Bio before handleSubmit :", input); // Log the 'input' directly
    handleSubmit(e);
  };

  const lastMessage = messages[messages.length - 1];
  const generatedBios =
    lastMessage?.role === "assistant" ? lastMessage.content : null;

  useEffect(() => {
    if (bio) {
      console.log("Bio after state update:", bio);
      // Perform any action that depends on the updated bio value
    }
  }, [bio]);

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mt-4">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Generate questions for your Coffee Chats
        </h1>
        <p className="text-slate-500 mt-5">
          {coffeeChatsAided} coffee chats aided so far.
        </p>
        <form className="max-w-xl w-full" onSubmit={onSubmit}>
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Copy a short bio about the person you are meeting.
            </p>
          </div>
          <textarea
            value={input}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. Patrick Collison (born 9 September 1988) is an Irish billionaire entrepreneur. He is the co-founder and CEO of Stripe, which he started with his younger brother, John, in 2010."
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>

          {!isLoading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              type="submit"
            >
              Generate your questions &rarr;
            </button>
          )}
          {isLoading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <span className="loading">
                <span style={{ backgroundColor: "white" }} />
                <span style={{ backgroundColor: "white" }} />
                <span style={{ backgroundColor: "white" }} />
              </span>
            </button>
          )}
        </form>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <output className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated questions
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split("2.")
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast("Bio copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </output>
      </main>
      <Footer />
    </div>
  );
}
