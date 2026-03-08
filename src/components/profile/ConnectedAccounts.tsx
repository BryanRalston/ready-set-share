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
  addConnectedAccount,
  removeConnectedAccount,
  type ConnectedAccount,
} from '@/lib/social-accounts';

const PLATFORMS = [
  {
    key: 'instagram' as const,
    name: 'Instagram',
    icon: IoLogoInstagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    placeholder: 'your.username',
  },
  {
    key: 'pinterest' as const,
    name: 'Pinterest',
    icon: IoLogoPinterest,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    placeholder: 'your_username',
  },
  {
    key: 'facebook' as const,
    name: 'Facebook',
    icon: IoLogoFacebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    placeholder: 'your.page',
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
  const [editing, setEditing] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');

  useEffect(() => {
    setAccounts(getConnectedAccounts());
  }, []);

  const handleConnect = (platform: 'facebook' | 'instagram' | 'pinterest') => {
    const trimmed = usernameInput.trim().replace(/^@/, '');
    if (!trimmed) return;
    addConnectedAccount({
      platform,
      username: trimmed,
      connectedAt: new Date().toISOString(),
    });
    setAccounts(getConnectedAccounts());
    setEditing(null);
    setUsernameInput('');
  };

  const handleDisconnect = (platform: string) => {
    setDisconnecting(platform);
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
                ) : editing === platform.key ? (
                  <motion.div
                    key={`editing-${platform.key}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="py-2.5 px-3 rounded-xl bg-cream-50 border border-sage-200"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-8 h-8 rounded-full ${platform.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${platform.color}`} />
                      </div>
                      <span className="text-sm font-medium text-brown">{platform.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light/40 text-xs">@</span>
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder={platform.placeholder}
                          autoFocus
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-cream-200 bg-white text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-sage-300"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConnect(platform.key);
                            if (e.key === 'Escape') { setEditing(null); setUsernameInput(''); }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleConnect(platform.key)}
                        disabled={!usernameInput.trim()}
                        className="px-3 py-2 rounded-lg bg-sage-500 text-white text-xs font-medium disabled:opacity-40 transition-opacity"
                      >
                        Save
                      </button>
                    </div>
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
                    <button
                      onClick={() => { setEditing(platform.key); setUsernameInput(''); }}
                      className="text-[10px] text-sage-500 font-medium px-2 py-1 rounded-lg hover:bg-sage-50 transition-colors"
                    >
                      Add username
                    </button>
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
        Add your usernames so your landing page links to your profiles
      </motion.p>
    </Card>
  );
}
