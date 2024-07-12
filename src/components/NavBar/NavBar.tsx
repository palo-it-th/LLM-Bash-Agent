'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavBar = () => {
  const pathName = usePathname()

  return (
    <nav className="">
      <div className="px-4">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden"></div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Image
                height={32}
                width={127}
                src="https://www.palo-it.com/hubfs/colour_logo.svg"
                alt="Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  href="/one-shot"
                  className={`px-3 py-2 font-medium ${pathName === '/' || pathName === '/one-shot' ? 'text-[#F57D2B]' : null}  hover:text-green-500`}
                  aria-current="page"
                >
                  One Shot
                </Link>
                <Link
                  href="/react"
                  className={`px-3 py-2 font-medium ${pathName === '/react' ? 'text-[#F57D2B]' : null}  hover:text-green-500`}
                  aria-current="page"
                >
                  ReAct
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
