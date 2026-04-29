import React, { useState } from 'react';
import WalletConnectModal from './WalletConnectModal';
import WalletDropdown from './WalletDropdown';
import styles from './ConnectButton.module.css';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ onConnect, onDisconnect }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleConnectClick = () => {
    setConnectionState('disconnected');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleConnectFreighter = async () => {
    setConnectionState('connecting');
    setErrorMessage('');
    
    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.2) {
        const mockAddress = 'GB3K4Y5QYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQ';
        setWalletAddress(mockAddress);
        setConnectionState('connected');
        setIsModalOpen(false);
        onConnect?.(mockAddress);
      } else {
        throw new Error('Connection rejected by user');
      }
    } catch (error) {
      setConnectionState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const handleDisconnect = () => {
    setConnectionState('disconnected');
    setWalletAddress('');
    setIsDropdownOpen(false);
    onDisconnect?.();
  };

  const handleRetry = () => {
    setConnectionState('disconnected');
    setErrorMessage('');
  };

  const getButtonText = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      case 'error':
        return 'Connect wallet';
      default:
        return 'Connect wallet';
    }
  };

  const getButtonState = () => {
    if (connectionState === 'connecting') return 'connecting';
    if (connectionState === 'connected') return 'connected';
    if (connectionState === 'error') return 'error';
    return 'disconnected';
  };

  return (
    <>
      <button 
        className={`${styles.connectButton} ${styles[getButtonState()]}`}
        onClick={connectionState === 'connected' ? () => setIsDropdownOpen(!isDropdownOpen) : handleConnectClick}
        disabled={connectionState === 'connecting'}
        aria-label={connectionState === 'connected' ? `Wallet connected: ${walletAddress}` : 'Connect wallet'}
        aria-busy={connectionState === 'connecting'}
      >
        {connectionState === 'connecting' && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        {getButtonText()}
      </button>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnectFreighter={handleConnectFreighter}
        connectionState={connectionState}
        errorMessage={errorMessage}
        onRetry={handleRetry}
      />

      {connectionState === 'connected' && (
        <WalletDropdown
          isOpen={isDropdownOpen}
          address={walletAddress}
          onClose={() => setIsDropdownOpen(false)}
          onDisconnect={handleDisconnect}
        />
      )}
    </>
  );
};

export default ConnectButton;
