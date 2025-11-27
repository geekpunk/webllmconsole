import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import LoadingScreen from './LoadingScreen';
import AboutModal from './AboutModal';

const AppLayout = () => {
    const {
        currentChatId,
        isFirstTimeUser,
        completeFTUE,
        areDefaultModelsReady,
        downloadProgress,
        loadingTargetModelId
    } = useChat();

    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        if (isFirstTimeUser) {
            setShowAbout(true);
        }
    }, [isFirstTimeUser]);

    const handleAboutClose = () => {
        setShowAbout(false);
        completeFTUE();
    };

    // If it's first time user, show About Modal (and maybe loading screen behind it or after)
    // The requirement: "On first time user experience they should see the about modal, and then the loading screen should load and block out any other interactions until the 2 models are ready to be used."

    // Logic:
    // 1. If isFirstTimeUser -> Show About Modal. (Blocking everything else? Or just overlay?)
    //    Let's make AboutModal overlay everything.
    // 2. When AboutModal closes -> isFirstTimeUser becomes false.
    // 3. If !isFirstTimeUser AND !areDefaultModelsReady -> Show LoadingScreen.

    // We can render the main app structure always, and overlay these screens.

    return (
        <>
            <div className={`app-layout ${currentChatId ? 'chat-active' : ''}`}>
                <div className="sidebar-container">
                    <ChatList />
                </div>
                <main className="main-container">
                    <ChatWindow />
                </main>
            </div>

            {/* Overlays */}
            {/* Overlays */}
            {(!areDefaultModelsReady || loadingTargetModelId) && (
                <LoadingScreen
                    downloadProgress={downloadProgress}
                    onContinue={() => { }}
                    areModelsReady={areDefaultModelsReady}
                    targetModelIds={loadingTargetModelId ? [loadingTargetModelId] : null}
                />
            )}

            {isFirstTimeUser && areDefaultModelsReady && !loadingTargetModelId && (
                <AboutModal
                    isOpen={showAbout}
                    onClose={handleAboutClose}
                />
            )}
        </>
    );
};

export default AppLayout;
