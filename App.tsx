import React, { useState, useEffect, useRef } from 'react';
import { RootNavigator } from './src/navigation';
import { NetworkErrorModal } from './src/components';
import { useNetworkStatus } from './src/hooks';

function App(): React.JSX.Element {
  const { isConnected, checkConnection } = useNetworkStatus();
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected === false) {
      setShowNetworkModal(true);
    } else if (isConnected === true) {
      setShowNetworkModal(false);
      setIsReconnecting(false);
      setRetryCount(0);
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
    };
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setRetryCount(prev => prev + 1);

    const connected = await checkConnection();

    if (connected) {
      setShowNetworkModal(false);
      setIsReconnecting(false);
      setRetryCount(0);
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    } else {
      setIsReconnecting(false);
      setShowNetworkModal(false);
      setTimeout(() => setShowNetworkModal(true), 100);
    }
  };

  return (
    <>
      <RootNavigator />
      <NetworkErrorModal
        visible={showNetworkModal}
        onReconnect={handleReconnect}
        isReconnecting={isReconnecting}
        retryCount={retryCount}
      />
    </>
  );
}

export default App;
