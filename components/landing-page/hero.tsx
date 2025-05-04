import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section
      className="bg-[url(https://dashboi-one.vercel.app/images/home/hero-bg.png)] bg-cover bg-no-repeat relative "
      id="home"
    >
      <div className="bg-white dark:bg-[#0F172A]">
        <div className="container">
          <div className=" relative z-10 h-screen flex items-center">
            <div className="w-full">
              <div>
                <h1 className="max-w-[600px] mx-auto text-xl md:text-2xl xl:text-4xl xl:leading-[52px] font-semibold  text-center">
                  <span className="text-blue-700">MINDNAMO</span>
                </h1>
              </div>
              <div>
                <p className="text-base leading-7 md:text-lg md:leading-8 text-default-700 text-center mt-5 max-w-[800px] mx-auto">
                  Counselling is the beginning of self-understanding - in a
                  world clouded by anxiety, stress, and confusion, it guides you
                  inward.
                </p>
              </div>
              <div className="flex mt-9 justify-center gap-4 lg:gap-8">
                <Button
                  asChild
                  size="xl"
                  className="bg-blue-700 hover:bg-blue-500"
                >
                  <Link href="/login">Login</Link>
                </Button>

                <Button
                  asChild
                  size="xl"
                  className="bg-blue-700 hover:bg-blue-500"
                >
                  <Link href="/register">Signup</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
