'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/data/routes';

/**
 * Magical floating store icon specifically for Desktop Hero.
 * Placed on the bottom right (over the floral bouquet) as requested.
 * Uses Framer Motion for a continuous, magical floating and glowing effect
 * independent of the hero's mouse parallax.
 */
export function HeroStoreIcon() {
  return (
    <div className="absolute right-[2%] bottom-[7%] z-30 hidden lg:block xl:right-[3%] xl:bottom-[9%] 2xl:right-[4%] 2xl:bottom-[10%]">
      <Link href={ROUTES.maison} aria-label="Mağaza'ya Git">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotateZ: [0, 3, -3, 0],
            filter: [
              'drop-shadow(0px 0px 8px rgba(255, 180, 80, 0.4))',
              'drop-shadow(0px 0px 20px rgba(255, 210, 100, 0.8))',
              'drop-shadow(0px 0px 8px rgba(255, 180, 80, 0.4))',
            ]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative h-28 w-28 transform-gpu cursor-pointer transition-transform duration-300 hover:scale-110 xl:h-32 xl:w-32"
        >
          <Image
            src="/home/hero/hero-store-icon.png"
            alt="Mağaza"
            fill
            className="object-contain brightness-75 contrast-110"
            sizes="(min-width: 1024px) 128px, 0vw"
          />
        </motion.div>
      </Link>
    </div>
  );
}
