'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoPinterest,
  IoLinkOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import {
  getConnectedAccounts,
  removeConnectedAccount,
  type ConnectedAccount,
} from '@/lib/social-accounts';

const PLATFORMS = [
  {
    key: 'facebook' as const,
    name: 'Facebook',
    icon: IoLogoFacebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'instagram' as const,
    name: 'Instagram',
    icon: IoLogoInstagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    key: 'pinterest' as const,
    name: 'Pinterest',
    icon: IoLogoPinterest,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const slideIn = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    setAccounts(getConnectedAccounts());
  }, []);

  const handleDisconnect = (platform: string) => {
    setDisconnecting(platform);
    // Brief delay for animation
    setTimeout(() => {
      removeConnectedAccount(platform);
      setAccounts(getConnectedAccounts());
      setDisconnecting(null);
    }, 300);
  };

  const getAccountForPlatform = (platform: string): ConnectedAccount | undefined => {
    return accounts.find(a => a.platform === platform);
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <IoLinkOutline className="w-4 h-4 text-brown-light" />
        <h3 className="font-semibold text-brown text-sm">Connected Accounts</h3>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {PLATFORMS.map((platform) => {
          const account = getAccountForPlatform(platform.key);
          const isConnected = !!account;
          const isBeingDisconnected = disconnecting === platform.key;
          const Icon = platform.icon;

          return (
            <motion.div
              key={platform.key}
              variants={slideIn}
              layout
            >
              <AnimatePresence mode="wait">
                {isConnected && !isBeingDisconnected ? (
                  <motion.div
                    key={`connected-${platform.key}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-sage-50 border border-sage-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${platform.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${platform.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-brown">{platform.name}</span>
                          <IoCheckmarkCircle className="w-3.5 h-3.5 text-sage-500" />
                        </div>
                        <span className="text-[10px] text-brown-light">@{account.username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(platform.key)}
                      className="text-[10px] text-brown-light hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`disconnected-${platform.key}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-cream-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-brown-light" />
                      </div>
                      <span className="text-sm text-brown-light">{platform.name}</span>
                    </div>
                    <span className="text-[10px] text-brown-light italic">Coming soon</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[10px] text-brown-light text-center mt-3"
      >
        Direct posting coming soon — for now, copy your captions and post directly
      </motion.p>
    </Card>
  );
}
