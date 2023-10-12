import React, { useCallback, useState } from "react";
import Onboard, { WalletState } from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";

import SendTransaction from "./SendTransaction";

/**
 * 2. Wallet Connection
 * We start by checking the console logs.
 * We notice that the issue is found on the "Navigation" component in the "handleConnect" promise.
 * We take a look at the "Onboard" namespace and we see that it relies on the "@web3-onboard" module.
 * We check the official docs https://onboard.blocknative.com/docs/overview/introduction.
 * We observe that we lack the "injected" item from the wallets Array and we add it.
 */

const injected = injectedModule();

const onboard = Onboard({
    wallets: [injected],
    chains: [
        {
            id: "123456",
            token: "ETH",
            label: "Local Ganache",
            rpcUrl: "http://localhost:8545",
        },
    ],
});

const Navigation: React.FC = () => {
    const [wallet, setWallet] = useState<WalletState>();

    const handleConnect = useCallback(async () => {
        const wallets = await onboard.connectWallet();

        const [metamaskWallet] = wallets;

        if (
            metamaskWallet.label === "MetaMask" &&
            metamaskWallet.accounts[0].address
        ) {
            setWallet(metamaskWallet);
        }
    }, []);

    /**
     * 6. UI
     *  We rely on Tailwind docs to unveil the hidden button https://tailwindcss.com/docs/visibility#collapsing-elements
     */

    return (
        <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-ful text-sm py-4 bg-gray-800">
            <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center justify-between">
                    <a
                        className="flex-none text-xl font-semibold dark:text-white"
                        href="."
                    >
                        Transactions List
                    </a>
                </div>
                <div className="overflow-hidden transition-all duration-300 basis-full grow sm:block">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:pl-5">
                        {wallet && (
                            <>
                                <SendTransaction
                                    senderAddress={wallet.accounts[0].address}
                                />
                                <p className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 text-sm">
                                    {wallet.accounts[0].address}
                                </p>
                            </>
                        )}
                        {!wallet && (
                            <button
                                type="button"
                                onClick={handleConnect}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 hover:text-white hover:bg-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all text-sm"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navigation;
