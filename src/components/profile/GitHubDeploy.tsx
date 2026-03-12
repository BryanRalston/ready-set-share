'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  IoLogoGithub,
  IoGlobeOutline,
  IoRocketOutline,
  IoRefreshOutline,
  IoCheckmarkCircle,
  IoLinkOutline,
  IoCloseCircleOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoOpenOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { useUser } from '@/lib/user-context';
import {
  getGitHubToken,
  setGitHubToken,
  removeGitHubToken,
  getGitHubRepo,
  validateToken,
  deployToGitHubPages,
  slugifyRepoName,
} from '@/lib/github';
import { generateLandingHTML } from '@/lib/landing-generator';
import { getPhotos, type LibraryPhoto } from '@/lib/photo-library';
import { getConnectedAccounts } from '@/lib/social-accounts';

const DEPLOY_TIMESTAMP_KEY = 'biz-social-github-last-deploy';

type SetupStep = 'instructions' | 'token-input' | 'success';
type DeployState = 'idle' | 'deploying' | 'success' | 'error';

export default function GitHubDeploy() {
  const { businessName, businessDescription, businessType } = useUser();

  // Core state
  const [hasToken, setHasToken] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [deployedRepo, setDeployedRepo] = useState<{ owner: string; repo: string; pagesUrl: string } | null>(null);
  const [lastDeployed, setLastDeployed] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Setup flow state
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('instructions');
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Deploy state
  const [deployState, setDeployState] = useState<DeployState>('idle');
  const [deployError, setDeployError] = useState('');
  const [repoNameInput, setRepoNameInput] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');

  // Load state from localStorage
  useEffect(() => {
    const token = getGitHubToken();
    const repo = getGitHubRepo();
    const timestamp = localStorage.getItem(DEPLOY_TIMESTAMP_KEY);

    setHasToken(!!token);
    setDeployedRepo(repo);
    setLastDeployed(timestamp);

    // If we have a token, validate it to get the username
    if (token) {
      validateToken(token).then(result => {
        if (result.valid && result.login) {
          setGithubUsername(result.login);
        }
      });
    }

    setMounted(true);
  }, []);

  // Auto-generate repo name from business name
  useEffect(() => {
    if (businessName && !repoNameInput) {
      setRepoNameInput(slugifyRepoName(businessName));
    }
  }, [businessName, repoNameInput]);

  const handleValidateToken = useCallback(async () => {
    if (!tokenInput.trim()) {
      setValidationError('Please enter your token.');
      return;
    }

    setValidating(true);
    setValidationError('');

    const result = await validateToken(tokenInput.trim());

    if (result.valid && result.login) {
      setGitHubToken(tokenInput.trim());
      setHasToken(true);
      setGithubUsername(result.login);
      setSetupStep('success');
      setTokenInput('');
    } else {
      setValidationError(result.error || 'Invalid token.');
    }

    setValidating(false);
  }, [tokenInput]);

  const handleDisconnect = useCallback(() => {
    if (window.confirm('Disconnect GitHub? Your deployed site will remain live, but you won\'t be able to update it from here.')) {
      removeGitHubToken();
      setHasToken(false);
      setGithubUsername('');
      setDeployedRepo(null);
      setShowSetup(false);
      setSetupStep('instructions');
      localStorage.removeItem(DEPLOY_TIMESTAMP_KEY);
    }
  }, []);

  const handleDeploy = useCallback(async () => {
    const token = getGitHubToken();
    if (!token) return;

    const repoName = repoNameInput.trim() || slugifyRepoName(businessName || 'my-business-site');

    setDeployState('deploying');
    setDeployError('');

    try {
      // Gather data for the landing page
      let photos: LibraryPhoto[] = [];
      try {
        photos = await getPhotos();
      } catch {
        // IndexedDB unavailable
      }

      const socialAccounts = getConnectedAccounts();
      const socialLinks = socialAccounts
        .filter(a => a.username)
        .map(a => ({ platform: a.platform, username: a.username }));

      // Use thumbnails for smaller file size, fall back to full base64
      const photoData = photos.slice(0, 6).map(p => ({
        base64: p.thumbnail || p.base64,
        name: p.name,
      }));

      // Generate the HTML
      const html = generateLandingHTML({
        businessName: businessName || 'My Business',
        businessDescription: businessDescription || '',
        businessType: businessType || 'other',
        photos: photoData,
        socialLinks,
      });

      // Deploy
      const result = await deployToGitHubPages(token, repoName, html);

      if (result.success && result.url) {
        setDeployState('success');
        setDeployedUrl(result.url);
        setDeployedRepo({ owner: githubUsername, repo: repoName, pagesUrl: result.url });
        const now = new Date().toISOString();
        setLastDeployed(now);
        localStorage.setItem(DEPLOY_TIMESTAMP_KEY, now);
      } else {
        setDeployState('error');
        setDeployError(result.error || 'Deployment failed.');
      }
    } catch {
      setDeployState('error');
      setDeployError('An unexpected error occurred.');
    }
  }, [repoNameInput, businessName, businessDescription, businessType, githubUsername]);

  if (!mounted) return null;

  // Format last deployed time
  const formatDeployTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' +
        d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  // ==========================================
  // State 1: No token set
  // ==========================================
  if (!hasToken) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <IoLogoGithub className="w-4 h-4 text-sage-500" />
          <h3 className="font-semibold text-brown text-sm">Publish Your Website</h3>
        </div>

        <AnimatePresence mode="wait">
          {!showSetup ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="text-xs text-brown-light mb-3 leading-relaxed">
                Deploy your landing page to the web — free, on your own GitHub account.
                Your site gets a real URL you can share anywhere.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowSetup(true)}
              >
                <IoLogoGithub className="w-4 h-4" />
                Connect GitHub
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-4">
                {(['instructions', 'token-input', 'success'] as SetupStep[]).map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        setupStep === step
                          ? 'bg-sage-500 text-white'
                          : i < ['instructions', 'token-input', 'success'].indexOf(setupStep)
                            ? 'bg-sage-200 text-sage-600'
                            : 'bg-cream-200 text-brown-light'
                      }`}
                    >
                      {i < ['instructions', 'token-input', 'success'].indexOf(setupStep) ? (
                        <IoCheckmarkCircle className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < 2 && <div className="w-8 h-px bg-cream-200" />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Instructions */}
                {setupStep === 'instructions' && (
                  <motion.div
                    key="instructions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h4 className="text-sm font-medium text-brown mb-2">Create a GitHub Token</h4>
                    <ol className="text-xs text-brown-light space-y-2 mb-4 list-decimal list-inside">
                      <li>
                        Go to{' '}
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo&description=ReadySetShare%20Website%20Deploy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sage-500 underline font-medium"
                        >
                          GitHub Token Settings
                        </a>
                      </li>
                      <li>Make sure <strong>&quot;repo&quot;</strong> scope is checked</li>
                      <li>Click <strong>&quot;Generate token&quot;</strong></li>
                      <li>Copy the token (starts with <code className="bg-cream-100 px-1 rounded text-[10px]">ghp_</code>)</li>
                    </ol>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => { setShowSetup(false); setSetupStep('instructions'); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setSetupStep('token-input')}
                      >
                        Next
                        <IoChevronForwardOutline className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Token input */}
                {setupStep === 'token-input' && (
                  <motion.div
                    key="token-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h4 className="text-sm font-medium text-brown mb-2">Paste Your Token</h4>
                    <div className="relative mb-2">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={tokenInput}
                        onChange={(e) => { setTokenInput(e.target.value); setValidationError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidateToken()}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        aria-label="GitHub personal access token"
                        className="w-full text-sm px-3 py-2 pr-9 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300 font-mono"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        aria-label={showToken ? 'Hide token' : 'Show token'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
                      >
                        {showToken ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                      </button>
                    </div>

                    {validationError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mb-2 flex items-center gap-1"
                      >
                        <IoCloseCircleOutline className="w-3.5 h-3.5 flex-shrink-0" />
                        {validationError}
                      </motion.p>
                    )}

                    <p className="text-[10px] text-brown-light/70 mb-3">
                      Your token is stored locally in your browser. It is never sent to our servers.
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => setSetupStep('instructions')}
                      >
                        <IoChevronBackOutline className="w-3.5 h-3.5" />
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={handleValidateToken}
                        loading={validating}
                      >
                        {validating ? 'Verifying...' : 'Connect'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {setupStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-2"
                  >
                    <IoCheckmarkCircle className="w-10 h-10 text-sage-500 mx-auto mb-2" />
                    <h4 className="text-sm font-medium text-brown mb-1">Connected!</h4>
                    <p className="text-xs text-brown-light mb-3">
                      Signed in as <span className="font-medium text-brown">{githubUsername}</span>
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => { setShowSetup(false); setSetupStep('instructions'); }}
                    >
                      Done
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  // ==========================================
  // State 3: Deployed (token set + deployed repo)
  // ==========================================
  if (deployedRepo && lastDeployed) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <IoGlobeOutline className="w-4 h-4 text-sage-500" />
          <h3 className="font-semibold text-brown text-sm">Your Website</h3>
          <Badge variant="sage" className="ml-auto">
            <IoCheckmarkCircle className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>

        {/* Live URL */}
        <a
          href={deployedRepo.pagesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-sage-50 border border-sage-200 hover:bg-sage-100 transition-colors mb-3 group"
        >
          <IoLinkOutline className="w-4 h-4 text-sage-500 flex-shrink-0" />
          <span className="text-sm text-sage-600 font-medium truncate flex-1">
            {deployedRepo.pagesUrl.replace('https://', '')}
          </span>
          <IoOpenOutline className="w-3.5 h-3.5 text-sage-400 group-hover:text-sage-600 transition-colors flex-shrink-0" />
        </a>

        {/* GitHub info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-brown-light">
          <IoLogoGithub className="w-3.5 h-3.5" />
          <span>{githubUsername}</span>
          <span className="text-cream-300">|</span>
          <span>Last updated {formatDeployTime(lastDeployed)}</span>
        </div>

        {/* Deploy status after re-deploy */}
        <AnimatePresence>
          {deployState === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-600">
                <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
                Website updated! Changes may take a minute to go live.
              </div>
            </motion.div>
          )}

          {deployState === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                <IoCloseCircleOutline className="w-4 h-4 flex-shrink-0" />
                {deployError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleDeploy}
            loading={deployState === 'deploying'}
          >
            <IoRefreshOutline className="w-3.5 h-3.5" />
            {deployState === 'deploying' ? 'Updating...' : 'Update Website'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-brown-light"
            onClick={handleDisconnect}
          >
            <IoTrashOutline className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    );
  }

  // ==========================================
  // State 2: Token set, not deployed yet
  // ==========================================
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <IoRocketOutline className="w-4 h-4 text-sage-500" />
        <h3 className="font-semibold text-brown text-sm">Deploy Your Website</h3>
      </div>

      {/* Connected account info */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-cream-50 border border-cream-200">
        <IoLogoGithub className="w-4 h-4 text-brown" />
        <span className="text-sm text-brown font-medium flex-1">{githubUsername}</span>
        <Badge variant="sage">
          <IoCheckmarkCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      </div>

      {/* Repo name */}
      <div className="mb-3">
        <label className="text-xs text-brown-light mb-1.5 block">Repository Name</label>
        <input
          type="text"
          value={repoNameInput}
          onChange={(e) => setRepoNameInput(
            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          )}
          placeholder="my-business-site"
          className="w-full text-sm px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-brown focus:outline-none focus:ring-2 focus:ring-sage-300 font-mono"
        />
        {repoNameInput && githubUsername && (
          <p className="text-[10px] text-brown-light/70 mt-1">
            Your site will be at: <span className="font-medium">{githubUsername}.github.io/{repoNameInput}</span>
          </p>
        )}
      </div>

      {/* Deploy status */}
      <AnimatePresence>
        {deployState === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="px-3 py-2.5 rounded-xl bg-sage-50 border border-sage-200">
              <div className="flex items-center gap-2 text-xs text-sage-600 mb-1.5">
                <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Deployed successfully!</span>
              </div>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-sage-500 hover:text-sage-600"
              >
                <IoLinkOutline className="w-3.5 h-3.5" />
                {deployedUrl}
              </a>
              <p className="text-[10px] text-brown-light/60 mt-1">
                It may take a minute for the site to go live.
              </p>
            </div>
          </motion.div>
        )}

        {deployState === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              <IoCloseCircleOutline className="w-4 h-4 flex-shrink-0" />
              {deployError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy button */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleDeploy}
          loading={deployState === 'deploying'}
        >
          <IoRocketOutline className="w-3.5 h-3.5" />
          {deployState === 'deploying' ? 'Deploying...' : 'Deploy Website'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-brown-light"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    </Card>
  );
}
